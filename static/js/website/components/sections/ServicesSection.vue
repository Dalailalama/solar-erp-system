<template>
  <section class="services-section section-padding">
    <div class="container">
      <div class="section-header text-center">
        <h2 class="section-title">Our Solar Solutions</h2>
        <p class="section-subtitle">
          Comprehensive solar energy solutions for every need
        </p>
      </div>
      <div class="services-grid">
        <div v-for="service in services" :key="service.title" class="service-card">
          <div class="service-image">
            <img :src="service.image" :alt="service.title" loading="lazy">
          </div>
          <div class="service-content">
            <h3>{{ service.title }}</h3>
            <p>{{ service.description }}</p>
            <ul class="service-features">
              <li v-for="feature in service.features" :key="feature">
                <i class="fas fa-check"></i> {{ feature }}
              </li>
            </ul>
            <a :href="service.link" class="btn btn-outline">
              Learn More
              <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Service {
  title: string;
  description: string;
  image: string;
  features: string[];
  link: string;
}

const services = ref<Service[]>([
  {
    title: 'Residential Solar',
    description: 'Transform your home with clean solar energy. Our residential solar solutions are designed to maximize savings while seamlessly integrating with your home\'s architecture.',
    image: '/static/website/images/residential-solar.jpg',
    features: [
      'Custom system design',
      'Premium solar panels',
      '25-year warranty',
      'Flexible financing',
    ],
    link: '/services/residential/',
  },
  {
    title: 'Commercial Solar',
    description: 'Reduce operating costs and demonstrate environmental leadership with commercial solar. Perfect for businesses, offices, and retail spaces.',
    image: '/static/website/images/commercial-solar.jpg',
    features: [
      'ROI analysis',
      'Scalable systems',
      'Tax incentives',
      'Energy management',
    ],
    link: '/services/commercial/',
  },
  {
    title: 'Industrial Solar',
    description: 'Large-scale solar solutions for industrial facilities and manufacturing plants. Reduce energy costs and meet sustainability goals.',
    image: '/static/website/images/industrial-solar.jpg',
    features: [
      'High-capacity systems',
      'Grid integration',
      '24/7 monitoring',
      'Maintenance plans',
    ],
    link: '/services/industrial/',
  },
]);
</script>
