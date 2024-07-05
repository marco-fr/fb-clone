
from flask import request, jsonify, flash, request, redirect, url_for, send_file
from app import app, bcrypt
from models import db, User, Post, Comment, Like
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from sqlalchemy.exc import IntegrityError
import os, uuid

UPLOAD_FOLDER = './uploads/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data or not all(key in data for key in ('username', 'email', 'password')):
            return jsonify({"error": "Missing required fields"}), 400
        pw_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        new_user = User(username=data['username'], full_name=data['name'], email=data['email'], password=pw_hash)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "User with this email already exists"}), 409
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or not all(key in data for key in ('email', 'password')):
            return jsonify({"error": "Missing required fields"}), 400
        
        user = User.query.filter_by(email=data['email']).first()
            
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
        matches = bcrypt.check_password_hash(user.password, data['password'])
        if not matches:
            return jsonify({"error": "Invalid credentials"}), 401
        
        login_user(user)
        return jsonify({"message": "Logged in successfully", "user_id": user.id}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/create_post', methods=['POST'])
@login_required
def posts():
    try:
        content = request.form.get("content")
        imageUrl = None
        if 'image' in request.files:
            file = request.files['image']
            if file and allowed_file(file.filename):
                filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                imageUrl = filename
        new_post = Post(content=content, user_id=current_user.id, image=imageUrl)
        db.session.add(new_post)
        db.session.commit()
        return jsonify({"message": "Post created successfully"}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/comments', methods=['POST'])
@login_required
def comments():
    try:
        data = request.get_json()
        new_comment = Comment(content=data['content'], user_id=current_user.id, post_id=data['post_id'])
        db.session.add(new_comment)
        db.session.commit()
        return jsonify({"message": "Comment added successfully"}), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.order_by(Post.timestamp.desc()).all()
    post_list = []
    for post in posts:
        comments = Comment.query.filter_by(post_id=post.id).order_by(Comment.timestamp.asc()).all()
        user = User.query.get_or_404(post.user_id)
        post_list.append({
            'id': post.id,
            'content': post.content,
            'timestamp': post.timestamp,
            'user_id': post.user_id,
            'image': post.image,
            'full_name': user.full_name,
            'likes': post.likes,
            'comments': [{'id': comment.id, 'full_name': (User.query.get_or_404(comment.user_id)).full_name, 'content': comment.content, 'timestamp': comment.timestamp, 'user_id': comment.user_id} for comment in comments]
        })
    return jsonify(post_list)

@app.route('/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    user = User.query.get_or_404(user_id)

    profile_data = {
        'profile_image': user.profile_image,
        'full_name': user.full_name,
        'user_id': user_id
    }

    if current_user.is_authenticated and current_user.id == user_id:
        profile_data['email'] = user.email
        profile_data['username'] = user.username

    return jsonify(profile_data)

@app.route('/edit_profile', methods=['POST'])
def edit_profile():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    user = User.query.get(current_user.id)

    user.username = (request.form.get("username"))
    user.full_name= (request.form.get("full_name"))
    user.email = (request.form.get("email"))
    
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        if file and allowed_file(file.filename):
            filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            user.profile_image = filename
    
    db.session.commit()

    return jsonify({
        'username': user.username,
        'email': user.email,
        'profile_image': user.profile_image,
        'full_name': user.full_name
    })

@app.route('/profile/images/<int:user_id>')
def get_profile_image(user_id):
    user = User.query.get_or_404(user_id)
    image = "default.jpg"
    if user.profile_image:
        image = user.profile_image
    return send_file('./uploads/' + image)

@app.route('/post/images/<int:post_id>')
def get_post_image(post_id):
    post = Post.query.get_or_404(post_id)
    if post.image:
        return send_file('./uploads/' + post.image)
    return

@app.route('/posts/<int:post_id>/like', methods=['POST'])
@login_required
def like_post(post_id):
    post = Post.query.get_or_404(post_id)
    old_like = Like.query.filter_by(user_id=current_user.id, post_id=post_id).first()
    if old_like:
        post.likes -= 1
        db.session.delete(old_like)
        db.session.commit()
        return jsonify({'message': 'Post unliked', 'change': -1})
    post.likes += 1
    like = Like(user_id=current_user.id, post_id=post_id)
    db.session.add(like)
    db.session.commit()
    return jsonify({'message': 'Post liked', 'change': 1})

@app.route('/posts/<int:post_id>/comment', methods=['POST'])
@login_required
def comment_post(post_id):
    data = request.get_json()
    post = Post.query.get_or_404(post_id)
    comment = Comment(content=data['content'], user_id=current_user.id, post_id=post_id)
    db.session.add(comment)
    db.session.commit()
    return jsonify({'message': 'Comment added successfully'})

@app.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    post = Post.query.get_or_404(post_id)
    comments = Comment.query.filter_by(post_id=post_id).all()
    comments_data = []
    for comment in comments:
        user = User.query.get_or_404(comment.user_id)
        comments_data.append({
            'id': comment.id,
            'content': comment.content,
            'timestamp': comment.timestamp,
            'full_name': user.full_name,
            'user_id': user.id,
        })
    return jsonify(comments_data)

@app.route('/check-auth', methods=['GET'])
def check_auth():
    if current_user.is_authenticated:
        return jsonify({'isAuthenticated': True, 'user_id': current_user.id})
    return jsonify({'isAuthenticated': False}), 401