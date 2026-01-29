<template>
  <div class="home-page">
    <!-- Hero Section -->
    <HeroSection />
    
    <!-- Benefits Section -->
    <BenefitsSection />
    
    <!-- Process Section -->
    <ProcessSection />
    
    <!-- Services Section -->
    <ServicesSection />
    
    <!-- Stats Section -->
    <StatsSection />
    
    <!-- Testimonials Section -->
    <TestimonialsSection />
    
    <!-- CTA Section -->
    <CTASection />
    
    <!-- FAQ Section -->
    <FAQSection />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import HeroSection from '../components/sections/HeroSection.vue';
import BenefitsSection from '../components/sections/BenefitsSection.vue';
import ProcessSection from '../components/sections/ProcessSection.vue';
import ServicesSection from '../components/sections/ServicesSection.vue';
import StatsSection from '../components/sections/StatsSection.vue';
import TestimonialsSection from '../components/sections/TestimonialsSection.vue';
import CTASection from '../components/sections/CTASection.vue';
import FAQSection from '../components/sections/FAQSection.vue';

// SEO Meta Tags
onMounted(() => {
  document.title = 'Best Solar Panel Installation Company | Residential & Commercial Solar Solutions';
  
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', 'Leading solar energy company providing professional solar panel installation for homes and businesses. Get free quotes, calculate savings, and go solar today. 25-year warranty.');
  }
});
</script>

<style scoped>
.home-page {
  width: 100%;
}
</style>
