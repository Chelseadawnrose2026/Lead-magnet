from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import resend
import csv
import io
import base64

# AI summarization
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Emergent LLM key for AI summarization
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Resend configuration
resend.api_key = os.environ.get('RESEND_API_KEY')
NOTIFICATION_EMAIL = os.environ.get('NOTIFICATION_EMAIL', 'transform@chelseaflynncoaching.com')

# Create the main app
app = FastAPI()

# Create routers
api_router = APIRouter(prefix="/api")
crm_router = APIRouter(prefix="/api/crm")

# ==================== EXISTING MODELS ====================

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactSubmissionCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str

class BookingRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    booking_type: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookingRequestCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    booking_type: str
    message: str

# ==================== CRM MODELS ====================

# Pipeline stages
PIPELINE_STAGES = ["New Lead", "Contacted", "Responded", "Meeting Scheduled", "Proposal Sent", "Booked", "Completed", "Declined"]

class CRMContact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Basic info
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    # Company link
    company_id: Optional[str] = None  # Link to company
    # Organization (legacy - can be used if no company linked)
    organization_name: Optional[str] = None  # Parish name, Conference name, etc.
    organization_type: Optional[str] = None  # Parish, Conference, Retreat Center, Diocese, Other
    role: Optional[str] = None  # DRE, Pastor, OCIA Coordinator, Event Planner, etc.
    # Address
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    # Pipeline
    stage: str = "New Lead"
    # Notes and follow-up
    notes: Optional[str] = None
    follow_up_date: Optional[str] = None
    last_contacted: Optional[str] = None  # Date of last contact
    last_activity: Optional[str] = None  # Summary of last activity
    # Tags
    tags: List[str] = []
    # Documents attached to this contact
    documents: List[Dict[str, Any]] = []  # [{name, url, type, uploaded_at}]
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CRMContactCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    company_id: Optional[str] = None
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    role: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    stage: str = "New Lead"
    notes: Optional[str] = None
    follow_up_date: Optional[str] = None
    last_contacted: Optional[str] = None
    last_activity: Optional[str] = None
    tags: List[str] = []
    documents: List[Dict[str, Any]] = []

class CRMContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company_id: Optional[str] = None
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    role: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    stage: Optional[str] = None
    notes: Optional[str] = None
    follow_up_date: Optional[str] = None
    last_contacted: Optional[str] = None
    last_activity: Optional[str] = None
    tags: Optional[List[str]] = None
    documents: Optional[List[Dict[str, Any]]] = None

