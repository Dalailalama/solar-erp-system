# CRM/urls.py  (better use lowercase app name: crm)
from django.urls import path
from django.http import HttpResponse

# temporary test view
def crm_health(request):
    return HttpResponse("CRM OK")

urlpatterns = [
    path("health/", crm_health, name="crm_health"),
]
    