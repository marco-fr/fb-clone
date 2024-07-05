import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_admin import Admin
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from models import db
from flask_admin.contrib.sqla import ModelView
from models import User, Post, Comment,Like

UPLOAD_FOLDER = './uploads/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///facebook_clone.db'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db.init_app(app)

migrate = Migrate(app, db)
CORS(app, supports_credentials=True)

bcrypt = Bcrypt(app)

admin = Admin(app, name='Admin', template_mode='bootstrap4')
admin.add_view(ModelView(User, db.session))
admin.add_view(ModelView(Comment, db.session))
admin.add_view(ModelView(Post, db.session))
admin.add_view(ModelView(Like, db.session))

from routes import *

if __name__ == "__main__":
    app.run(debug=True)
