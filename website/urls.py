from django.urls import path
from . import views

app_name = 'website'

urlpatterns = [
    # Main Pages
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    
    # Services
    path('services/residential/', views.residential, name='residential'),
    path('services/commercial/', views.commercial, name='commercial'),
    path('services/industrial/', views.industrial, name='industrial'),
    
    # Products & Portfolio
    path('products/', views.products, name='products'),
    path('portfolio/', views.portfolio, name='portfolio'),
    
    # Tools
    path('calculator/', views.calculator, name='calculator'),
    path('quote/', views.quote, name='quote'),
    
    # Information
    path('subsidies/', views.subsidies, name='subsidies'),
    path('financing/', views.financing, name='financing'),
    path('faq/', views.faq, name='faq'),
    
    # Blog
    path('blog/', views.blog, name='blog'),
    path('blog/<slug:slug>/', views.blog_post, name='blog_post'),
    
    # Contact & Support
    path('contact/', views.contact, name='contact'),
    path('support/', views.support, name='support'),
    
    # Other
    path('careers/', views.careers, name='careers'),
    path('privacy/', views.privacy, name='privacy'),
    path('terms/', views.terms, name='terms'),
    path('sitemap/', views.sitemap, name='sitemap'),
    
    path('download_brochure/', views.download_brochure, name='download_brochure'),
]
