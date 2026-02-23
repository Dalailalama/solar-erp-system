# crm/config.py

# Map incoming form keys to our generic Lead fields
FORM_MAPPINGS = {
    "contact_us": {
        "name_keys": ["full_name", "name"],
        "email_keys": ["email", "email_address"],
        "phone_keys": ["phone", "phone_number"],
        "subject_keys": ["subject", "contactSubject"],
        "message_keys": ["message"],
    },
    "feasibility_study": {
        "name_keys": ["company_name", "full_name"],
        "email_keys": ["work_email", "email"],
        "phone_keys": ["phone_number", "phone"],
        "subject_keys": [],
        "message_keys": [],
    },
    "newsletter": {
        "name_keys": [],
        "email_keys": ["email", "email_address"],
        "phone_keys": [],
        "subject_keys": [],
        "message_keys": [],
    },
}

DEFAULT_SUBSCRIBER_TAGS_BY_FORM = {
    "newsletter": ["newsletter"],
    "contact_us": ["contact-from-site"],
}
