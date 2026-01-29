<template>
  <section class="hero-section">
    <div class="hero-background">
      <img :src="heroImage" alt="Solar panels on residential roof" loading="eager">
      <div class="hero-overlay"></div>
    </div>
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-title">
          Power Your Future with
          <span class="highlight">Clean Solar Energy</span>
        </h1>
        <p class="hero-subtitle">
          Professional solar panel installation for homes and businesses. 
          Save up to 70% on electricity bills with our premium solar solutions.
        </p>
        <div class="hero-stats">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
        <div class="hero-cta">
          <a href="/quote" class="btn btn-primary btn-lg" @click.prevent="navigateToQuote">
            <i class="fas fa-calculator"></i>
            Get Free Quote
          </a>
          <a href="/calculator" class="btn btn-secondary btn-lg" @click.prevent="navigateToCalculator">
            <i class="fas fa-chart-line"></i>
            Calculate Savings
          </a>
        </div>
        <div class="hero-trust">
          <p>
            <i class="fas fa-shield-alt"></i>
            Certified & Insured | 
            <i class="fas fa-award"></i>
            Award-Winning Service | 
            <i class="fas fa-star"></i>
            4.8/5 Rating
          </p>
        </div>
      </div>
    </div>
    <div class="hero-scroll">
      <a href="#benefits" class="scroll-indicator" @click.prevent="scrollToBenefits">
        <i class="fas fa-chevron-down"></i>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue';

const heroImage = ref('/static/website/images/hero-solar.jpg');

const stats = ref([
  { number: '5000+', label: 'Installations' },
  { number: '25', label: 'Years Warranty' },
  { number: '98%', label: 'Satisfaction Rate' },
]);

const instance = getCurrentInstance();
const $fx = instance?.appContext.config.globalProperties.$fx;

const navigateToQuote = () => {
  if ($fx?.utils) {
    $fx.utils.navigate('/quote');
  } else {
    window.location.href = '/quote';
  }
};

const navigateToCalculator = () => {
  if ($fx?.utils) {
    $fx.utils.navigate('/calculator');
  } else {
    window.location.href = '/calculator';
  }
};

const scrollToBenefits = () => {
  const benefitsSection = document.getElementById('benefits');
  if (benefitsSection) {
    const headerHeight = document.querySelector('.solar-header')?.clientHeight || 0;
    const targetPosition = benefitsSection.offsetTop - headerHeight;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });
  }
};
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
