from django.shortcuts import render

def home(request):
    """
    Public Landing Page View
    """
    return render(request, 'website/home.html')
