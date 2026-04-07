import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(_file_))
load_dotenv(os.path.join(basedir, ".env"))

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///" + os.path.join(basedir, "dev.db"))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")