<template>
  <Teleport to="#testimonials-app" v-if="isMounted">
    <section class="testimonials-section section-padding">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">What Our Customers Say</h2>
          <p class="section-subtitle">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>
        <div class="testimonials-slider">
          <div v-for="testimonial in testimonials" :key="testimonial.name" class="testimonial-card">
            <div class="testimonial-rating">
              <i v-for="n in 5" :key="n" class="fas fa-star"></i>
            </div>
            <p class="testimonial-text">{{ testimonial.text }}</p>
            <div class="testimonial-author">
              <img :src="testimonial.image" :alt="testimonial.name" loading="lazy">
              <div class="author-info">
                <h4>{{ testimonial.name }}</h4>
                <p>{{ testimonial.location }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isMounted = ref(false);

onMounted(() => {
  isMounted.value = !!document.querySelector('#testimonials-app');
});

interface Testimonial {
  name: string;
  location: string;
  text: string;
  image: string;
}

const testimonials = ref<Testimonial[]>([
  {
    name: 'John Smith',
    location: 'Homeowner, Los Angeles',
    text: 'The team was professional, efficient, and completed the installation in just 2 days. Our energy bills have dropped by 65%! Highly recommend!',
    image: '/static/website/images/testimonial-1.jpg',
  },
  {
    name: 'Sarah Johnson',
    location: 'Business Owner, San Diego',
    text: 'Excellent service from start to finish. The solar calculator helped us understand our savings, and the financing options made it affordable. Very happy with our decision!',
    image: '/static/website/images/testimonial-2.jpg',
  },
  {
    name: 'Michael Chen',
    location: 'Homeowner, Phoenix',
    text: 'Best investment we\'ve made! The system pays for itself, and we\'re doing our part for the environment. The monitoring app is fantastic too!',
    image: '/static/website/images/testimonial-3.jpg',
  },
]);
</script>
