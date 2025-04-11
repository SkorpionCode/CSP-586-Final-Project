# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # hashed password
    role = db.Column(db.String(20), default='viewer')  # viewer, streamer, admin
    profile_picture = db.Column(db.String(200))
    bio = db.Column(db.Text)
    suspended = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    streams = db.relationship('Stream', backref='owner', lazy=True)
    follows = db.relationship('Follow', backref='viewer', lazy=True)
    chat_messages = db.relationship('ChatMessage', backref='sender', lazy=True)

class Stream(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False, index=True)
    category = db.Column(db.String(80))
    tags = db.Column(db.String(200))
    schedule = db.Column(db.DateTime)
    is_live = db.Column(db.Boolean, default=False)
    streamer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    channel_info = db.Column(db.Text)
    stream_url = db.Column(db.String(300)) 

class Follow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    viewer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    streamer_id = db.Column(db.Integer, nullable=False)

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    stream_id = db.Column(db.Integer, db.ForeignKey('stream.id'))  # can be NULL for user reports
    reported_user_id = db.Column(db.Integer, db.ForeignKey('user.id')) # can be NULL for stream reports
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    active = db.Column(db.Boolean, default=True)

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    stream_id = db.Column(db.Integer, db.ForeignKey('stream.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text)
    report_id = db.Column(db.Integer, db.ForeignKey('report.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reporter_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    type = db.Column(db.String(20)) # user_suspended, report_denied