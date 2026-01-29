<template>
  <div id="solar-app-overlays" class="solar-vue-overlays">
    <!-- Mobile Menu Component -->
    <MobileMenu 
      :is-open="isMobileMenuOpen"
      @close="closeMobileMenu"
    />
    
    <!-- Back to Top Button -->
    <BackToTop :show="showBackToTop" />
    
    <!-- Core Notification Toast Container -->
    <ToastContainer position="top-right" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide } from 'vue';
import { useSolarStore } from './stores/solarStore';
import MobileMenu from './components/MobileMenu.vue';
import BackToTop from './components/BackToTop.vue';
import { ToastContainer, useToast } from './website_base';

// Store
const store = useSolarStore;
const toast = useToast;

// State
const isMobileMenuOpen = ref(false);
const showBackToTop = ref(false);

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
  store.updateScrollPosition(scrollY);
  const shouldShow = scrollY > 300;
  
  if (showBackToTop.value !== shouldShow) {
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

// Show notification (Proxy to Core Toast)
const showNotification = (message: string, type: 'info' | 'error' | 'success' | 'warning' = 'info') => {
  if (type === 'error') toast.error(message);
  else if (type === 'success') toast.success(message);
  else if (type === 'warning') toast.warning(message);
  else toast.info(message);
};

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
