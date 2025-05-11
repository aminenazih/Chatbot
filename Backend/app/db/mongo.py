from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB configuration
MONGODB_URL = "mongodb://localhost:27017"
MONGO_DB_NAME = "pfe"

# Initialize MongoDB client
client = AsyncIOMotorClient(MONGODB_URL)
db = client[MONGO_DB_NAME]

# Define the collection
pdf_collection = db["pdf_collection"]