# Company model
class Company(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    company_type: Optional[str] = None  # Parish, Conference, Diocese, Retreat Center, School, Other
    industry: Optional[str] = None  # Industry tag for searching
    # Contact info
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    # Address
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    # Notes
    notes: Optional[str] = None
    # Documents
    documents: List[Dict[str, Any]] = []  # [{name, url, type, uploaded_at}]
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CompanyCreate(BaseModel):
    name: str
    company_type: Optional[str] = None
    industry: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    notes: Optional[str] = None
    documents: List[Dict[str, Any]] = []

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    company_type: Optional[str] = None
    industry: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    notes: Optional[str] = None
    documents: Optional[List[Dict[str, Any]]] = None

# Email forwarding model
class ForwardedEmail(BaseModel):
    from_email: str
    from_name: Optional[str] = None
    subject: str
    body: str
    received_at: Optional[str] = None

# Activity tracking
class Activity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contact_id: str
    activity_type: str  # email_sent, email_received, call, meeting, note, stage_change, follow_up, other
    description: str
    activity_date: Optional[str] = None  # Date of the activity
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str = "admin"

class ActivityCreate(BaseModel):
    contact_id: str
    activity_type: str
    description: str
    activity_date: Optional[str] = None

# To-Do items
class TodoItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    contact_id: Optional[str] = None  # Link to contact if related
    due_date: Optional[str] = None
    priority: str = "medium"  # low, medium, high
    completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TodoItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    contact_id: Optional[str] = None
    due_date: Optional[str] = None
    priority: str = "medium"

class TodoItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    contact_id: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None

# Email template
class EmailTemplate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    subject: str
    body: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmailTemplateCreate(BaseModel):
    name: str
    subject: str
    body: str

# Mass email request
class MassEmailRequest(BaseModel):
    contact_ids: List[str]
    subject: str
    body: str
    attach_onesheet: bool = False

# CRM User (for admin access)
class CRMUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str = Field(default_factory=lambda: f"user_{uuid.uuid4().hex[:12]}")
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "admin"  # admin, pa
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CRMSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_id: str
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Invoice model
class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str
    contact_id: str
    contact_name: str
    contact_email: str
    organization: Optional[str] = None
    items: List[Dict[str, Any]]  # [{description, quantity, rate, amount}]
    subtotal: float
    tax: float = 0
    total: float
    notes: Optional[str] = None
    status: str = "draft"  # draft, sent, paid
    due_date: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvoiceCreate(BaseModel):
    contact_id: str
    items: List[Dict[str, Any]]
    tax: float = 0
    notes: Optional[str] = None
    due_date: Optional[str] = None

# Agreement model
class Agreement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contact_id: str
    contact_name: str
    contact_email: str
    organization: Optional[str] = None
    event_date: str
    event_type: str  # Speaking engagement, Workshop, Retreat, etc.
    event_location: str
    fee: float
    terms: str
    status: str = "draft"  # draft, sent, signed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AgreementCreate(BaseModel):
    contact_id: str
    event_date: str
    event_type: str
    event_location: str
    fee: float
    terms: Optional[str] = None

# ==================== EMAIL SIGNATURE ====================

EMAIL_SIGNATURE = """
<table cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
  <tr>
    <td style="padding-right: 15px; vertical-align: top;">
      <img src="https://customer-assets.emergentagent.com/job_faith-speaker/artifacts/betujzmz_CL-23.jpg" 
           alt="Chelsea Flynn" 
           style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #7B3B3B;">
    </td>
    <td style="vertical-align: top;">
      <p style="margin: 0 0 5px 0; font-size: 18px; font-weight: bold; color: #7B3B3B;">Chelsea Flynn</p>
      <p style="margin: 0 0 10px 0; font-style: italic; color: #666;">Catholic Speaker & Coach</p>
      <p style="margin: 0 0 3px 0;">📞 +1 345 325 3924</p>
      <p style="margin: 0 0 3px 0;">✉️ <a href="mailto:transform@chelseaflynncoaching.com" style="color: #7B3B3B;">transform@chelseaflynncoaching.com</a></p>
      <p style="margin: 0;">🌐 <a href="https://www.chelseaflynn.com" style="color: #7B3B3B;">www.chelseaflynn.com</a></p>
    </td>
  </tr>
</table>
"""

# ==================== HELPER FUNCTIONS ====================

async def send_notification_email(subject: str, html_content: str):
    """Send email notification using Resend"""
    try:
        params = {
            "from": "Chelsea Flynn Website <noreply@chelseaflynn.com>",
            "to": [NOTIFICATION_EMAIL],
            "subject": subject,
            "html": html_content
        }
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Notification email sent to {NOTIFICATION_EMAIL}")
    except Exception as e:
        logger.error(f"Failed to send notification email: {str(e)}")

async def send_crm_email(to_email: str, subject: str, body: str, attach_onesheet: bool = False):
    """Send email from CRM with signature"""
    html_content = f"""
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
        {body.replace(chr(10), '<br>')}
        <br><br>
        <hr style="border: none; border-top: 1px solid #E0C4C0; margin: 20px 0;">
        {EMAIL_SIGNATURE}
    </div>
    """
    
    try:
        params = {
            "from": "Chelsea Flynn <noreply@chelseaflynn.com>",
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        
        # Attach one-sheet if requested
        if attach_onesheet:
            onesheet_path = ROOT_DIR / "onesheet_download.pdf"
            if onesheet_path.exists():
                with open(onesheet_path, "rb") as f:
                    pdf_content = base64.b64encode(f.read()).decode()
                params["attachments"] = [{
                    "filename": "Chelsea-Flynn-Speaker-OneSheet.pdf",
                    "content": pdf_content
                }]
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"CRM email sent to {to_email}")
        return {"success": True, "id": result.get("id") if isinstance(result, dict) else str(result)}
    except Exception as e:
        logger.error(f"Failed to send CRM email: {str(e)}")
        return {"success": False, "error": str(e)}

def get_session_token(request: Request) -> Optional[str]:
    """Extract session token from cookie or header"""
    # Try cookie first
    session_token = request.cookies.get("session_token")
    if session_token:
        return session_token
    # Fallback to Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]
    return None

async def get_current_user(request: Request) -> CRMUser:
    """Verify session and return current user"""
    session_token = get_session_token(request)
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session
    session_doc = await db.crm_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_doc = await db.crm_users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return CRMUser(**user_doc)

# ==================== EXISTING ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Chelsea Flynn API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    await db.status_checks.insert_one(status_obj.model_dump())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    return checks

# Contact Form Endpoints
@api_router.post("/contact", response_model=ContactSubmission)
async def submit_contact_form(input: ContactSubmissionCreate):
    try:
        contact_dict = input.model_dump()
        contact_obj = ContactSubmission(**contact_dict)
        doc = contact_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.contact_submissions.insert_one(doc)
        logger.info(f"Contact form submitted: {contact_obj.name} - {contact_obj.email}")
        
        html_content = f"""
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> {contact_obj.name}</p>
        <p><strong>Email:</strong> {contact_obj.email}</p>
        <p><strong>Phone:</strong> {contact_obj.phone or 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>{contact_obj.message}</p>
        """
        await send_notification_email(f"New Contact: {contact_obj.name}", html_content)
        
        # Sync to external CRM (Chelsea Flynn main CRM)
        try:
            import httpx
            webhook_url = "https://recruit-hub-124.emergent.host/api/webhook/new-contact"
            webhook_payload = {
                "full_name": contact_obj.name,
                "email": contact_obj.email,
                "phone": contact_obj.phone,
                "source": "Chelsea Flynn Website Contact Form",
                "tags": ["Website Lead"],
                "extra_data": {"message": contact_obj.message[:500] if contact_obj.message else None}
            }
            async with httpx.AsyncClient() as http_client:
                await http_client.post(webhook_url, json=webhook_payload, timeout=10)
                logger.info(f"Contact synced to external CRM: {contact_obj.email}")
        except Exception as webhook_err:
            logger.error(f"Failed to sync contact to external CRM: {webhook_err}")
        
        return contact_obj
    except Exception as e:
        logger.error(f"Error submitting contact form: {str(e)}")
        raise

@api_router.get("/contact", response_model=List[ContactSubmission])
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
        doc = booking_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.booking_requests.insert_one(doc)
        logger.info(f"Booking request submitted: {booking_obj.name} - {booking_obj.email}")
        
        html_content = f"""
        <h2>New Booking Request</h2>
        <p><strong>Name:</strong> {booking_obj.name}</p>
        <p><strong>Email:</strong> {booking_obj.email}</p>
        <p><strong>Booking Type:</strong> {booking_obj.booking_type}</p>
        <p><strong>Message:</strong></p>
        <p>{booking_obj.message}</p>
        """
        await send_notification_email(f"New Booking: {booking_obj.name}", html_content)
        
        # Sync to external CRM (Chelsea Flynn main CRM)
        try:
            import httpx
            webhook_url = "https://recruit-hub-124.emergent.host/api/webhook/new-contact"
            webhook_payload = {
                "full_name": booking_obj.name,
                "email": booking_obj.email,
                "phone": booking_obj.phone,
                "source": "Chelsea Flynn Website Booking",
                "tags": ["Booking Request", booking_obj.booking_type],
                "extra_data": {"booking_type": booking_obj.booking_type, "message": booking_obj.message[:500] if booking_obj.message else None}
            }
            async with httpx.AsyncClient() as http_client:
                await http_client.post(webhook_url, json=webhook_payload, timeout=10)
                logger.info(f"Booking synced to external CRM: {booking_obj.email}")
        except Exception as webhook_err:
            logger.error(f"Failed to sync booking to external CRM: {webhook_err}")
        
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

# PDF Download endpoints
@api_router.get("/download/slides")
async def download_slides():
    return FileResponse(
        ROOT_DIR / "slides_download.pdf",
        media_type="application/pdf",
        filename="Boundaries-Burnout-Slides.pdf"
    )

@api_router.get("/download/onesheet")
async def download_onesheet():
    return FileResponse(
        ROOT_DIR / "onesheet_download.pdf",
        media_type="application/pdf",
        filename="Chelsea-Flynn-Speaker-OneSheet.pdf"
    )

# ==================== CRM AUTH ENDPOINTS ====================

@crm_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Process session_id from Emergent Auth and create session"""
    try:
        body = await request.json()
        session_id = body.get("session_id")
        
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id required")
        
        # Exchange session_id for user data
        import httpx
        async with httpx.AsyncClient() as client:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session_id")
            
            user_data = auth_response.json()
        
        # Check if user exists or create new
        user_doc = await db.crm_users.find_one({"email": user_data["email"]}, {"_id": 0})
        
        if not user_doc:
            # Create new user
            new_user = CRMUser(
                email=user_data["email"],
                name=user_data["name"],
                picture=user_data.get("picture")
            )
            await db.crm_users.insert_one(new_user.model_dump())
            user_doc = new_user.model_dump()
        
        # Create session
        session_token = user_data.get("session_token", f"sess_{uuid.uuid4().hex}")
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session = {
            "session_id": session_id,
            "user_id": user_doc["user_id"],
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Delete old sessions for this user
        await db.crm_sessions.delete_many({"user_id": user_doc["user_id"]})
        await db.crm_sessions.insert_one(session)
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60  # 7 days
        )
        
        return {"user": user_doc, "session_token": session_token}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@crm_router.get("/auth/me")
async def get_current_user_info(request: Request):
    """Get current authenticated user"""
    user = await get_current_user(request)
    return user.model_dump()

@crm_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = get_session_token(request)
    if session_token:
        await db.crm_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ==================== CRM CONTACTS ENDPOINTS ====================

@crm_router.get("/contacts")
async def get_contacts(request: Request, stage: Optional[str] = None):
    """Get all CRM contacts"""
    await get_current_user(request)
    
    query = {}
    if stage:
        query["stage"] = stage
    
    contacts = await db.crm_contacts.find(query, {"_id": 0}).to_list(1000)
    return contacts

@crm_router.get("/contacts/{contact_id}")
async def get_contact(contact_id: str, request: Request):
    """Get single contact"""
    await get_current_user(request)
    
    contact = await db.crm_contacts.find_one({"id": contact_id}, {"_id": 0})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@crm_router.post("/contacts")
async def create_contact(contact: CRMContactCreate, request: Request):
    """Create new CRM contact"""
    await get_current_user(request)
    
    contact_obj = CRMContact(**contact.model_dump())
    doc = contact_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.crm_contacts.insert_one(doc)
    
    # Log activity
    activity = Activity(
        contact_id=contact_obj.id,
        activity_type="created",
        description=f"Contact created: {contact_obj.first_name} {contact_obj.last_name}"
    )
    activity_doc = activity.model_dump()
    activity_doc['created_at'] = activity_doc['created_at'].isoformat()
    await db.crm_activities.insert_one(activity_doc)
    
    # Remove _id before returning (MongoDB adds it after insert)
    doc.pop('_id', None)
    return doc

@crm_router.put("/contacts/{contact_id}")
async def update_contact(contact_id: str, update: CRMContactUpdate, request: Request):
    """Update CRM contact"""
    await get_current_user(request)
    
    existing = await db.crm_contacts.find_one({"id": contact_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Track stage change
    if "stage" in update_data and update_data["stage"] != existing.get("stage"):
        activity = Activity(
            contact_id=contact_id,
            activity_type="stage_change",
            description=f"Stage changed from '{existing.get('stage')}' to '{update_data['stage']}'"
        )
        await db.crm_activities.insert_one(activity.model_dump())
    
    await db.crm_contacts.update_one({"id": contact_id}, {"$set": update_data})
    
    updated = await db.crm_contacts.find_one({"id": contact_id}, {"_id": 0})
    return updated

@crm_router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str, request: Request):
    """Delete CRM contact"""
    await get_current_user(request)
    
    result = await db.crm_contacts.delete_one({"id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Delete related activities
    await db.crm_activities.delete_many({"contact_id": contact_id})
    
    return {"message": "Contact deleted"}

@crm_router.post("/contacts/import")
async def import_contacts(request: Request, file: UploadFile = File(...)):
    """Import contacts from CSV"""
    await get_current_user(request)
    
    content = await file.read()
    decoded = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))
    
    imported = 0
    errors = []
    
    for row in reader:
        try:
            contact = CRMContactCreate(
                first_name=row.get('first_name', row.get('First Name', '')),
                last_name=row.get('last_name', row.get('Last Name', '')),
                email=row.get('email', row.get('Email', '')),
                phone=row.get('phone', row.get('Phone', '')),
                organization_name=row.get('organization_name', row.get('Organization', '')),
                organization_type=row.get('organization_type', row.get('Type', '')),
                role=row.get('role', row.get('Role', '')),
                address=row.get('address', row.get('Address', '')),
                city=row.get('city', row.get('City', '')),
                state=row.get('state', row.get('State', '')),
                country=row.get('country', row.get('Country', '')),
                stage=row.get('stage', 'New Lead'),
                notes=row.get('notes', row.get('Notes', ''))
            )
            
            contact_obj = CRMContact(**contact.model_dump())
            doc = contact_obj.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            doc['updated_at'] = doc['updated_at'].isoformat()
            await db.crm_contacts.insert_one(doc)
            imported += 1
        except Exception as e:
            errors.append(f"Row error: {str(e)}")
    
    return {"imported": imported, "errors": errors}

# ==================== CRM ACTIVITIES ENDPOINTS ====================

@crm_router.get("/contacts/{contact_id}/activities")
async def get_contact_activities(contact_id: str, request: Request):
    """Get activities for a contact"""
    await get_current_user(request)
    
    activities = await db.crm_activities.find(
        {"contact_id": contact_id}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return activities

@crm_router.post("/activities")
async def create_activity(activity: ActivityCreate, request: Request):
    """Create new activity"""
    await get_current_user(request)
    
    activity_obj = Activity(**activity.model_dump())
    doc = activity_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.crm_activities.insert_one(doc)
    doc.pop('_id', None)
    return doc

# ==================== CRM TODO ENDPOINTS ====================

@crm_router.get("/todos")
async def get_todos(request: Request, completed: Optional[bool] = None):
    """Get all todos"""
    await get_current_user(request)
    
    query = {}
    if completed is not None:
        query["completed"] = completed
    
    todos = await db.crm_todos.find(query, {"_id": 0}).sort("due_date", 1).to_list(1000)
    return todos

@crm_router.post("/todos")
async def create_todo(todo: TodoItemCreate, request: Request):
    """Create new todo"""
    await get_current_user(request)
    
    todo_obj = TodoItem(**todo.model_dump())
    doc = todo_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.crm_todos.insert_one(doc)
    doc.pop('_id', None)
    return doc

@crm_router.put("/todos/{todo_id}")
async def update_todo(todo_id: str, update: TodoItemUpdate, request: Request):
    """Update todo"""
    await get_current_user(request)
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    await db.crm_todos.update_one({"id": todo_id}, {"$set": update_data})
    
    updated = await db.crm_todos.find_one({"id": todo_id}, {"_id": 0})
    return updated

@crm_router.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str, request: Request):
    """Delete todo"""
    await get_current_user(request)
    
    await db.crm_todos.delete_one({"id": todo_id})
    return {"message": "Todo deleted"}

# ==================== CRM EMAIL ENDPOINTS ====================

@crm_router.get("/email-templates")
async def get_email_templates(request: Request):
    """Get all email templates"""
    await get_current_user(request)
    
    templates = await db.crm_email_templates.find({}, {"_id": 0}).to_list(100)
    return templates

@crm_router.post("/email-templates")
async def create_email_template(template: EmailTemplateCreate, request: Request):
    """Create email template"""
    await get_current_user(request)
    
    template_obj = EmailTemplate(**template.model_dump())
    doc = template_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.crm_email_templates.insert_one(doc)
    doc.pop('_id', None)
    return doc

@crm_router.delete("/email-templates/{template_id}")
async def delete_email_template(template_id: str, request: Request):
    """Delete email template"""
    await get_current_user(request)
    
    await db.crm_email_templates.delete_one({"id": template_id})
    return {"message": "Template deleted"}

@crm_router.post("/send-email")
async def send_single_email(request: Request):
    """Send email to single contact"""
    await get_current_user(request)
    
    body = await request.json()
    to_email = body.get("to_email")
    subject = body.get("subject")
    email_body = body.get("body")
    contact_id = body.get("contact_id")
    attach_onesheet = body.get("attach_onesheet", False)
    
    result = await send_crm_email(to_email, subject, email_body, attach_onesheet)
    
    if result["success"] and contact_id:
        # Update last_contacted date
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        await db.crm_contacts.update_one(
            {"id": contact_id}, 
            {"$set": {"last_contacted": today, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        # Log activity
        activity = Activity(
            contact_id=contact_id,
            activity_type="email_sent",
            description=f"Email sent: {subject}"
        )
        activity_doc = activity.model_dump()
        activity_doc['created_at'] = activity_doc['created_at'].isoformat()
        await db.crm_activities.insert_one(activity_doc)
    
    return result

@crm_router.post("/send-mass-email")
async def send_mass_email(email_request: MassEmailRequest, request: Request):
    """Send email to multiple contacts"""
    await get_current_user(request)
    
    results = []
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    for contact_id in email_request.contact_ids:
        contact = await db.crm_contacts.find_one({"id": contact_id}, {"_id": 0})
        if contact:
            result = await send_crm_email(
                contact["email"], 
                email_request.subject, 
                email_request.body,
                email_request.attach_onesheet
            )
            results.append({"contact_id": contact_id, "email": contact["email"], **result})
            
            if result["success"]:
                # Update last_contacted date
                await db.crm_contacts.update_one(
                    {"id": contact_id}, 
                    {"$set": {"last_contacted": today, "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
                activity = Activity(
                    contact_id=contact_id,
                    activity_type="email_sent",
                    description=f"Mass email sent: {email_request.subject}"
                )
                activity_doc = activity.model_dump()
                activity_doc['created_at'] = activity_doc['created_at'].isoformat()
                await db.crm_activities.insert_one(activity_doc)
    
    return {"results": results}

# ==================== CRM DASHBOARD ENDPOINTS ====================

@crm_router.get("/dashboard")
async def get_dashboard(request: Request):
    """Get dashboard summary"""
    await get_current_user(request)
    
    # Pipeline summary
    pipeline = []
    for stage in PIPELINE_STAGES:
        count = await db.crm_contacts.count_documents({"stage": stage})
        pipeline.append({"stage": stage, "count": count})
    
    # Total contacts
    total_contacts = await db.crm_contacts.count_documents({})
    
    # Upcoming follow-ups
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    upcoming = await db.crm_contacts.find(
        {"follow_up_date": {"$gte": today}},
        {"_id": 0}
    ).sort("follow_up_date", 1).to_list(10)
    
    # Pending todos
    pending_todos = await db.crm_todos.find(
        {"completed": False},
        {"_id": 0}
    ).sort("due_date", 1).to_list(10)
    
    # Recent activity
    recent_activities = await db.crm_activities.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(10)
    
    return {
        "pipeline": pipeline,
        "total_contacts": total_contacts,
        "upcoming_followups": upcoming,
        "pending_todos": pending_todos,
        "recent_activities": recent_activities
    }

@crm_router.get("/pipeline-stages")
async def get_pipeline_stages(request: Request):
    """Get available pipeline stages"""
    await get_current_user(request)
    return PIPELINE_STAGES

# ==================== CRM COMPANY ENDPOINTS ====================

@crm_router.post("/companies/sync-from-contacts")
async def sync_companies_from_contacts(request: Request):
    """Create companies from unique organization names in contacts"""
    await get_current_user(request)
    
    # Get all unique organization names from contacts
    contacts = await db.crm_contacts.find(
        {"organization_name": {"$ne": None, "$ne": ""}},
        {"_id": 0, "organization_name": 1, "organization_type": 1, "city": 1, "state": 1, "country": 1}
    ).to_list(1000)
    
    # Group by organization name
    org_map = {}
    for contact in contacts:
        org_name = contact.get("organization_name", "").strip()
        if org_name and org_name not in org_map:
            org_map[org_name] = {
                "name": org_name,
                "company_type": contact.get("organization_type"),
                "city": contact.get("city"),
                "state": contact.get("state"),
                "country": contact.get("country")
            }
    
    created = 0
    for org_name, org_data in org_map.items():
        # Check if company already exists
        existing = await db.crm_companies.find_one({"name": org_name})
        if not existing:
            # Create new company
            company = Company(
                name=org_data["name"],
                company_type=org_data.get("company_type"),
                city=org_data.get("city"),
                state=org_data.get("state"),
                country=org_data.get("country")
            )
            doc = company.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            doc['updated_at'] = doc['updated_at'].isoformat()
            await db.crm_companies.insert_one(doc)
            
            # Link all contacts with this organization name to the company
            await db.crm_contacts.update_many(
                {"organization_name": org_name},
                {"$set": {"company_id": company.id}}
            )
            created += 1
        else:
            # Link contacts to existing company if not already linked
            await db.crm_contacts.update_many(
                {"organization_name": org_name, "company_id": None},
                {"$set": {"company_id": existing["id"]}}
            )
    
    return {"created": created, "total_organizations": len(org_map)}

@crm_router.get("/companies")
async def get_companies(request: Request):
    """Get all companies"""
    await get_current_user(request)
    
    # First, auto-sync any new organizations from contacts
    contacts = await db.crm_contacts.find(
        {"organization_name": {"$ne": None, "$ne": ""}},
        {"_id": 0}
    ).to_list(1000)
    
    # Auto-create companies for unlinked organizations
    for contact in contacts:
        org_name = contact.get("organization_name", "").strip()
        company_id = contact.get("company_id")
        
        # Skip if already linked or no org name
        if company_id or not org_name:
            continue
            
        existing = await db.crm_companies.find_one({"name": org_name})
        if not existing:
            company = Company(
                name=org_name,
                company_type=contact.get("organization_type"),
                city=contact.get("city"),
                state=contact.get("state"),
                country=contact.get("country")
            )
            doc = company.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            doc['updated_at'] = doc['updated_at'].isoformat()
            await db.crm_companies.insert_one(doc)
            doc.pop('_id', None)
            
            # Link contact to new company
            await db.crm_contacts.update_one(
                {"id": contact["id"]},
                {"$set": {"company_id": company.id}}
            )
        else:
            # Link contact to existing company
            await db.crm_contacts.update_one(
                {"id": contact["id"]},
                {"$set": {"company_id": existing["id"]}}
            )
    
    companies = await db.crm_companies.find({}, {"_id": 0}).sort("name", 1).to_list(1000)
    return companies

@crm_router.get("/companies/{company_id}")
async def get_company(company_id: str, request: Request):
    """Get single company with linked contacts"""
    await get_current_user(request)
    company = await db.crm_companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Get contacts linked to this company
    contacts = await db.crm_contacts.find({"company_id": company_id}, {"_id": 0}).to_list(100)
    company["contacts"] = contacts
    return company

@crm_router.post("/companies")
async def create_company(company: CompanyCreate, request: Request):
    """Create new company"""
    await get_current_user(request)
    
    company_obj = Company(**company.model_dump())
    doc = company_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.crm_companies.insert_one(doc)
    doc.pop('_id', None)
    return doc

@crm_router.put("/companies/{company_id}")
async def update_company(company_id: str, update: CompanyUpdate, request: Request):
    """Update company"""
    await get_current_user(request)
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.crm_companies.update_one({"id": company_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return await db.crm_companies.find_one({"id": company_id}, {"_id": 0})

@crm_router.delete("/companies/{company_id}")
async def delete_company(company_id: str, request: Request):
    """Delete company and unlink contacts"""
    await get_current_user(request)
    
    # Unlink contacts from this company
    await db.crm_contacts.update_many({"company_id": company_id}, {"$set": {"company_id": None}})
    
    result = await db.crm_companies.delete_one({"id": company_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return {"message": "Company deleted"}

@crm_router.post("/companies/{company_id}/link-contacts")
async def link_contacts_to_company(company_id: str, request: Request):
    """Link multiple contacts to a company"""
    await get_current_user(request)
    
    body = await request.json()
    contact_ids = body.get("contact_ids", [])
    
    # Verify company exists
    company = await db.crm_companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Update contacts
    result = await db.crm_contacts.update_many(
        {"id": {"$in": contact_ids}},
        {"$set": {"company_id": company_id, "organization_name": company["name"]}}
    )
    
    return {"linked": result.modified_count}

# ==================== EMAIL FORWARDING ENDPOINT ====================

@crm_router.post("/forward-email")
async def forward_email(email_data: ForwardedEmail, request: Request):
    """Process a forwarded email - creates contact or adds to existing, with AI summarization"""
    await get_current_user(request)
    
    from_email = email_data.from_email.lower().strip()
    from_name = email_data.from_name or ""
    
    # Split name into first/last
    name_parts = from_name.strip().split(" ", 1)
    first_name = name_parts[0] if name_parts else "Unknown"
    last_name = name_parts[1] if len(name_parts) > 1 else ""
    
    # AI Summarization
    summary = ""
    if EMERGENT_LLM_KEY and len(email_data.body) > 200:
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"summary-{uuid.uuid4()}",
                system_message="You are a helpful assistant that summarizes emails and articles concisely. Create a brief 2-3 sentence summary capturing the key points. If it's a Google Alert or news article, extract the main topic and relevance."
            ).with_model("openai", "gpt-4o-mini")
            
            user_message = UserMessage(
                text=f"Summarize this email/article:\n\nSubject: {email_data.subject}\n\n{email_data.body[:3000]}"
            )
            summary = await chat.send_message(user_message)
            logger.info(f"AI Summary generated for email from {from_email}")
        except Exception as e:
            logger.error(f"AI summarization failed: {e}")
            summary = ""
    
    # Check if contact exists
    existing = await db.crm_contacts.find_one({"email": from_email}, {"_id": 0})
    
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    
    # Build activity note with summary
    if summary:
        activity_note = f"[{timestamp}] 📧 Email Received:\nSubject: {email_data.subject}\n\n📝 AI Summary: {summary}\n\n--- Original Content ---\n{email_data.body}\n\n"
    else:
        activity_note = f"[{timestamp}] 📧 Email Received:\nSubject: {email_data.subject}\n\n{email_data.body}\n\n"
    
    if existing:
        # Append to existing contact's notes
        existing_notes = existing.get("notes", "") or ""
        updated_notes = activity_note + existing_notes
        
        await db.crm_contacts.update_one(
            {"id": existing["id"]},
            {"$set": {
                "notes": updated_notes,
                "last_contacted": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Also update company notes if contact is linked to a company
        if existing.get("company_id"):
            company = await db.crm_companies.find_one({"id": existing["company_id"]}, {"_id": 0})
            if company:
                company_notes = company.get("notes", "") or ""
                company_activity = f"[{timestamp}] 📧 Email from {first_name} {last_name}:\n{summary if summary else email_data.subject}\n\n"
                await db.crm_companies.update_one(
                    {"id": existing["company_id"]},
                    {"$set": {"notes": company_activity + company_notes, "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
        
        # Log activity
        activity = Activity(
            contact_id=existing["id"],
            activity_type="email_received",
            description=f"Email received: {email_data.subject}" + (f" (Summary: {summary[:100]}...)" if summary else "")
        )
        activity_doc = activity.model_dump()
        activity_doc['created_at'] = activity_doc['created_at'].isoformat()
        await db.crm_activities.insert_one(activity_doc)
        
        return {"status": "updated", "contact_id": existing["id"], "summary": summary, "message": f"Added email to existing contact: {from_email}"}
    else:
        # Create new contact
        new_contact = CRMContact(
            first_name=first_name,
            last_name=last_name,
            email=from_email,
            notes=activity_note,
            last_contacted=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            stage="New Lead"
        )
        doc = new_contact.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.crm_contacts.insert_one(doc)
        
        # Log activity
        activity = Activity(
            contact_id=new_contact.id,
            activity_type="created",
            description=f"Contact created from forwarded email: {email_data.subject}"
        )
        activity_doc = activity.model_dump()
        activity_doc['created_at'] = activity_doc['created_at'].isoformat()
        await db.crm_activities.insert_one(activity_doc)
        
        return {"status": "created", "contact_id": new_contact.id, "summary": summary, "message": f"Created new contact: {from_email}"}

# ==================== INBOUND EMAIL WEBHOOK ====================

@crm_router.post("/inbound-email-webhook")
async def inbound_email_webhook(request: Request):
    """Webhook endpoint for Resend inbound emails"""
    try:
        body = await request.json()
        logger.info(f"Inbound email webhook received: {body}")
        
        # Extract email data from Resend webhook payload
        from_email = body.get("from", "")
        from_name = ""
        
        # Parse "Name <email>" format
        if "<" in from_email and ">" in from_email:
            parts = from_email.split("<")
            from_name = parts[0].strip()
            from_email = parts[1].replace(">", "").strip()
        
        subject = body.get("subject", "No Subject")
        text_body = body.get("text", "") or body.get("html", "")
        
        # Process the email using the same logic
        email_data = ForwardedEmail(
            from_email=from_email,
            from_name=from_name,
            subject=subject,
            body=text_body
        )
        
        # Create a mock request for auth bypass (webhook is trusted)
        # Process without auth for webhook
        from_email_clean = from_email.lower().strip()
        name_parts = from_name.strip().split(" ", 1) if from_name else ["Unknown"]
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        # AI Summarization
        summary = ""
        if EMERGENT_LLM_KEY and len(text_body) > 200:
            try:
                chat = LlmChat(
                    api_key=EMERGENT_LLM_KEY,
                    session_id=f"summary-{uuid.uuid4()}",
                    system_message="You are a helpful assistant that summarizes emails and articles concisely. Create a brief 2-3 sentence summary capturing the key points."
                ).with_model("openai", "gpt-4o-mini")
                
                user_message = UserMessage(text=f"Summarize:\n\nSubject: {subject}\n\n{text_body[:3000]}")
                summary = await chat.send_message(user_message)
            except Exception as e:
                logger.error(f"AI summarization failed: {e}")
        
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
        if summary:
            activity_note = f"[{timestamp}] 📧 Forwarded Email:\nSubject: {subject}\n\n📝 AI Summary: {summary}\n\n--- Original ---\n{text_body}\n\n"
        else:
            activity_note = f"[{timestamp}] 📧 Forwarded Email:\nSubject: {subject}\n\n{text_body}\n\n"
        
        existing = await db.crm_contacts.find_one({"email": from_email_clean}, {"_id": 0})
        
        if existing:
            existing_notes = existing.get("notes", "") or ""
            await db.crm_contacts.update_one(
                {"id": existing["id"]},
                {"$set": {"notes": activity_note + existing_notes, "last_contacted": datetime.now(timezone.utc).strftime("%Y-%m-%d")}}
            )
            logger.info(f"Added forwarded email to contact: {from_email_clean}")
        else:
            new_contact = CRMContact(
                first_name=first_name,
                last_name=last_name,
                email=from_email_clean,
                notes=activity_note,
                stage="New Lead"
            )
            doc = new_contact.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            doc['updated_at'] = doc['updated_at'].isoformat()
            await db.crm_contacts.insert_one(doc)
            logger.info(f"Created new contact from forwarded email: {from_email_clean}")
        
        return {"status": "processed"}
    except Exception as e:
        logger.error(f"Inbound email webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ==================== DOCUMENT UPLOAD ====================

@crm_router.post("/upload-document")
async def upload_document(file: UploadFile = File(...), entity_type: str = "contact", entity_id: str = ""):
    """Upload a document for a contact or company"""
    if not entity_id:
        raise HTTPException(status_code=400, detail="entity_id is required")
    
    # Read file content
    content = await file.read()
    
    # Store file (in production, use S3 or cloud storage)
    # For now, store as base64 in database
    file_data = {
        "id": str(uuid.uuid4()),
        "name": file.filename,
        "type": file.content_type,
        "size": len(content),
        "data": base64.b64encode(content).decode('utf-8'),
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    
    if entity_type == "contact":
        result = await db.crm_contacts.update_one(
            {"id": entity_id},
            {"$push": {"documents": file_data}}
        )
    elif entity_type == "company":
        result = await db.crm_companies.update_one(
            {"id": entity_id},
            {"$push": {"documents": file_data}}
        )
    else:
        raise HTTPException(status_code=400, detail="entity_type must be 'contact' or 'company'")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"{entity_type} not found")
    
    # Return without the base64 data
    return {"id": file_data["id"], "name": file_data["name"], "type": file_data["type"], "uploaded_at": file_data["uploaded_at"]}

@crm_router.get("/download-document/{entity_type}/{entity_id}/{document_id}")
async def download_document(entity_type: str, entity_id: str, document_id: str, request: Request):
    """Download a document"""
    await get_current_user(request)
    
    if entity_type == "contact":
        entity = await db.crm_contacts.find_one({"id": entity_id}, {"_id": 0})
    elif entity_type == "company":
        entity = await db.crm_companies.find_one({"id": entity_id}, {"_id": 0})
    else:
        raise HTTPException(status_code=400, detail="Invalid entity type")
    
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    documents = entity.get("documents", [])
    doc = next((d for d in documents if d.get("id") == document_id), None)
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    content = base64.b64decode(doc["data"])
    return Response(
        content=content,
        media_type=doc["type"],
        headers={"Content-Disposition": f'attachment; filename="{doc["name"]}"'}
    )

# ==================== CRM INVOICE ENDPOINTS ====================

@crm_router.get("/invoices")
async def get_invoices(request: Request):
    """Get all invoices"""
    await get_current_user(request)
    
    invoices = await db.crm_invoices.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return invoices

@crm_router.post("/invoices")
async def create_invoice(invoice_data: InvoiceCreate, request: Request):
    """Create new invoice"""
    await get_current_user(request)
    
    # Get contact info
    contact = await db.crm_contacts.find_one({"id": invoice_data.contact_id}, {"_id": 0})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Calculate totals
    subtotal = sum(item.get("amount", 0) for item in invoice_data.items)
    total = subtotal + invoice_data.tax
    
    # Generate invoice number
    count = await db.crm_invoices.count_documents({})
    invoice_number = f"INV-{datetime.now().year}-{count + 1:04d}"
    
    invoice = Invoice(
        invoice_number=invoice_number,
        contact_id=invoice_data.contact_id,
        contact_name=f"{contact['first_name']} {contact['last_name']}",
        contact_email=contact['email'],
        organization=contact.get('organization_name'),
        items=invoice_data.items,
        subtotal=subtotal,
        tax=invoice_data.tax,
        total=total,
        notes=invoice_data.notes,
        due_date=invoice_data.due_date
    )
    
    doc = invoice.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.crm_invoices.insert_one(doc)
    doc.pop('_id', None)
    return doc

# ==================== CRM AGREEMENT ENDPOINTS ====================

@crm_router.get("/agreements")
async def get_agreements(request: Request):
    """Get all agreements"""
    await get_current_user(request)
    
    agreements = await db.crm_agreements.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return agreements

@crm_router.post("/agreements")
async def create_agreement(agreement_data: AgreementCreate, request: Request):
    """Create new agreement"""
    await get_current_user(request)
    
    # Get contact info
    contact = await db.crm_contacts.find_one({"id": agreement_data.contact_id}, {"_id": 0})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Default terms
    default_terms = """
SPEAKER AGREEMENT

This Agreement is entered into between Chelsea Flynn ("Speaker") and the Organization listed above ("Client").

1. SERVICES: Speaker agrees to provide speaking services at the event described above.

2. COMPENSATION: Client agrees to pay the fee listed above. 50% deposit due upon signing, balance due on event date.

3. TRAVEL: Client will provide or reimburse reasonable travel expenses if the event is outside the Cayman Islands.

4. CANCELLATION: If Client cancels within 30 days of the event, deposit is non-refundable. If Speaker cancels, full deposit will be refunded.

5. RECORDING: Client may not record or broadcast without prior written consent.

By signing below, both parties agree to the terms of this Agreement.
"""
    
    agreement = Agreement(
        contact_id=agreement_data.contact_id,
        contact_name=f"{contact['first_name']} {contact['last_name']}",
        contact_email=contact['email'],
        organization=contact.get('organization_name'),
        event_date=agreement_data.event_date,
        event_type=agreement_data.event_type,
        event_location=agreement_data.event_location,
        fee=agreement_data.fee,
        terms=agreement_data.terms or default_terms
    )
    
    doc = agreement.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.crm_agreements.insert_one(doc)
    doc.pop('_id', None)
    return doc

# ==================== INCLUDE ROUTERS ====================

app.include_router(api_router)
app.include_router(crm_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
