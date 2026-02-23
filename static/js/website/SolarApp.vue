<template>
  <div id="solar-app-overlays" class="solar-vue-overlays">
    <!-- Mobile Menu Component -->
    <MobileMenu 
      :is-open="isMobileMenuOpen"
      @close="closeMobileMenu"
    />
    
    <!-- Back to Top Button -->
    <BackToTop :show="showBackToTop" />
    
    <!-- Notification Toast -->
    <NotificationToast 
      v-if="activeNotification"
      :message="activeNotification.message"
      :type="activeNotification.type"
      @close="activeNotification = null"
    />

    <!-- Section Teleports -->
    <HeroSection />
    <BenefitsSection />
    <ProcessSection />
    <ServicesSection />
    <StatsSection />
    <TestimonialsSection />
    <CTASection />
    <FAQSection />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide } from 'vue';
import { useSolarStore } from './stores/solarStore';
import MobileMenu from './components/MobileMenu.vue';
import BackToTop from './components/BackToTop.vue';
import NotificationToast from './components/NotificationToast.vue';
import HeroSection from './components/sections/HeroSection.vue';
import BenefitsSection from './components/sections/BenefitsSection.vue';
import ProcessSection from './components/sections/ProcessSection.vue';
import ServicesSection from './components/sections/ServicesSection.vue';
import StatsSection from './components/sections/StatsSection.vue';
import TestimonialsSection from './components/sections/TestimonialsSection.vue';
import CTASection from './components/sections/CTASection.vue';
import FAQSection from './components/sections/FAQSection.vue';
// import { ToastContainer, useToast } from './website_base'; // Removed in favor of custom toast

// Store
const store = useSolarStore;
// const toast = useToast; // Removed

// State
const isMobileMenuOpen = ref(false);
const showBackToTop = ref(false);
const activeNotification = ref<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

// Mobile menu toggle
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : '';
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';
};

// Back to top visibility
const handleScroll = () => {
  const scrollY = window.pageYOffset;
  // console.log('[SolarApp] Scroll position:', scrollY);
  store.updateScrollPosition(scrollY);
  const shouldShow = scrollY > 300;
  
  if (showBackToTop.value !== shouldShow) {
      console.log('[SolarApp] BackToTop visibility changing to:', shouldShow);
      showBackToTop.value = shouldShow;
  }
  
  // Sticky header
  const header = document.querySelector('.solar-header');
  if (header) {
    if (scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  } else {
      // console.warn('SolarApp: Header not found for sticky effect');
  }
};

// Show notification
const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  activeNotification.value = { message, type };
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    if (activeNotification.value?.message === message) {
      activeNotification.value = null;
    }
  }, 5000);
};

// Expose to window for legacy JS (solar-main.js)
(window as any).showNotification = showNotification;

// Provide global functions
provide('toggleMobileMenu', toggleMobileMenu);
provide('closeMobileMenu', closeMobileMenu);
provide('showNotification', showNotification);

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  
  // Initialize mobile menu toggle button
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleMobileMenu);
  } else {
    console.warn('SolarApp: .mobile-menu-toggle not found');
  }
  
  // Close menu on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobileMenuOpen.value) {
      closeMobileMenu();
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.solar-vue-overlays {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 0; /* Don't block clicks on page */
  z-index: 9999;
}

/* Ensure children (menu, toasts) are clickable */
:deep(*) {
  pointer-events: auto;
}
</style>
