<template>
  <section class="process-section section-padding bg-light">
    <div class="container">
      <div class="section-header text-center">
        <h2 class="section-title">How Solar Installation Works</h2>
        <p class="section-subtitle">
          Our simple 6-step process makes going solar easy and hassle-free
        </p>
      </div>
      <div class="process-timeline">
        <div v-for="(step, index) in steps" :key="index" class="process-step">
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface ProcessStep {
  title: string;
  description: string;
}

const steps = ref<ProcessStep[]>([
  {
    title: 'Free Consultation',
    description: 'Schedule a free consultation with our solar experts to discuss your energy needs and goals.',
  },
  {
    title: 'Site Assessment',
    description: 'We evaluate your property\'s solar potential, roof condition, and energy consumption patterns.',
  },
  {
    title: 'Custom Design',
    description: 'Our engineers design a customized solar system optimized for maximum energy production.',
  },
  {
    title: 'Permits & Approvals',
    description: 'We handle all paperwork, permits, and utility interconnection agreements on your behalf.',
  },
  {
    title: 'Professional Installation',
    description: 'Our certified installers complete the installation in 1-3 days with minimal disruption.',
  },
  {
    title: 'Activation & Monitoring',
    description: 'System activation and ongoing monitoring to ensure optimal performance and savings.',
  },
]);
</script>
