# crm/schemas.py
from ninja import Schema
from datetime import datetime
from typing import Any, Dict, List, Optional


class FormSubmissionIn(Schema):
    form_name: str              # "contact_us", "feasibility_study", "newsletter"
    data: Dict[str, Any]        # raw form fields from frontend


class LeadOut(Schema):
    id: int
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    subject: str | None = None
    message: str | None = None
    source: str
    status: str
    extra_data: Dict[str, Any]
    created_at: datetime


class StandardResponse(Schema):
    code: int
    message: str
    data: Optional[Dict[str, Any]] = None
