# 🌞 SOLAR WEBSITE DEVELOPMENT - COMPLETE PROMPT

## 📋 PROJECT OVERVIEW

Build a **professional, SEO-optimized, high-ranking solar energy website** using **Vue 3 + TypeScript** that leverages the existing **ERP Core Framework** for maximum efficiency and functionality.

**Reference Website:** https://saysolar.in/

**Primary Goal:** Create a solar website that ranks #1 in search results for solar-related keywords while providing an exceptional user experience and high conversion rates.

---

## 🎯 CORE REQUIREMENTS

### Technology Stack
- **Frontend:** Vue 3.5.25 (Composition API)
- **Language:** TypeScript 5.9.3
- **Build Tool:** Vite 7.2.7
- **Router:** Vue Router 4.6.4
- **Backend:** Django 6.0 + Django Ninja API
- **Framework:** Existing ERP Core Framework (`@core/base.js`)

### Available Core Framework Services
```typescript
// Access via $fx global proxy
$fx.api          // API calls with caching (useApi)
$fx.toast        // Toast notifications (useToast)
$fx.validation   // Form validation with Zod (useValidation)
$fx.auth         // Authentication (useAuth)
$fx.format       // Number/date formatting (useFormatter)
$fx.charts       // Chart.js integration (useCharts)
$fx.export       // Excel/PDF export (useExport)
$fx.bus          // Event bus (useEventBus)
$fx.utils        // Navigation, debounce, throttle (useUtils)
$fx.dialog       // Dialog management (useDialog)
$fx.loading      // Loading states (useLoading)
$fx.permission   // Permission checks (usePermission)
$fx.socket       // WebSocket support (useSocket)
$fx.meta         // Metadata management (useMetadata)
$fx.cmd          // Command palette (useCommand)
$fx.files        // File handling (useFiles)
$fx.collaboration // Real-time collaboration (useCollaboration)
```

### Available UI Components (Auto-registered)
- `<data-table>` - Advanced data table with virtual scrolling
- `<schema-form>` - Dynamic form generation
- `<toast-container>` - Toast notifications
- `<command-palette>` - Command palette
- `<confirm-dialog>` - Confirmation dialogs
- `<loading-bar>` - Loading indicator
- `<error-boundary>` - Error handling
- `<collaboration-indicator>` - Real-time collaboration

---

## 📁 PROJECT STRUCTURE

```
website/
├── static/
│   └── website/
│       ├── css/
│       │   ├── solar-design-system.css      # Design tokens & CSS variables
│       │   ├── solar-components.css         # Component-specific styles
│       │   ├── solar-responsive.css         # Mobile-first responsive styles
│       │   └── solar-animations.css         # Scroll animations & transitions
│       ├── js/
│       │   └── website/
│       │       ├── app.ts                   # Main Vue app entry
│       │       ├── router.ts                # Vue Router with SEO-friendly URLs
│       │       ├── seo/
│       │       │   ├── metaManager.ts       # Dynamic meta tag management
│       │       │   ├── schemaGenerator.ts   # JSON-LD structured data
│       │       │   └── sitemapData.ts       # Sitemap configuration
│       │       ├── components/
│       │       │   ├── seo/
│       │       │   │   ├── MetaTags.vue
│       │       │   │   ├── StructuredData.vue
│       │       │   │   └── Breadcrumbs.vue
│       │       │   ├── layout/
│       │       │   │   ├── SolarHeader.vue
│       │       │   │   ├── SolarFooter.vue
│       │       │   │   └── SolarLayout.vue
│       │       │   ├── home/
│       │       │   │   ├── HeroSection.vue
│       │       │   │   ├── ProcessSteps.vue
│       │       │   │   ├── WorkingDomains.vue
│       │       │   │   ├── WhyChooseUs.vue
│       │       │   │   ├── StatsCounter.vue
│       │       │   │   ├── Testimonials.vue
│       │       │   │   └── CTASection.vue
│       │       │   ├── calculator/
│       │       │   │   ├── SolarCalculator.vue
│       │       │   │   ├── CalculatorForm.vue
│       │       │   │   ├── SavingsChart.vue
│       │       │   │   └── ResultsDisplay.vue
│       │       │   ├── portfolio/
│       │       │   │   ├── ProjectGrid.vue
│       │       │   │   ├── ProjectCard.vue
│       │       │   │   ├── ProjectFilter.vue
│       │       │   │   └── ProjectLightbox.vue
│       │       │   ├── blog/
│       │       │   │   ├── BlogGrid.vue
│       │       │   │   ├── BlogCard.vue
│       │       │   │   ├── BlogPost.vue
│       │       │   │   └── BlogSidebar.vue
│       │       │   ├── forms/
│       │       │   │   ├── ContactForm.vue
│       │       │   │   ├── QuoteForm.vue
│       │       │   │   ├── MultiStepForm.vue
│       │       │   │   └── NewsletterForm.vue
│       │       │   └── shared/
│       │       │       ├── SolarButton.vue
│       │       │       ├── SolarCard.vue
│       │       │       ├── SolarModal.vue
│       │       │       ├── SolarAccordion.vue
│       │       │       ├── SolarTabs.vue
│       │       │       ├── LoadingSpinner.vue
│       │       │       └── ImageCarousel.vue
│       │       ├── composables/
│       │       │   ├── useSolarCalculator.ts
│       │       │   ├── useSEO.ts
│       │       │   ├── useAnalytics.ts
│       │       │   ├── useQuoteForm.ts
│       │       │   ├── useScrollAnimation.ts
│       │       │   ├── useImageLightbox.ts
│       │       │   └── useCounterAnimation.ts
│       │       ├── services/
│       │       │   ├── solarApi.ts
│       │       │   ├── blogService.ts
│       │       │   ├── quoteService.ts
│       │       │   └── seoService.ts
│       │       ├── utils/
│       │       │   ├── solarCalculations.ts
│       │       │   ├── validators.ts
│       │       │   └── formatters.ts
│       │       ├── types/
│       │       │   ├── solar.types.ts
│       │       │   ├── calculator.types.ts
│       │       │   ├── form.types.ts
│       │       │   └── seo.types.ts
│       │       └── views/
│       │           ├── HomePage.vue
│       │           ├── AboutPage.vue
│       │           ├── ResidentialPage.vue
│       │           ├── CommercialPage.vue
│       │           ├── IndustrialPage.vue
│       │           ├── ProductsPage.vue
│       │           ├── PortfolioPage.vue
│       │           ├── CalculatorPage.vue
│       │           ├── SubsidiesPage.vue
│       │           ├── BlogPage.vue
│       │           ├── BlogPostPage.vue
│       │           ├── FAQPage.vue
│       │           ├── ContactPage.vue
│       │           ├── QuotePage.vue
│       │           ├── FinancingPage.vue
│       │           ├── SupportPage.vue
│       │           ├── CareersPage.vue
│       │           └── city/
│       │               └── [City]SolarPage.vue
│       └── images/
│           ├── optimized/                   # WebP/AVIF images
│           ├── hero/
│           ├── products/
│           ├── projects/
│           ├── team/
│           └── icons/
└── templates/
    └── website/
        ├── index.html                       # Main Django template
        ├── sitemap.xml                      # Dynamic sitemap
        └── robots.txt                       # Robots configuration
```

