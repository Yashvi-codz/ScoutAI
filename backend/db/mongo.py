from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB")
if not MONGO_URI or not DB_NAME:
    raise ValueError("Missing required environment variables.")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

assessments_collection = db["assessments"]