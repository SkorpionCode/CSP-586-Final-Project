# app.py
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from models import db, User, Stream, Follow, Report, ChatMessage, Notification

# Initialize SocketIO with CORS allowed origins for development
socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    app = Flask(__name__)
    # App configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///streaming.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change this in production!

    CORS(app)

    # Initialize extensions
    db.init_app(app)
    JWTManager(app)
    socketio.init_app(app)

    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()

    # ---------------------
    # Authentication Endpoints
    # ---------------------
    @app.route('/signup', methods=['POST'])
    def signup():
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        if User.query.filter((User.username == username) | (User.email == email)).first():
            return jsonify({'msg': 'User already exists'}), 400
        hashed_password = generate_password_hash(password)
        user = User(username=username, email=email, password=hashed_password)
        db.session.add(user)
        db.session.commit()
        return jsonify({'msg': 'Account created successfully'}), 201

    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        user = User.query.filter_by(username=username).first()
        if not user or not check_password_hash(user.password, password):
            return jsonify({'msg': 'Invalid credentials'}), 401
        if user.suspended:
            return jsonify({'msg': 'Account suspended'}), 403
        access_token = create_access_token(identity=user.id)
        return jsonify({'access_token': access_token, 'role': user.role, 'user_id': user.id}), 200

    @app.route('/logout', methods=['POST'])
    @jwt_required()
    def logout():
        return jsonify({'msg': 'Logged out successfully'}), 200

    # ---------------------
    # Viewer Endpoints
    # ---------------------
    @app.route('/streams', methods=['GET'])
    def browse_streams():
        category = request.args.get('category')
        query = Stream.query
        if category:
            query = query.filter_by(category=category)
        streams = query.all()
        result = [{
            'id': s.id,
            'title': s.title,
            'category': s.category,
            'tags': s.tags,
            'is_live': s.is_live,
            'streamer_id': s.streamer_id
        } for s in streams]
        return jsonify(result), 200

    @app.route('/stream/<int:stream_id>', methods=['GET'])
    def watch_stream(stream_id):
        stream = Stream.query.get_or_404(stream_id)
        result = {
            'id': stream.id,
            'title': stream.title,
            'category': stream.category,
            'tags': stream.tags,
            'is_live': stream.is_live,
            'channel_info': stream.channel_info
        }
        return jsonify(result), 200

    @app.route('/follow', methods=['POST'])
    @jwt_required()
    def follow_streamer():
        user_id = get_jwt_identity()
        data = request.get_json()
        streamer_id = data.get('streamer_id')
        follow = Follow(viewer_id=user_id, streamer_id=streamer_id)
        db.session.add(follow)
        db.session.commit()
        return jsonify({'msg': 'Now following the streamer'}), 200

    @app.route('/report', methods=['POST'])
    @jwt_required()
    def report_content():
        user_id = get_jwt_identity()
        data = request.get_json()
        stream_id = data.get('stream_id')
        description = data.get('description')
        report = Report(reporter_id=user_id, stream_id=stream_id, description=description)
        db.session.add(report)
        db.session.commit()
        return jsonify({'msg': 'Report submitted'}), 200

    @app.route('/profile', methods=['GET', 'PUT'])
    @jwt_required()
    def customize_profile():
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        if request.method == 'PUT':
            data = request.get_json()
            user.profile_picture = data.get('profile_picture', user.profile_picture)
            user.bio = data.get('bio', user.bio)
            db.session.commit()
            return jsonify({'msg': 'Profile updated'}), 200
        else:
            result = {
                'username': user.username,
                'email': user.email,
                'profile_picture': user.profile_picture,
                'bio': user.bio,
                'role': user.role
            }
            return jsonify(result), 200

    @app.route('/become-streamer', methods=['POST'])
    @jwt_required()
    def become_streamer():
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        user.role = 'streamer'
        db.session.commit()
        return jsonify({'msg': 'You are now a streamer'}), 200

    @app.route('/chat/<int:stream_id>', methods=['GET', 'POST'])
    @jwt_required()
    def chat_in_stream(stream_id):
        if request.method == 'POST':
            data = request.get_json()
            message_text = data.get('message')
            user_id = get_jwt_identity()
            chat_message = ChatMessage(stream_id=stream_id, user_id=user_id, message=message_text)
            db.session.add(chat_message)
            db.session.commit()
            # Broadcast chat message to clients in the room
            socketio.emit('chat', {
                'stream_id': stream_id,
                'user_id': user_id,
                'message': message_text,
                'timestamp': chat_message.timestamp.isoformat()
            }, room=f'stream_{stream_id}')
            return jsonify({'msg': 'Message sent'}), 200
        else:
            messages = ChatMessage.query.filter_by(stream_id=stream_id).order_by(ChatMessage.timestamp).all()
            result = [{
                'id': m.id,
                'user_id': m.user_id,
                'message': m.message,
                'timestamp': m.timestamp.isoformat()
            } for m in messages]
            return jsonify(result), 200

    # ---------------------
    # Streamer Endpoints
    # ---------------------
    @app.route('/stream/setup', methods=['POST'])
    @jwt_required()
    def stream_setup():
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if user.role not in ['streamer', 'admin']:
            return jsonify({'msg': 'Unauthorized action'}), 403
        data = request.get_json()
        title = data.get('title')
        category = data.get('category')
        tags = data.get('tags')
        schedule = data.get('schedule')  # expects ISO format string
        channel_info = data.get('channel_info')
        new_stream = Stream(
            title=title,
            category=category,
            tags=tags,
            schedule=datetime.fromisoformat(schedule) if schedule else None,
            streamer_id=user_id,
            channel_info=channel_info
        )
        db.session.add(new_stream)
        db.session.commit()
        return jsonify({'msg': 'Stream setup completed', 'stream_id': new_stream.id}), 201

    @app.route('/stream/go-live/<int:stream_id>', methods=['POST'])
    @jwt_required()
    def go_live(stream_id):
        user_id = get_jwt_identity()
        stream = Stream.query.get_or_404(stream_id)
        if stream.streamer_id != user_id:
            return jsonify({'msg': 'Unauthorized action'}), 403
        stream.is_live = True
        db.session.commit()
        return jsonify({'msg': 'Stream is now live'}), 200

    @app.route('/channel/customize', methods=['PUT'])
    @jwt_required()
    def customize_channel():
        user_id = get_jwt_identity()
        data = request.get_json()
        stream_id = data.get('stream_id')
        stream = Stream.query.filter_by(id=stream_id, streamer_id=user_id).first()
        if not stream:
            return jsonify({'msg': 'Stream not found'}), 404
        stream.channel_info = data.get('channel_info', stream.channel_info)
        db.session.commit()
        return jsonify({'msg': 'Channel page customized'}), 200

    @app.route('/stream/schedule', methods=['POST'])
    @jwt_required()
    def schedule_stream():
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if user.role not in ['streamer', 'admin']:
            return jsonify({'msg': 'Unauthorized action'}), 403
        data = request.get_json()
        title = data.get('title')
        category = data.get('category')
        tags = data.get('tags')
        schedule = data.get('schedule')
        new_stream = Stream(
            title=title,
            category=category,
            tags=tags,
            schedule=datetime.fromisoformat(schedule) if schedule else None,
            streamer_id=user_id
        )
        db.session.add(new_stream)
        db.session.commit()
        return jsonify({'msg': 'Stream scheduled', 'stream_id': new_stream.id}), 201

    # ---------------------
    # Admin Endpoints
    # ---------------------
    @app.route('/admin/reports', methods=['GET'])
    @jwt_required()
    def review_reports():
        admin_id = get_jwt_identity()
        admin = User.query.get(admin_id)
        if admin.role != 'admin':
            return jsonify({'msg': 'Unauthorized action'}), 403
        reports = Report.query.all()
        result = [{
            'id': r.id,
            'reporter_id': r.reporter_id,
            'stream_id': r.stream_id,
            'description': r.description,
            'created_at': r.created_at.isoformat()
        } for r in reports]
        return jsonify(result), 200

    @app.route('/admin/suspend/<int:user_id>', methods=['POST'])
    @jwt_required()
    def suspend_account(user_id):
        admin_id = get_jwt_identity()
        admin = User.query.get(admin_id)
        if admin.role != 'admin':
            return jsonify({'msg': 'Unauthorized action'}), 403
        user = User.query.get_or_404(user_id)
        user.suspended = True
        db.session.commit()
        return jsonify({'msg': f'User {user.username} has been suspended'}), 200

    @app.route('/admin/notifications', methods=['POST'])
    @jwt_required()
    def platform_notifications():
        admin_id = get_jwt_identity()
        admin = User.query.get(admin_id)
        if admin.role != 'admin':
            return jsonify({'msg': 'Unauthorized action'}), 403
        data = request.get_json()
        message = data.get('message')
        notification = Notification(message=message)
        db.session.add(notification)
        db.session.commit()
        # Broadcast notification to all clients
        socketio.emit('notification', {
            'message': message,
            'created_at': notification.created_at.isoformat()
        })
        return jsonify({'msg': 'Notification sent'}), 200

    # ---------------------
    # Socket.IO Event Handlers
    # ---------------------
    @socketio.on('join')
    def handle_join(data):
        room = data.get('room')
        join_room(room)
        emit('notification', {'message': f'User has joined {room}'}, room=room)

    @socketio.on('leave')
    def handle_leave(data):
        room = data.get('room')
        leave_room(room)
        emit('notification', {'message': f'User has left {room}'}, room=room)

    @socketio.on('chat')
    def handle_chat(data):
        room = data.get('room')
        message = data.get('message')
        user_id = data.get('user_id')
        timestamp = datetime.utcnow().isoformat()
        emit('chat', {
            'room': room,
            'user_id': user_id,
            'message': message,
            'timestamp': timestamp
        }, room=room)

    return app

if __name__ == '__main__':
    app = create_app()
    # Run using Socket.IO
    socketio.run(app, debug=True)