---

## 🎨 DESIGN SYSTEM

### Color Palette (Solar Energy Theme)
```css
:root {
  /* Primary Colors */
  --solar-orange: #FF6B35;
  --solar-orange-light: #FF8A5C;
  --solar-orange-dark: #E65420;
  
  --solar-yellow: #F7B801;
  --solar-yellow-light: #FFD23F;
  --solar-yellow-dark: #D99F00;
  
  --energy-green: #2ECC71;
  --energy-green-light: #58D68D;
  --energy-green-dark: #27AE60;
  
  /* Secondary Colors */
  --sky-blue: #3498DB;
  --deep-blue: #2C3E50;
  
  /* Neutral Colors */
  --white: #FFFFFF;
  --light-gray: #F8F9FA;
  --medium-gray: #6C757D;
  --dark-gray: #343A40;
  --black: #000000;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #FF6B35 0%, #F7B801 100%);
  --gradient-secondary: linear-gradient(135deg, #3498DB 0%, #2ECC71 100%);
  --gradient-overlay: linear-gradient(135deg, rgba(255, 107, 53, 0.9) 0%, rgba(247, 184, 1, 0.9) 100%);
  
  /* Typography */
  --font-primary: 'Inter', sans-serif;
  --font-secondary: 'Poppins', sans-serif;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
  --spacing-4xl: 6rem;
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
}
```

### Typography Scale
```css
/* Font Sizes */
--fs-xs: 0.75rem;      /* 12px */
--fs-sm: 0.875rem;     /* 14px */
--fs-base: 1rem;       /* 16px */
--fs-lg: 1.125rem;     /* 18px */
--fs-xl: 1.25rem;      /* 20px */
--fs-2xl: 1.5rem;      /* 24px */
--fs-3xl: 1.875rem;    /* 30px */
--fs-4xl: 2.25rem;     /* 36px */
--fs-5xl: 3rem;        /* 48px */
--fs-6xl: 3.75rem;     /* 60px */

/* Font Weights */
--fw-light: 300;
--fw-regular: 400;
--fw-medium: 500;
--fw-semibold: 600;
--fw-bold: 700;
--fw-extrabold: 800;
```

---

## 🔍 SEO STRATEGY

### Target Keywords

#### Primary Keywords (High Volume)
- Solar panel installation
- Solar energy company
- Residential solar panels
- Commercial solar installation
- Solar panel cost

#### Secondary Keywords (Medium Volume)
- Solar panel installation near me
- Best solar company [city]
- Solar panel calculator
- Solar energy savings
- Solar panel financing

#### Long-tail Keywords (High Intent)
- How much do solar panels cost in [city]
- Solar panel installation process
- Residential solar panel tax credits [state]
- Commercial solar panel ROI
- Solar panel maintenance cost

#### Local Keywords
- Solar panel installation [city]
- Solar company in [city]
- [City] solar energy
- Solar panels [city] [state]

### SEO Requirements Per Page

