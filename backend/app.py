# app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from models import db, User, Stream, Follow, Report, ChatMessage, Notification
import os
import logging

# Initialize SocketIO with CORS allowed origins for development
socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    app = Flask(__name__)

    logging.basicConfig(level=logging.DEBUG)

    # App configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///streaming.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change this in production!

    CORS(app, resources={r"/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    socketio.init_app(app)

    # Create database tables if they don't exist
    with app.app_context():
        #db.drop_all()
        db.create_all()

    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return jsonify({'msg': 'Missing or invalid authorization header'}), 422

    @jwt.invalid_token_loader
    def invalid_token_response(callback):
        return jsonify({'msg': 'Invalid token'}), 422

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'msg': 'Token has expired'}), 422
    
    # --- Serve HLS files from the /hls folder ---
    @app.route('/live/<path:filename>')
    def live_stream(filename):
        # Adjust the folder path if needed
        hls_folder = os.path.join(os.getcwd(), 'hls')
        return send_from_directory(hls_folder, filename)

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
        return jsonify({'msg': 'Account created successfully', 'role': user.role, 'user_id': user.id, 'username': user.username, 'email': user.email}), 201

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
        return jsonify({'access_token': access_token, 'role': user.role, 'user_id': user.id, 'username': user.username, 'email': user.email}), 200

    @app.route('/logout', methods=['POST'])
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
            'channel_info': stream.channel_info,
            'stream_url': stream.stream_url
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
    def report_content():
        data = request.get_json()

        username = data.get('username')
        stream_title = data.get('stream_title')
        reported_username = data.get('reported_username')
        description = data.get('description')

        if not username:
            return jsonify({'error': 'Username is required'}), 400

        reporter_user = User.query.filter_by(username=username).first()
        if not reporter_user:
            return jsonify({'error': 'Reporter user not found'}), 404

        reporter_id = reporter_user.id

        stream_id = None
        reported_user_id = None

        if stream_title:
            stream = Stream.query.filter_by(title=stream_title).first()
            if stream:
                stream_id = stream.id
            else:
                return jsonify({'error': 'Stream not found'}), 404

        if reported_username:
            reported_user = User.query.filter_by(username=reported_username).first()
            if reported_user:
                reported_user_id = reported_user.id
            else:
                return jsonify({'error': 'User not found'}), 404

        if stream_id is None and reported_user_id is None:
            return jsonify({'error': 'Stream title or username required'}), 400

        if reported_user_id and reporter_id == reported_user_id:
                return jsonify({'msg': 'You cannot report yourself.'}), 400

        try:
            report = Report(
                reporter_id=reporter_id,
                stream_id=stream_id,
                reported_user_id=reported_user_id,
                description=description,
            )
            db.session.add(report)
            db.session.commit()

            return jsonify({'message': 'Report submitted successfully'}), 200

        except Exception as e:
            db.session.rollback()
            logging.error(f"Error submitting report: {e}")
            return jsonify({'error': 'Failed to submit report'}), 500

    @app.route('/profile', methods=['GET', 'PUT'])
    def customize_profile():
        data = request.get_json()
        username = data.get('username')
        user = User.query.filter_by(username=username).first()
        user_id = user.id
        if request.method == 'PUT':
            try:
                #data = request.get_json(force=True)
                user.profile_picture = data.get('profile_picture', user.profile_picture)
                user.bio = data.get('bio', user.bio)
                db.session.commit()
                return jsonify({'msg': 'Profile updated'}), 200
            except Exception as e:
                app.logger.error("Error updating profile for user %s: %s", user_id, str(e))
                return jsonify({'msg': 'Error updating profile', 'error': str(e)}), 500
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
    def become_streamer():
        data = request.get_json()
        username = data.get('username')
        user = User.query.filter_by(username=username).first()
        user.role = 'streamer'
        db.session.commit()
        return jsonify({'msg': 'You are now a streamer'}), 200

    @app.route('/become-admin', methods=['POST'])
    def become_admin():
        data = request.get_json()
        username = data.get('username')
        user = User.query.filter_by(username=username).first()
        user.role = 'admin'
        db.session.commit()
        return jsonify({'msg': 'You are now an admin'}), 200

    @app.route('/chat/<int:stream_id>', methods=['GET', 'POST'])
    def chat_in_stream(stream_id):
        if request.method == 'POST':
            data = request.get_json()
            message_text = data.get('message')
            username = data.get('username')
            user = User.query.filter_by(username=username).first()
            chat_message = ChatMessage(stream_id=stream_id, user_id=user.id, message=message_text)
            db.session.add(chat_message)
            db.session.commit()
            # Broadcast chat message to clients in the room
            socketio.emit('chat', {
                'stream_id': stream_id,
                'user_id': user.id,
                'username': username,
                'message': message_text,
                'timestamp': chat_message.timestamp.isoformat()
            }, room=f'stream_{stream_id}')
            return jsonify({'msg': 'Message sent'}), 200
        else:
            messages = ChatMessage.query.filter_by(stream_id=stream_id).order_by(ChatMessage.timestamp).all()
            result = [{
                'id': m.id,
                'user_id': m.user_id,
                # If m.sender exists, you might return m.sender.username;
                # otherwise, fallback to "Unknown" or similar.
                'username': m.sender.username if m.sender else 'Unknown',
                'message': m.message,
                'timestamp': m.timestamp.isoformat()
            } for m in messages]
            return jsonify(result), 200

    # ---------------------
    # Streamer Endpoints
    # ---------------------
    @app.route('/stream/setup', methods=['POST'])
    def stream_setup():
        data = request.get_json()
        username = data.get('username')
        user = User.query.filter_by(username=username).first()
        user_id = user.id
        if user.role not in ['streamer', 'admin']:
            return jsonify({'msg': 'Unauthorized action'}), 403
        title = data.get('title')
        category = data.get('category')
        tags = data.get('tags')
        schedule = data.get('schedule')  # ISO string expected
        channel_info = data.get('channel_info')
        stream_url = data.get('stream_url')  # Optional, user can pre-configure
        new_stream = Stream(
            title=title,
            category=category,
            tags=tags,
            schedule=datetime.fromisoformat(schedule) if schedule else None,
            streamer_id=user_id,
            channel_info=channel_info,
            stream_url=stream_url
        )
        db.session.add(new_stream)
        db.session.commit()
        return jsonify({'msg': 'Stream setup completed', 'stream_id': new_stream.id}), 201

    @app.route('/stream/go-live/<int:stream_id>', methods=['POST'])
    def go_live(stream_id):
        data = request.get_json()
        username = data.get('username')
        user = User.query.filter_by(username=username).first()
        user_id = user.id
        stream = Stream.query.get_or_404(stream_id)
        if stream.streamer_id != user_id:
            return jsonify({'msg': 'Unauthorized action'}), 403
        stream.is_live = True
        hls_url = f"http://localhost/hls/stream_{stream_id}.m3u8"
        stream.stream_url = hls_url
        db.session.commit()
        return jsonify({'msg': 'Stream is now live', 'stream_url': stream.stream_url}), 200
    
    @app.route('/stream/stop/<int:stream_id>', methods=['POST'])
    def stop_stream(stream_id):
        data = request.get_json()
        username = data.get('username')
        user = User.query.filter_by(username=username).first()
        user_id = user.id
        stream = Stream.query.get_or_404(stream_id)
        if stream.streamer_id != user_id:
            return jsonify({'msg': 'Unauthorized action'}), 403
        stream.is_live = False
        stream.stream_url = None
        db.session.commit()
        return jsonify({'msg': 'Stream has ended.'}), 200
    
    @app.route('/channel/customize', methods=['PUT'])
    def customize_channel():
        data = request.get_json()
        username = data.get('username')
        user = User.query.filter_by(username=username).first()
        user_id = user.id
        stream_id = data.get('stream_id')
        stream = Stream.query.filter_by(id=stream_id, streamer_id=user_id).first()
        if not stream:
            return jsonify({'msg': 'Stream not found'}), 404
        stream.channel_info = data.get('channel_info', stream.channel_info)
        db.session.commit()
        return jsonify({'msg': 'Channel page customized'}), 200

    @app.route('/stream/schedule', methods=['POST'])
    def schedule_stream():
        data = request.get_json()
        username = data.get('username')
        user = User.query.filter_by(username=username).first()
        user_id = user.id
        if user.role not in ['streamer', 'admin']:
            return jsonify({'msg': 'Unauthorized action'}), 403
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
    def review_reports():
        username = request.args.get('username')

        if not username:
            return jsonify({'msg': 'Username is required'}), 400

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({'msg': 'User not found'}), 404

        if user.role != 'admin':
            return jsonify({'msg': 'Unauthorized action'}), 403

        active_reports = Report.query.filter_by(active=True).all()
        inactive_reports = Report.query.filter_by(active=False).all()

        def format_report(r):
            reporter_user = db.session.get(User, r.reporter_id)
            reported_user = db.session.get(User, r.reported_user_id) if r.reported_user_id else None
            stream = db.session.get(Stream, r.stream_id) if r.stream_id else None

            return {
                'id': r.id,
                'reporter_username': reporter_user.username if reporter_user else None,
                'reported_username': reported_user.username if reported_user else None,
                'stream_title': stream.title if stream else None,
                'description': r.description,
                'created_at': r.created_at.isoformat() if r.created_at else None,
                'active': r.active
            }

        return jsonify({
            'active_reports': [format_report(r) for r in active_reports],
            'inactive_reports': [format_report(r) for r in inactive_reports]
        }), 200

    @app.route('/user-id-by-username', methods=['GET'])
    def user_id_by_username():
        username = request.args.get('username')
        user = User.query.filter_by(username=username).first()
        if user:
            return jsonify({'user_id': user.id}), 200
        else:
            return jsonify({'error': 'User not found'}), 404

    @app.route('/stream-owner-id-by-title', methods=['GET'])
    def stream_owner_id_by_title():
        title = request.args.get('title')
        stream = Stream.query.filter_by(title=title).first()
        if stream:
            return jsonify({'user_id': stream.user_id}), 200
        else:
            return jsonify({'error': 'Stream not found'}), 404

    @app.route('/admin/suspend/<int:user_id>', methods=['POST'])
    def suspend_account(user_id):
        user = User.query.get_or_404(user_id)
        username = request.args.get('username')
        admin = User.query.filter_by(username=username).first()

        if not admin:
            return jsonify({'msg': 'Admin user not found'}), 404

        if admin.role != 'admin':
            return jsonify({'msg': 'Unauthorized action'}), 403
        
        user = User.query.get_or_404(user_id)
        user.suspended = True
        db.session.commit()
        return jsonify({'msg': f'User {user.username} has been suspended'}), 200

    @app.route('/admin/unsuspend/<string:username>', methods=['POST'])
    def unsuspend_account(username):
        admin_username = request.args.get('admin_username')
        admin = User.query.filter_by(username=admin_username).first()

        if not admin:
            return jsonify({'msg': 'Admin user not found'}), 404

        if admin.role != 'admin':
            return jsonify({'msg': 'Unauthorized action'}), 403

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({'msg': 'User not found'}), 404

        user.suspended = False
        db.session.commit()
        return jsonify({'msg': f'User {user.username} has been unsuspended.'}), 200

    @app.route('/handle-report', methods=['POST'])
    def handle_report():
        data = request.get_json()
        report_id = data.get('report_id')

        report = Report.query.get(report_id)
        if report:
            report.active = False
            db.session.commit()
            return jsonify({'message': 'Report handled successfully'}), 200
        else:
            return jsonify({'error': 'Report not found'}), 404

    @app.route('/admin/notifications', methods=['POST'])
    def platform_notifications():
        data = request.get_json()
        message = data.get('message')
        report_id = data.get('reportId')
        username = request.args.get('username')
        notification_type = data.get('type')

        if not message:
            return jsonify({'msg': 'Message is required'}), 400

        admin = User.query.filter_by(username=username).first()
        if not admin:
            return jsonify({'msg': 'Admin user not found'}), 404

        if admin.role != 'admin':
            return jsonify({'msg': 'Unauthorized action'}), 403

        report = Report.query.get(report_id)
        if not report:
            return jsonify({'msg': 'Report not found'}), 404

        new_notification = Notification(message=message, report_id=report_id, reporter_id = report.reporter_id, type=notification_type)
        db.session.add(new_notification)
        db.session.commit()

        return jsonify({'msg': 'Notification sent successfully'}), 200

    @app.route('/api/notifications', methods=['GET'])
    def get_notifications():
        username = request.args.get('username')

        if not username:
            return jsonify({'error': 'Username is required'}), 400

        user = User.query.filter_by(username=username).first()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        notifications = Notification.query.filter_by(reporter_id=user.id).order_by(Notification.created_at.desc()).all()

        notification_list = []
        for notification in notifications:
            notification_list.append({
                'id': notification.id,
                'message': notification.message,
                'report_id': notification.report_id,
                'created_at': notification.created_at.isoformat(),
                'reporter_id': notification.reporter_id,
                'type': notification.type
            })

        return jsonify(notification_list)

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

    # @socketio.on('chat')
    # def handle_chat(data):
    #     room = data.get('room')
    #     message = data.get('message')
    #     username = data.get('username')
    #     user = User.query.filter_by(username=username).first()
    #     timestamp = datetime.utcnow().isoformat()
    #     # Emit the chat event, including the username
    #     emit('chat', {
    #         'room': room,
    #         'user_id': user.id,
    #         'username': username,
    #         'message': message,
    #         'timestamp': timestamp
    #     }, room=room)

    @socketio.on('chat')
    def handle_chat(data):
        room = data.get('room')  # Expected format: "stream_<stream_id>"
        message = data.get('message')
        username = data.get('username')  # Provided from client-side localStorage
        timestamp = datetime.utcnow()  # We'll use the DB record timestamp

        # Optional: Log incoming data.
        app.logger.info("Received chat: %s from %s in room %s", message, username, room)
        
        # Look up the user by username.
        user = User.query.filter_by(username=username).first()
        user_id = user.id if user else None

        # Extract the stream_id from the room string: "stream_<id>"
        try:
            stream_id = int(room.replace("stream_", ""))
        except Exception as e:
            app.logger.error("Could not extract stream id from room %s: %s", room, str(e))
            return

        # Create and save the chat message to the database.
        chat_message = ChatMessage(stream_id=stream_id, user_id=user_id, message=message)
        db.session.add(chat_message)
        db.session.commit()

        # Emit the chat message, using the saved timestamp from the database.
        emit('chat', {
            'room': room,
            'username': username,
            'message': message,
            'timestamp': chat_message.timestamp.isoformat()
        }, room=room)


    return app

if __name__ == '__main__':
    app = create_app()
    # Run using Socket.IO
    socketio.run(app, debug=True)
