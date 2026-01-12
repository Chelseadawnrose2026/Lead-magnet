from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import resend


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Contact Form Models
class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str = ""
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactSubmissionCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    message: str

# Booking Request Models
class BookingRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str = ""
    message: str
    booking_type: str = "Virtual Meeting"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookingRequestCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    message: str
    booking_type: str = "Virtual Meeting"

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Contact Form Endpoints
@api_router.post("/contact", response_model=ContactSubmission)
async def submit_contact_form(input: ContactSubmissionCreate):
    try:
        contact_dict = input.model_dump()
        contact_obj = ContactSubmission(**contact_dict)
        
        # Convert to dict and serialize datetime to ISO string for MongoDB
        doc = contact_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        await db.contact_submissions.insert_one(doc)
        logger.info(f"Contact form submitted: {contact_obj.name} - {contact_obj.email}")
        
        return contact_obj
    except Exception as e:
        logger.error(f"Error submitting contact form: {str(e)}")
        raise

@api_router.get("/contacts", response_model=List[ContactSubmission])
async def get_all_contacts():
    contacts = await db.contact_submissions.find({}, {"_id": 0}).to_list(1000)
    
    for contact in contacts:
        if isinstance(contact['timestamp'], str):
            contact['timestamp'] = datetime.fromisoformat(contact['timestamp'])
    
    return contacts

# Booking Request Endpoints
@api_router.post("/booking", response_model=BookingRequest)
async def submit_booking_request(input: BookingRequestCreate):
    try:
        booking_dict = input.model_dump()
        booking_obj = BookingRequest(**booking_dict)
        
        # Convert to dict and serialize datetime to ISO string for MongoDB
        doc = booking_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        await db.booking_requests.insert_one(doc)
        logger.info(f"Booking request submitted: {booking_obj.name} - {booking_obj.email}")
        
        return booking_obj
    except Exception as e:
        logger.error(f"Error submitting booking request: {str(e)}")
        raise

@api_router.get("/bookings", response_model=List[BookingRequest])
async def get_all_bookings():
    bookings = await db.booking_requests.find({}, {"_id": 0}).to_list(1000)
    
    for booking in bookings:
        if isinstance(booking['timestamp'], str):
            booking['timestamp'] = datetime.fromisoformat(booking['timestamp'])
    
    return bookings

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()