#### Meta Tags Template
```html
<title>[Primary Keyword] | [Secondary Keyword] | [Brand Name]</title>
<meta name="description" content="[150-160 characters with primary keyword and CTA]">
<meta name="keywords" content="[primary, secondary, long-tail keywords]">
<link rel="canonical" href="[absolute URL]">

<!-- Open Graph -->
<meta property="og:title" content="[Engaging title with keyword]">
<meta property="og:description" content="[Compelling description]">
<meta property="og:image" content="[1200x630 image URL]">
<meta property="og:url" content="[Canonical URL]">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[Title]">
<meta name="twitter:description" content="[Description]">
<meta name="twitter:image" content="[Image URL]">

<!-- SEO Extras -->
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta name="geo.region" content="[State Code]">
<meta name="geo.placename" content="[City]">
```

#### Structured Data (JSON-LD)
Implement for:
1. **Organization** - Company information
2. **LocalBusiness** - Local SEO
3. **Service** - Service offerings
4. **Product** - Solar products
5. **FAQPage** - FAQ sections
6. **Article** - Blog posts
7. **BreadcrumbList** - Navigation
8. **AggregateRating** - Reviews
9. **Review** - Customer testimonials

#### Content Structure
```markdown
# H1: Primary Keyword (One per page)
## H2: Secondary Keywords (2-4 per page)
### H3: Supporting topics
#### H4: Details

Content Requirements:
- First paragraph: Hook + primary keyword in first 100 words
- Content length: 1500-2500 words for main pages
- Keyword density: 1-2% (natural placement)
- Internal links: 3-5 per page
- External links: 1-2 authoritative sources
- Images: 5-8 with descriptive alt text
- Lists and bullet points for readability
```

### Performance Targets (Core Web Vitals)
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **FCP (First Contentful Paint):** < 1.8s
- **TTI (Time to Interactive):** < 3.8s
- **Lighthouse Performance Score:** > 90

---

## 📄 COMPLETE PAGE LIST (17+ Pages)

### 1. **Home Page** (`/`)
**Primary Keyword:** "Solar Panel Installation [City]"

**Sections:**
- Hero Section (Full-screen with CTA)
- Key Benefits (4-6 benefit cards)
- How It Works (6-step process)
- Working Domains (Residential, Commercial, Industrial)
- Why Choose Us (USPs)
- Statistics Counter (Animated counters)
- Customer Testimonials (Carousel)
- Portfolio Preview (Recent projects)
- Blog Preview (Latest 3 posts)
- FAQ Section (Accordion)
- CTA Section (Get Free Quote)
- Partners/Certifications

**SEO:**
- Title: "Best Solar Panel Installation Company | Residential & Commercial Solar"
- Meta Description: "Leading solar energy company providing professional solar panel installation. Get free quotes, calculate savings, 25-year warranty. Serving [City] for X years."
- Schema: Organization, LocalBusiness
- Word Count: 1500-2000 words

---

### 2. **About Us** (`/about`)
**Primary Keyword:** "About [Company Name] Solar"

**Sections:**
- Hero with company tagline
- Our Story (Company history)
- Mission & Vision
- Team Section (Leadership + key members)
- Our Values (Core values with icons)
- Achievements & Milestones (Timeline)
- Certifications & Awards
- Future Goals

**SEO:**
- Word Count: 1200-1500 words
- Schema: Organization, Person (for team members)

---

### 3. **Residential Solar** (`/services/residential`)
**Primary Keyword:** "Residential Solar Panel Installation [City]"

**Sections:**
- Hero with residential home image
- Benefits for Homeowners
- System Sizes & Options
- Cost Savings Calculator Preview
- Installation Process
- Financing Options
- Case Studies/Examples
- Homeowner Testimonials
- CTA for Free Consultation

**SEO:**
- Word Count: 2000-2500 words
- Schema: Service, Offer
- Internal Links: Calculator, Quote Form, Blog

---

### 4. **Commercial Solar** (`/services/commercial`)
**Primary Keyword:** "Commercial Solar Installation [City]"

**Sections:**
- Hero with commercial building
- Benefits for Businesses
- ROI & Tax Incentives
- System Scalability
- Energy Management
- Business Case Studies
- Industries Served
- CTA for Business Consultation

**SEO:**
- Word Count: 2000-2500 words
- Schema: Service, Offer

---

### 5. **Industrial Solar** (`/services/industrial`)
**Primary Keyword:** "Industrial Solar Solutions [City]"

**Sections:**
- Hero with industrial facility
- Large-Scale Solutions
- Power Requirements Analysis
- Grid Integration
- Maintenance & Monitoring
- Industrial Case Studies
- Custom Solutions
- CTA for Site Analysis

**SEO:**
- Word Count: 2000-2500 words
- Schema: Service, Offer

---

### 6. **Products** (`/products`)
**Primary Keyword:** "Solar Panels and Equipment"

**Sections:**
- Solar Panels (Types, specs, brands)
- Inverters (String, micro, hybrid)
- Battery Storage (Energy storage solutions)
- Mounting Systems (Roof, ground, carport)
- Monitoring Systems (Real-time monitoring)
- Complete Packages (Pre-configured systems)

**SEO:**
- Word Count: 1800-2200 words
- Schema: Product, Offer
- Comparison tables

---

