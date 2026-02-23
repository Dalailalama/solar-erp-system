# crm/api.py
from ninja import Router
from django.db import transaction
from .models import Lead, FormSubmission, Subscriber
from .schemas import FormSubmissionIn, LeadOut, StandardResponse
from .config import FORM_MAPPINGS, DEFAULT_SUBSCRIBER_TAGS_BY_FORM


router = Router(tags=["crm"])


def _extract_first(data: dict, keys: list[str]) -> str:
    """Return first non-empty value for any key in keys."""
    for key in keys:
        value = data.get(key)
        if value:
            return str(value)
    return ""


@router.post("/forms/submit", response=StandardResponse)
@transaction.atomic
def submit_form(request, payload: FormSubmissionIn):
    """
    Generic endpoint for any website form:
    - contact_us (contact form)
    - feasibility_study (solar feasibility form)
    - newsletter (email only)
    """
    mapping = FORM_MAPPINGS.get(
        payload.form_name,
        {"name_keys": [], "email_keys": [], "phone_keys": [], "subject_keys": [], "message_keys": []},
    )

    # Core field extraction
    name = _extract_first(payload.data, mapping["name_keys"])
    email = _extract_first(payload.data, mapping["email_keys"])
    phone = _extract_first(payload.data, mapping["phone_keys"])
    subject = _extract_first(payload.data, mapping["subject_keys"])
    message = _extract_first(payload.data, mapping["message_keys"])

    # Resolve dynamic category if present in payload
    # Based on our frontend, mapping["subject_keys"] usually contains "contactSubject"
    resolved_category = None
    if subject:
        from .models import Category
        resolved_category = Category.objects.filter(slug=subject, group='project_type').first()

    # Create lead
    try:
        lead = Lead.objects.create(
            full_name=name,
            email=email,
            phone=phone,
            category=resolved_category,
            subject=resolved_category.name if resolved_category else subject,
            message=message,
            source=payload.form_name,
            extra_data=payload.data,
        )

        # Store raw submission
        FormSubmission.objects.create(
            form_name=payload.form_name,
            data=payload.data,
            lead=lead,
        )

        # Optional newsletter subscriber
        tags = DEFAULT_SUBSCRIBER_TAGS_BY_FORM.get(payload.form_name)
        if email and tags:
            sub, created = Subscriber.objects.get_or_create(
                email=email,
                defaults={"name": name, "tags": tags},
            )
            if not created:
                current_tags = set(sub.tags or [])
                sub.tags = list(current_tags.union(tags))
                sub.save()

        return {
            "code": 1,  # RESPONSE_CODES.SUCCESS
            "message": "Your inquiry has been received. Our engineers will reach out shortly.",
            "data": {"lead_id": lead.id}
        }
    except Exception as e:
        return {
            "code": 0,  # RESPONSE_CODES.ERROR
            "message": f"Submission failed: {str(e)}"
        }


@router.get("/leads", response=list[LeadOut])
def list_leads(request, status: str | None = None, source: str | None = None):
    """
    List leads for CRM dashboard (filter by status/source).
    """
    qs = Lead.objects.all()
    if status:
        qs = qs.filter(status=status)
    if source:
        qs = qs.filter(source=source)
    return qs
