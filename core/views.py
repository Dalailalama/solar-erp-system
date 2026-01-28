from django.shortcuts import render

def index(request):
    """Main index page with sidebar menu"""
    return render(request, 'core/index.html')