### 7. **Portfolio** (`/portfolio`)
**Primary Keyword:** "Solar Installation Projects [City]"

**Sections:**
- Filter Options (Type, capacity, location)
- Project Grid (Image gallery with lightbox)
- Featured Projects (Detailed case studies)
- Before/After Comparisons
- Interactive Map (Optional)

**SEO:**
- Word Count: 1000-1500 words
- Schema: ImageGallery
- Image optimization critical

---

### 8. **Solar Calculator** (`/calculator`)
**Primary Keyword:** "Solar Panel Cost Calculator"

**Sections:**
- Calculator Interface (Interactive form)
- Results Display (Savings, ROI, payback)
- Visual Charts (Chart.js graphs)
- How to Use Guide
- Understanding Your Savings
- Factors Affecting Cost
- Next Steps CTA

**SEO:**
- Word Count: 1200-1500 words
- Schema: WebApplication
- High engagement = SEO boost

---

### 9. **Subsidies & Incentives** (`/subsidies`)
**Primary Keyword:** "Solar Panel Subsidies [State]"

**Sections:**
- Current Government Schemes
- Eligibility Criteria
- How to Apply (Step-by-step)
- Subsidy Calculator
- Latest Updates & News

**SEO:**
- Word Count: 1500-2000 words
- Schema: GovernmentService
- Update regularly for freshness

---

### 10. **Blog** (`/blog`)
**Primary Keyword:** "Solar Energy Blog"

**Sections:**
- Featured Post
- Recent Posts Grid
- Categories/Tags Filter
- Search Functionality
- Pagination

**SEO:**
- Schema: Blog, CollectionPage
- Publish 2-4 posts per month

---

### 11. **Blog Post** (`/blog/:slug`)
**Primary Keyword:** [Article-specific long-tail keyword]

**Sections:**
- Article Header (Title, author, date, reading time)
- Featured Image
- Table of Contents (for long posts)
- Article Content (1500-3000 words)
- Tags
- Share Buttons
- Related Posts
- Comments (Optional)

**SEO:**
- Word Count: 1500-3000 words
- Schema: Article, Person (author)
- Internal linking to service pages

**Blog Topics:**
- "What to Know Before Installing Solar Panels"
- "Different Types of Solar Panels Explained"
- "Solar Panel Subsidy Guide [State]"
- "How to Maintain Your Solar System"
- "Solar Energy Myths Debunked"
- "ROI of Solar Installation"
- "Solar Panel Installation Process"
- "Commercial Solar Benefits"

---

### 12. **FAQ** (`/faq`)
**Primary Keyword:** "Solar Panel FAQ"

**Sections:**
- Search Bar
- Categories (General, Installation, Costs, Maintenance, Subsidies)
- Accordion FAQs (20-30 questions)
- Still Have Questions CTA

**SEO:**
- Word Count: 1500-2000 words
- Schema: FAQPage (critical for rich results)
- Update regularly

---

### 13. **Contact** (`/contact`)
**Primary Keyword:** "Contact [Company Name]"

**Sections:**
- Contact Form (Name, email, phone, message)
- Contact Information (Address, phone, email, hours)
- Google Map (Embedded)
- Alternative Contact Methods (WhatsApp, social media)
- Regional Offices (if applicable)

**SEO:**
- Schema: ContactPage, PostalAddress
- NAP consistency critical

---

### 14. **Get Quote** (`/quote`)
**Primary Keyword:** "Free Solar Quote"

**Sections:**
- Multi-Step Form (4 steps)
  - Step 1: Personal Information
  - Step 2: Property Details
  - Step 3: Energy Consumption
  - Step 4: Preferences
- Progress Indicator
- File Upload (Electricity bill, roof photos)
- Confirmation Page

**SEO:**
- Schema: Service, Offer
- Conversion tracking essential

---

### 15. **Financing** (`/financing`)
**Primary Keyword:** "Solar Panel Financing Options"

**Sections:**
- Financing Options (Cash, loans, lease, PPA)
- Loan Partners
- EMI Calculator
- Benefits Comparison Table
- Application Process

**SEO:**
- Word Count: 1500-1800 words
- Schema: FinancialProduct

---

### 16. **Support** (`/support`)
**Primary Keyword:** "Solar Panel Maintenance & Support"

**Sections:**
- Maintenance Services
- Warranty Information
- Support Options (24/7 helpline, portal)
- Troubleshooting Guide
- Service Request Form

**SEO:**
- Word Count: 1200-1500 words
- Schema: Service

---

### 17. **Careers** (`/careers`)
**Primary Keyword:** "Solar Energy Careers"

**Sections:**
- Why Work With Us
- Current Openings
- Application Form
- Employee Benefits

**SEO:**
- Schema: JobPosting

---

### 18. **City Pages** (`/city/[city-name]`)
**Primary Keyword:** "Solar Panel Installation [City Name]"

**Sections:**
- City-specific hero
- Local Benefits (Sunlight hours, incentives)
- Service Areas (Neighborhoods)
- Local Projects
- Local Testimonials
- City-specific Quote Form

**SEO:**
- Create 10-20 city pages for local SEO
- Schema: LocalBusiness, Service
- Word Count: 1200-1500 words per city

---

