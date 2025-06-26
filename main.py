# main.py
import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # Import StaticFiles
from pydantic import BaseModel, EmailStr
import resend

# --- Pydantic Models for Data Validation ---
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    eventType: str
    message: str

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Electric Pulse Website API",
    description="API for the official Electric Pulse website, handling contact forms and serving the frontend.",
    version="1.2.0"
)

# --- CORS (Cross-Origin Resource Sharing) Middleware ---
# This is still useful if you have other services that might call your API.
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST", "GET"], # Allow GET for the health check
    allow_headers=["*"],
)

# --- API Endpoints ---
# It's good practice to prefix your API-specific routes.
@app.post("/api/send-email")
async def send_email_with_resend(contact_form: ContactForm):
    """
    This endpoint receives contact form data, validates it, and sends an email via Resend.
    """
    resend_api_key = os.environ.get("RESEND_API_KEY")
    to_email = os.environ.get("TO_EMAIL")
    from_email = os.environ.get("FROM_EMAIL") 

    if not all([resend_api_key, to_email, from_email]):
        raise HTTPException(
            status_code=500,
            detail="Server configuration error: Email service variables are not set up."
        )

    resend.api_key = resend_api_key
    subject = f"New Contact Form Submission: {contact_form.eventType}"
    html_content = f"""
    <h2>New Inquiry from the Electric Pulse Website!</h2>
    <p>You've received a new message from a fan. Here are the details:</p>
    <ul>
        <li><strong>Name:</strong> {contact_form.name}</li>
        <li><strong>Email:</strong> <a href="mailto:{contact_form.email}">{contact_form.email}</a></li>
        <li><strong>Event Type:</strong> {contact_form.eventType}</li>
    </ul>
    <h3>Message:</h3>
    <p>{contact_form.message}</p>
    <hr>
    <p><small>This email was sent via the Electric Pulse API using Resend.</small></p>
    """
    
    try:
        params = {
            "from": f"Electric Pulse Inquiry <{from_email}>",
            "to": [to_email],
            "subject": subject,
            "html": html_content,
            "reply_to": contact_form.email
        }
        email = resend.Emails.send(params)
        return {"message": "Email sent successfully!", "status": "success", "id": email['id']}

    except Exception as e:
        print(f"An exception occurred: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while trying to send the email: {e}"
        )

@app.get("/api/health")
def health_check():
    """
    A simple health check endpoint to confirm the API is running.
    """
    return {"status": "ok", "service": "Electric Pulse API"}

# --- Static Files Mount ---
# This is the key part. It tells FastAPI to serve files from the 'public' directory.
# It MUST come AFTER your API routes are defined.
app.mount("/", StaticFiles(directory="public", html=True), name="static")

