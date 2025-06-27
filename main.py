# main.py
import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import resend
import stripe
from dotenv import load_dotenv

# --- Load Environment Variables ---
load_dotenv()

# --- Configure Stripe ---
# Get your Stripe Secret Key from environment variables
stripe_secret_key = os.environ.get("STRIPE_SECRET_KEY")
if not stripe_secret_key:
    raise ValueError("STRIPE_SECRET_KEY environment variable not set.")
# IMPORTANT: Keep .strip() here for good measure, to handle any accidental spaces
stripe.api_key = stripe_secret_key.strip()
print(f"DEBUG: Stripe API Key loaded (masked): {stripe_secret_key[:5]}...{stripe_secret_key[-4:]}")


# --- Pydantic Models for Data Validation ---
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    eventType: str
    message: str
    phone: Optional[str] = None
    company: Optional[str] = None

class CheckoutItem(BaseModel):
    id: str
    name: str
    price_gbp_cents: int
    quantity: int

class CheckoutRequest(BaseModel):
    items: List[CheckoutItem]


# --- FastAPI App Initialization ---
app = FastAPI(
    title="Electric Pulse Website API",
    description="API for the official Electric Pulse website, handling contact forms and serving the frontend, and Stripe payments.",
    version="1.4.0"
)

# --- CORS (Cross-Origin Resource Sharing) Middleware ---
origins = [
    "https://electric-pulse-production.up.railway.app",
    "http://localhost",
    "http://localhost:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.post("/api/send-email")
async def send_email_with_resend(contact_form: ContactForm):
    """
    This endpoint receives contact form data, validates it, and sends an email via Resend.
    """
    resend_api_key = os.environ.get("RESEND_API_KEY")
    to_email = os.environ.get("TO_EMAIL")
    from_email = os.environ.get("FROM_EMAIL") 

    if not all([resend_api_key, to_email, from_email]):
        print("ERROR: One or more environment variables for the email service are missing.")
        raise HTTPException(
            status_code=500,
            detail="Server configuration error: Email service variables are not set up."
        )

    resend.api_key = resend_api_key
    subject = f"New Contact Form Submission: {contact_form.eventType}"
    
    phone_html = f"<li><strong>Phone:</strong> {contact_form.phone}</li>" if contact_form.phone else ""
    company_html = f"<li><strong>Company:</strong> {contact_form.company}</li>" if contact_form.company else ""

    html_content = f"""
    <h2>New Inquiry from the Electric Pulse Website!</h2>
    <p>You've received a new message from a fan. Here are the details:</p>
    <ul>
        <li><strong>Name:</strong> {contact_form.name}</li>
        <li><strong>Email:</strong> <a href="mailto:{contact_form.email}">{contact_form.email}</a></li>
        {phone_html}
        {company_html}
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
        print(f"An exception occurred while trying to send email: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while trying to send the email: {e}"
        )

@app.post("/api/create-checkout-session")
async def create_checkout_session(checkout_request: CheckoutRequest, request: Request):
    """
    Creates a Stripe Checkout Session and returns its URL for redirection.
    Collects billing and shipping address.
    """
    try:
        line_items = []
        for item in checkout_request.items:
            line_items.append({
                'price_data': {
                    'currency': 'gbp',
                    'product_data': {
                        'name': item.name,
                    },
                    'unit_amount': item.price_gbp_cents,
                },
                'quantity': item.quantity,
            })

        base_url = str(request.base_url).rstrip('/')
        success_url = f"{base_url}/success.html"
        cancel_url = f"{base_url}/cancel.html"   

        checkout_session = stripe.checkout.Session.create(
            line_items=line_items,
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            billing_address_collection='required',
            shipping_address_collection={
                'allowed_countries': ['GB', 'US', 'CA', 'DE', 'FR', 'AU'],
            },
            metadata={
                "customer_email": checkout_request.items[0].id
            }
        )
        return {"checkout_url": checkout_session.url}

    except stripe.error.StripeError as e:
        print(f"Stripe Error: {e}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {e.user_message}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {e}")


@app.get("/api/health")
def health_check():
    """
    A simple health check endpoint to confirm the API is running.
    """
    return {"status": "ok", "service": "Electric Pulse API"}

# --- Static Files Mount ---
app.mount("/", StaticFiles(directory="public", html=True), name="static")