## 💻 CORE FRAMEWORK USAGE EXAMPLES

### 1. API Calls with Core Framework

```typescript
// services/solarApi.ts
import { $fx } from '@core/base.js';

export const solarApi = {
  // Get solar products with caching
  async getProducts() {
    return await $fx.api.get('/api/solar/products', {}, {
      cacheTTL: 300000, // Cache for 5 minutes
      showToast: false
    });
  },
  
  // Submit quote request
  async submitQuote(formData: QuoteFormData) {
    return await $fx.api.post('/api/solar/quote', formData, {
      showToast: true,
      onSuccess: (response) => {
        $fx.toast.success('Quote request submitted successfully!');
        $fx.bus.emit('quote-submitted', response);
      },
      onError: (error) => {
        $fx.toast.error('Failed to submit quote. Please try again.');
      }
    });
  },
  
  // Get blog posts
  async getBlogPosts(page = 1, category = null) {
    return await $fx.api.get('/api/solar/blog', {
      params: { page, category }
    }, {
      cacheTTL: 600000, // Cache for 10 minutes
      showToast: false
    });
  },
  
  // Calculate solar savings
  async calculateSavings(input: CalculatorInput) {
    return await $fx.api.post('/api/solar/calculate', input, {
      showToast: false
    });
  }
};
```

