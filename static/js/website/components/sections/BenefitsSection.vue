<template>
  <Teleport to="#benefits-app" v-if="isMounted">
    <section id="benefits" class="benefits-section section-padding">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">Why Choose Solar Energy?</h2>
          <p class="section-subtitle">
            Discover the amazing benefits of switching to clean, renewable solar power
          </p>
        </div>
        <div class="benefits-grid">
          <div v-for="benefit in benefits" :key="benefit.title" class="benefit-card">
            <div class="benefit-icon">
              <i :class="benefit.icon"></i>
            </div>
            <h3>{{ benefit.title }}</h3>
            <p>{{ benefit.description }}</p>
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
  isMounted.value = !!document.querySelector('#benefits-app');
});

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

const benefits = ref<Benefit[]>([
  {
    icon: 'fas fa-dollar-sign',
    title: 'Reduce Energy Bills',
    description: 'Save up to 70% on your monthly electricity costs with solar panels. Start saving from day one.',
  },
  {
    icon: 'fas fa-leaf',
    title: 'Eco-Friendly',
    description: 'Reduce your carbon footprint and contribute to a cleaner, greener planet for future generations.',
  },
  {
    icon: 'fas fa-home',
    title: 'Increase Property Value',
    description: 'Solar panels can increase your home\'s value by up to 4% according to recent studies.',
  },
  {
    icon: 'fas fa-bolt',
    title: 'Energy Independence',
    description: 'Generate your own clean electricity and reduce dependence on the grid and rising energy costs.',
  },
  {
    icon: 'fas fa-piggy-bank',
    title: 'Government Incentives',
    description: 'Take advantage of federal tax credits, state rebates, and local incentives to reduce installation costs.',
  },
  {
    icon: 'fas fa-tools',
    title: 'Low Maintenance',
    description: 'Solar panels require minimal maintenance and come with 25-year performance warranties.',
  },
]);
</script>
