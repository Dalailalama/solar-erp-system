from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, FileResponse, Http404
from django.views.decorators.http import require_http_methods
from login_required import login_not_required
import os
from django.conf import settings
# from django.http import 

# ===== MAIN PAGES =====

@login_not_required
def home(request):
    """
    Solar Website Landing Page
    SEO-optimized homepage with hero, benefits, services, testimonials, and FAQ
    """
    context = {
        'page_title': 'Best Solar Panel Installation Company',
        'meta_description': 'Leading solar energy company providing professional solar panel installation',
    }
    return render(request, 'website/home.html', context)


@login_not_required
def about(request):
    """
    About Us Page
    Company history, mission, team, and achievements
    """
    context = {
        'page_title': 'About Us - Your Solar Company',
    }
    return render(request, 'website/about.html', context)


# ===== SERVICES =====

@login_not_required
def residential(request):
    """
    Residential Solar Services Page
    Solar solutions for homeowners
    """
    context = {
        'page_title': 'Residential Solar Panel Installation',
    }
    return render(request, 'website/residential.html', context)


@login_not_required
def commercial(request):
    """
    Commercial Solar Services Page
    Solar solutions for businesses
    """
    context = {
        'page_title': 'Commercial Solar Installation',
    }
    return render(request, 'website/commercial.html', context)


@login_not_required
def industrial(request):
    """
    Industrial Solar Services Page
    Large-scale solar solutions for industrial facilities
    """
    context = {
        'page_title': 'Industrial Solar Solutions',
    }
    return render(request, 'website/industrial.html', context)


# ===== PRODUCTS & PORTFOLIO =====

@login_not_required
def products(request):
    """
    Solar Products Page
    Solar panels, inverters, batteries, and equipment
    """
    context = {
        'page_title': 'Solar Panels and Equipment',
    }
    return render(request, 'website/products.html', context)


@login_not_required
def portfolio(request):
    """
    Portfolio Page
    Showcase of completed solar installation projects
    """
    context = {
        'page_title': 'Solar Installation Projects Portfolio',
    }
    return render(request, 'website/portfolio.html', context)


# ===== TOOLS =====

@login_not_required
def calculator(request):
    """
    Solar Calculator Page
    Interactive tool to calculate solar savings and ROI
    """
    context = {
        'page_title': 'Free Solar Panel Cost Calculator',
    }
    return render(request, 'website/calculator.html', context)


@login_not_required
def quote(request):
    """
    Get Quote Page
    Multi-step form for requesting solar installation quote
    """
    context = {
        'page_title': 'Get Free Solar Quote',
    }
    return render(request, 'website/quote.html', context)


# ===== INFORMATION =====

@login_not_required
def subsidies(request):
    """
    Subsidies & Incentives Page
    Information about government subsidies and tax credits
    """
    context = {
        'page_title': 'Solar Panel Subsidies and Incentives',
    }
    return render(request, 'website/subsidies.html', context)


@login_not_required
def financing(request):
    """
    Financing Options Page
    Solar panel financing, loans, and payment plans
    """
    context = {
        'page_title': 'Solar Panel Financing Options',
    }
    return render(request, 'website/financing.html', context)


@login_not_required
def faq(request):
    """
    FAQ Page
    Frequently asked questions about solar energy
    """
    context = {
        'page_title': 'Solar Panel FAQ - Frequently Asked Questions',
    }
    return render(request, 'website/faq.html', context)


# ===== BLOG =====

@login_not_required
def blog(request):
    """
    Blog List Page
    Solar energy articles and news
    """
    context = {
        'page_title': 'Solar Energy Blog',
    }
    return render(request, 'website/blog.html', context)


@login_not_required
def blog_post(request, slug):
    """
    Individual Blog Post Page
    Single blog article with SEO optimization
    """
    # TODO: Fetch blog post from database using slug
    context = {
        'page_title': 'Blog Post Title',
        'slug': slug,
    }
    return render(request, 'website/blog_post.html', context)


# ===== CONTACT & SUPPORT =====

@login_not_required
def contact(request):
    """
    Contact Page
    Contact form and company information
    """
    from CRM.models import Category
    project_categories = Category.objects.filter(group='project_type', is_active=True)
    
    context = {
        'page_title': 'Contact Us - Get in Touch',
        'project_categories': project_categories,
    }
    return render(request, 'website/contact.html', context)


@login_not_required
def support(request):
    """
    Support Page
    Customer support and maintenance services
    """
    context = {
        'page_title': 'Solar Panel Support & Maintenance',
    }
    return render(request, 'website/support.html', context)


# ===== OTHER =====

@login_not_required
def careers(request):
    """
    Careers Page
    Job openings and career opportunities
    """
    context = {
        'page_title': 'Careers - Join Our Team',
    }
    return render(request, 'website/careers.html', context)


@login_not_required
def privacy(request):
    """
    Privacy Policy Page
    """
    context = {
        'page_title': 'Privacy Policy',
    }
    return render(request, 'website/privacy.html', context)


@login_not_required
def terms(request):
    """
    Terms of Service Page
    """
    context = {
        'page_title': 'Terms of Service',
    }
    return render(request, 'website/terms.html', context)


@login_not_required
def sitemap(request):
    """
    HTML Sitemap Page
    """
    context = {
        'page_title': 'Sitemap',
    }
    return render(request, 'website/sitemap.html', context)


# ===== API ENDPOINTS (for AJAX requests) =====

@login_not_required
@require_http_methods(["POST"])
def newsletter_subscribe(request):
    """
    API endpoint for newsletter subscription
    """
    import json
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        
        if not email:
            return JsonResponse({'success': False, 'message': 'Email is required'}, status=400)
        
        # TODO: Save email to database and send confirmation email
        
        return JsonResponse({'success': True, 'message': 'Successfully subscribed!'})
    
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


@login_not_required   # use your decorator here
def download_brochure(request):
    relative_path = 'website/files/brochure-small.pdf'
    file_path = os.path.join(settings.MEDIA_ROOT, relative_path)

    if not os.path.exists(file_path):
        raise Http404("Brochure not found")

    return FileResponse(
        open(file_path, 'rb'),
        as_attachment=True,
        filename='solar-brochure.pdf',  # what user sees
        content_type='application/pdf',
    )