### 2. Form Validation with Core Framework

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="email">Email</label>
      <input 
        id="email"
        v-model="formData.email" 
        type="email"
        @blur="validation.touch('email')"
        :class="{ 'error': validation.hasError('email') && validation.isTouched('email') }"
      />
      <span v-if="validation.hasError('email') && validation.isTouched('email')" class="error-message">
        {{ validation.getError('email') }}
      </span>
    </div>
    
    <div class="form-group">
      <label for="phone">Phone</label>
      <input 
        id="phone"
        v-model="formData.phone" 
        type="tel"
        @blur="validation.touch('phone')"
        :class="{ 'error': validation.hasError('phone') && validation.isTouched('phone') }"
      />
      <span v-if="validation.hasError('phone') && validation.isTouched('phone')" class="error-message">
        {{ validation.getError('phone') }}
      </span>
    </div>
    
    <div class="form-group">
      <label for="monthlyBill">Monthly Electricity Bill ($)</label>
      <input 
        id="monthlyBill"
        v-model.number="formData.monthlyBill" 
        type="number"
        @blur="validation.touch('monthlyBill')"
        :class="{ 'error': validation.hasError('monthlyBill') && validation.isTouched('monthlyBill') }"
      />
      <span v-if="validation.hasError('monthlyBill') && validation.isTouched('monthlyBill')" class="error-message">
        {{ validation.getError('monthlyBill') }}
      </span>
    </div>
    
    <button 
      type="submit" 
      :disabled="!validation.isValid || isSubmitting"
      class="btn btn-primary"
    >
      {{ isSubmitting ? 'Submitting...' : 'Get Free Quote' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { $fx } from '@core/base.js';
import type { QuoteFormData } from '../types/form.types';

const formData = reactive<QuoteFormData>({
  name: '',
  email: '',
  phone: '',
  monthlyBill: 0
});

const isSubmitting = ref(false);

// Use core validation framework
const validation = $fx.validation({
  name: [
    $fx.validation.rules.required('Name is required'),
    $fx.validation.rules.minLength(2, 'Name must be at least 2 characters')
  ],
  email: [
    $fx.validation.rules.required('Email is required'),
    $fx.validation.rules.email('Please enter a valid email address')
  ],
  phone: [
    $fx.validation.rules.required('Phone is required'),
    $fx.validation.rules.phone('Please enter a valid phone number')
  ],
  monthlyBill: [
    $fx.validation.rules.required('Monthly bill is required'),
    $fx.validation.rules.min(0, 'Monthly bill must be positive')
  ]
});

const handleSubmit = async () => {
  // Validate all fields
  const isValid = await validation.validateAll(formData);
  
  if (!isValid) {
    validation.touchAll();
    $fx.toast.error('Please fix the errors in the form');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    await $fx.api.post('/api/solar/quote', formData, {
      showToast: true,
      onSuccess: () => {
        // Reset form
        Object.keys(formData).forEach(key => {
          formData[key] = '';
        });
        validation.reset();
        
        // Track conversion
        if (typeof gtag !== 'undefined') {
          gtag('event', 'conversion', {
            'send_to': 'AW-CONVERSION_ID',
            'value': 1.0,
            'currency': 'USD'
          });
        }
      }
    });
  } catch (error) {
    console.error('Quote submission error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
```

### 3. Chart.js Integration with Core Framework

```vue
<template>
  <div class="savings-chart">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { $fx } from '@core/base.js';
import type { CalculatorResult } from '../types/calculator.types';

const props = defineProps<{
  result: CalculatorResult | null;
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: any = null;

const createChart = async () => {
  if (!chartCanvas.value || !props.result) return;
  
  // Use core charts service
  const charts = $fx.charts;
  
  const data = {
    labels: ['Year 1', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25'],
    datasets: [
      {
        label: 'Cumulative Savings',
        data: calculateCumulativeSavings(props.result),
        backgroundColor: 'rgba(255, 107, 53, 0.2)',
        borderColor: 'rgba(255, 107, 53, 1)',
        borderWidth: 2,
        fill: true
      },
      {
        label: 'System Cost',
        data: [props.result.estimatedCost, props.result.estimatedCost, props.result.estimatedCost, props.result.estimatedCost, props.result.estimatedCost, props.result.estimatedCost],
        backgroundColor: 'rgba(108, 117, 125, 0.2)',
        borderColor: 'rgba(108, 117, 125, 1)',
        borderWidth: 2,
        borderDash: [5, 5]
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Solar Savings Over 25 Years'
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => '$' + value.toLocaleString()
        }
      }
    }
  };
  
  // Create chart using core framework
  chartInstance = await charts.createChart(chartCanvas.value, 'line', data, options);
};

const calculateCumulativeSavings = (result: CalculatorResult) => {
  const annualSavings = result.estimatedAnnualSavings;
  return [
    annualSavings,
    annualSavings * 5,
    annualSavings * 10,
    annualSavings * 15,
    annualSavings * 20,
    annualSavings * 25
  ];
};

watch(() => props.result, () => {
  if (chartInstance) {
    chartInstance.destroy();
  }
  createChart();
});

onMounted(() => {
  createChart();
});
</script>
```

### 4. Export Functionality with Core Framework

```typescript
// Export calculator results to PDF
const exportResultsToPDF = async (result: CalculatorResult) => {
  const exp = $fx.export;
  
  const data = {
    title: 'Solar Savings Calculation Results',
    date: new Date().toLocaleDateString(),
    results: [
      { label: 'Recommended System Size', value: `${result.recommendedSystemSize} kW` },
      { label: 'Estimated Cost', value: $fx.format.currency(result.estimatedCost) },
      { label: 'Annual Savings', value: $fx.format.currency(result.estimatedAnnualSavings) },
      { label: 'Payback Period', value: `${result.paybackPeriod.toFixed(1)} years` },
      { label: 'Lifetime Savings (25 years)', value: $fx.format.currency(result.lifetimeSavings) },
      { label: 'CO2 Offset (Annual)', value: `${result.co2OffsetAnnual.toFixed(0)} kg` }
    ]
  };
  
  await exp.exportToPDF(data, 'solar-savings-report.pdf');
  $fx.toast.success('Report downloaded successfully!');
};

// Export project data to Excel
const exportProjectsToExcel = async (projects: Project[]) => {
  const exp = $fx.export;
  
  const data = projects.map(project => ({
    'Project Name': project.title,
    'Type': project.type,
    'Location': project.location,
    'Capacity (kW)': project.capacity,
    'Installation Date': project.installationDate,
    'Panel Count': project.systemDetails.panelCount
  }));
  
  await exp.exportToExcel(data, 'solar-projects.xlsx');
  $fx.toast.success('Projects exported successfully!');
};
```

---

## 🎯 SEO IMPLEMENTATION EXAMPLES

### 1. Meta Manager (`seo/metaManager.ts`)

```typescript
export interface PageMeta {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  robots?: string;
}

export function useMetaManager() {
  const setPageMeta = (meta: PageMeta) => {
    // Update document title
    document.title = meta.title;
    
    // Update meta tags
    updateMetaTag('description', meta.description);
    if (meta.keywords) updateMetaTag('keywords', meta.keywords);
    updateMetaTag('robots', meta.robots || 'index, follow');
    
    // Open Graph
    updateMetaTag('og:title', meta.title, 'property');
    updateMetaTag('og:description', meta.description, 'property');
    if (meta.ogImage) updateMetaTag('og:image', meta.ogImage, 'property');
    updateMetaTag('og:url', meta.canonical || window.location.href, 'property');
    
    // Twitter Card
    updateMetaTag('twitter:title', meta.title, 'name');
    updateMetaTag('twitter:description', meta.description, 'name');
    if (meta.ogImage) updateMetaTag('twitter:image', meta.ogImage, 'name');
    
    // Canonical
    if (meta.canonical) updateCanonical(meta.canonical);
  };
  
  const updateMetaTag = (name: string, content: string, attr: string = 'name') => {
    let element = document.querySelector(`meta[${attr}="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };
  
  const updateCanonical = (url: string) => {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  };
  
  return { setPageMeta };
}
```

### 2. Schema Generator (`seo/schemaGenerator.ts`)

```typescript
export function generateOrganizationSchema(data: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": data.name,
    "url": data.url,
    "logo": data.logo,
    "description": data.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": data.address.street,
      "addressLocality": data.address.city,
      "addressRegion": data.address.state,
      "postalCode": data.address.zip,
      "addressCountry": data.address.country
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": data.phone,
      "contactType": "Customer Service",
      "email": data.email
    },
    "sameAs": data.socialMedia
  };
}

export function generateLocalBusinessSchema(data: any) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": data.name,
    "image": data.images,
    "@id": data.url,
    "url": data.url,
    "telephone": data.phone,
    "priceRange": data.priceRange,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": data.address.street,
      "addressLocality": data.address.city,
      "addressRegion": data.address.state,
      "postalCode": data.address.zip,
      "addressCountry": data.address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": data.geo.lat,
      "longitude": data.geo.lng
    },
    "openingHoursSpecification": data.hours,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": data.rating.value,
      "reviewCount": data.rating.count
    }
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function generateArticleSchema(article: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "image": article.image,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": article.publisher,
      "logo": {
        "@type": "ImageObject",
        "url": article.publisherLogo
      }
    },
    "datePublished": article.publishedDate,
    "dateModified": article.modifiedDate,
    "description": article.description
  };
}
```

### 3. SEO Composable (`composables/useSEO.ts`)

```typescript
import { onMounted } from 'vue';
import { useMetaManager } from '../seo/metaManager';
import type { PageMeta } from '../seo/metaManager';

export function useSEO(meta: PageMeta, structuredData?: any) {
  const metaManager = useMetaManager();
  
  onMounted(() => {
    // Set meta tags
    metaManager.setPageMeta(meta);
    
    // Add structured data if provided
    if (structuredData) {
      addStructuredData(structuredData);
    }
  });
  
  const addStructuredData = (data: any) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  };
  
  return {
    updateMeta: metaManager.setPageMeta,
    addStructuredData
  };
}
```

### 4. Analytics Integration (`composables/useAnalytics.ts`)

```typescript
export function useAnalytics() {
  const trackPageView = (pagePath: string, pageTitle: string) => {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pagePath,
        page_title: pageTitle
      });
    }
  };
  
  const trackEvent = (eventName: string, eventParams: any = {}) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, eventParams);
    }
  };
  
  const trackConversion = (conversionType: string, value?: number) => {
    trackEvent('conversion', {
      conversion_type: conversionType,
      value: value
    });
  };
  
  return {
    trackPageView,
    trackEvent,
    trackConversion
  };
}
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### Image Optimization

```html
<!-- Use WebP with fallback -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Descriptive alt text" loading="lazy" width="800" height="600">
</picture>

<!-- Responsive images -->
<img 
  srcset="
    image-320w.webp 320w,
    image-640w.webp 640w,
    image-1024w.webp 1024w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  src="image-640w.webp"
  alt="Descriptive alt text"
  loading="lazy"
  width="1024"
  height="768"
/>
```

### Code Splitting

```typescript
// router.ts - Lazy load routes
const routes = [
  {
    path: '/',
    component: () => import('./views/HomePage.vue')
  },
  {
    path: '/calculator',
    component: () => import('./views/CalculatorPage.vue')
  },
  {
    path: '/portfolio',
    component: () => import('./views/PortfolioPage.vue')
  }
];
```

### Critical CSS

```html
<!-- Inline critical CSS in <head> -->
<style>
  /* Above-the-fold styles only */
  body { margin: 0; font-family: 'Inter', sans-serif; }
  .hero { min-height: 100vh; }
</style>

<!-- Load full CSS asynchronously -->
<link rel="preload" href="/static/website/css/solar-design-system.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

---

## ✅ DEVELOPMENT CHECKLIST

### Phase 1: Foundation (Days 1-3)
- [ ] Set up project structure
- [ ] Configure Vue Router with SEO-friendly URLs
- [ ] Create TypeScript types
- [ ] Implement design system CSS
- [ ] Build base layout components (Header, Footer, Layout)
- [ ] Set up SEO utilities (metaManager, schemaGenerator)
- [ ] Integrate core framework

### Phase 2: Shared Components (Days 4-5)
- [ ] SolarButton component
- [ ] SolarCard component
- [ ] SolarModal component
- [ ] SolarAccordion component
- [ ] SolarTabs component
- [ ] ImageCarousel component
- [ ] LoadingSpinner component
- [ ] Breadcrumbs component

### Phase 3: Home Page (Days 6-8)
- [ ] HeroSection with CTA
- [ ] ProcessSteps (6-step process)
- [ ] WorkingDomains (Residential, Commercial, Industrial)
- [ ] WhyChooseUs section
- [ ] StatsCounter with animations
- [ ] Testimonials carousel
- [ ] PortfolioPreview
- [ ] BlogPreview
- [ ] FAQSection
- [ ] CTASection
- [ ] Implement SEO (meta tags, structured data)

### Phase 4: Service Pages (Days 9-11)
- [ ] ResidentialPage
- [ ] CommercialPage
- [ ] IndustrialPage
- [ ] Shared service components
- [ ] SEO optimization for each page

### Phase 5: Calculator & Forms (Days 12-14)
- [ ] Solar calculator logic (useSolarCalculator)
- [ ] CalculatorForm component
- [ ] SavingsChart with Chart.js
- [ ] ResultsDisplay component
- [ ] QuoteForm (multi-step)
- [ ] ContactForm
- [ ] Form validation with core framework
- [ ] Conversion tracking

### Phase 6: Content Pages (Days 15-17)
- [ ] AboutPage
- [ ] ProductsPage
- [ ] PortfolioPage with gallery
- [ ] BlogPage
- [ ] BlogPostPage with Article schema
- [ ] FAQPage with FAQ schema
- [ ] ContactPage with map

### Phase 7: Additional Pages (Days 18-19)
- [ ] SubsidiesPage
- [ ] FinancingPage
- [ ] SupportPage
- [ ] CareersPage
- [ ] City-specific pages (10-20 cities)

### Phase 8: SEO & Optimization (Days 20-22)
- [ ] Implement all structured data
- [ ] Optimize all images (WebP, lazy loading)
- [ ] Add breadcrumbs to all pages
- [ ] Internal linking strategy
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Core Web Vitals optimization
- [ ] Analytics integration
- [ ] Sitemap generation
- [ ] Robots.txt configuration

### Phase 9: Testing & Launch (Days 23-25)
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Form testing
- [ ] SEO audit (Google Search Console)
- [ ] Performance testing (Lighthouse)
- [ ] Accessibility testing (WCAG 2.1 AA)
- [ ] Conversion tracking verification
- [ ] Submit sitemap to Google
- [ ] Submit to Bing Webmaster Tools

---

## 📊 SUCCESS METRICS

### SEO KPIs
- **Organic Traffic:** Monthly organic sessions
- **Keyword Rankings:** Average position for target keywords
- **Top 10 Rankings:** Number of keywords in top 10
- **Featured Snippets:** Number owned
- **Domain Authority:** DA score
- **Backlinks:** Quality backlink count

### Performance KPIs
- **Lighthouse Score:** > 90
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **Mobile Usability:** 100%

### Conversion KPIs
- **Conversion Rate:** Organic conversion rate %
- **Quote Requests:** Number per month
- **Calculator Uses:** Usage count
- **Phone Clicks:** Click-to-call conversions
- **Form Submissions:** Total submissions

---

## 🎓 BEST PRACTICES

### Content Creation
1. **Keyword in first 100 words**
2. **Use heading hierarchy (H1 > H2 > H3)**
3. **Include internal links (3-5 per page)**
4. **Add external links to authoritative sources**
5. **Use descriptive alt text for images**
6. **Write for humans, optimize for search engines**
7. **Update content regularly for freshness**

### Technical SEO
1. **Use semantic HTML5 elements**
2. **Implement proper schema markup**
3. **Ensure mobile-first design**
4. **Optimize Core Web Vitals**
5. **Use clean, keyword-rich URLs**
6. **Implement breadcrumbs**
7. **Add canonical tags**
8. **Create XML sitemap**

### Performance
1. **Optimize images (WebP, lazy loading)**
2. **Minify CSS and JavaScript**
3. **Use code splitting**
4. **Implement caching**
5. **Use CDN for static assets**
6. **Defer non-critical JavaScript**
7. **Inline critical CSS**

---

## 🚀 DEPLOYMENT

### Pre-Launch Checklist
- [ ] All pages have unique meta titles and descriptions
- [ ] All images have descriptive alt text
- [ ] Structured data validated (Google Rich Results Test)
- [ ] Sitemap generated and submitted
- [ ] Robots.txt configured
- [ ] Google Analytics installed
- [ ] Google Search Console set up
- [ ] Core Web Vitals passing
- [ ] Mobile-friendly test passed
- [ ] SSL certificate installed
- [ ] 301 redirects configured (if applicable)

### Post-Launch Monitoring
- [ ] Monitor Google Search Console for errors
- [ ] Track keyword rankings weekly
- [ ] Review Google Analytics monthly
- [ ] Check Core Web Vitals monthly
- [ ] Update content regularly
- [ ] Build quality backlinks
- [ ] Respond to customer reviews
- [ ] Publish blog posts (2-4 per month)

---

## 📝 NOTES

### Important Reminders
1. **Use Core Framework:** Leverage `$fx` services for all API calls, validation, charts, exports, etc.
2. **SEO First:** Every page must have proper meta tags and structured data
3. **Performance Matters:** Optimize for Core Web Vitals from the start
4. **Mobile First:** Design for mobile, enhance for desktop
5. **Content Quality:** Write comprehensive, helpful content (1500+ words)
6. **Local SEO:** Create city-specific pages for local rankings
7. **Regular Updates:** Fresh content signals to search engines
8. **Track Everything:** Use analytics to measure and improve

### Quick Reference
- **Core Framework Docs:** Check `@core/base.js` for available services
- **Validation Rules:** Use `$fx.validation.rules` for form validation
- **API Calls:** Use `$fx.api` with caching and toast notifications
- **Charts:** Use `$fx.charts` for Chart.js integration
- **Export:** Use `$fx.export` for Excel/PDF generation
- **Formatting:** Use `$fx.format` for currency, numbers, dates

---

## 🎯 FINAL GOAL

Build a **high-ranking, conversion-optimized solar energy website** that:
- ✅ Ranks #1 for target keywords
- ✅ Converts visitors into customers
- ✅ Loads in < 2.5 seconds
- ✅ Works perfectly on all devices
- ✅ Provides exceptional user experience
- ✅ Leverages existing core framework
- ✅ Scales easily for future growth

**Remember:** SEO is a marathon, not a sprint. Consistent effort in content creation, technical optimization, and user experience will compound over time to achieve top rankings.

---

**START DEVELOPMENT WITH PHASE 1 AND BUILD SYSTEMATICALLY. EACH COMPONENT IS DESIGNED TO WORK WITH YOUR CORE FRAMEWORK WHILE MAXIMIZING SEO POTENTIAL.**
