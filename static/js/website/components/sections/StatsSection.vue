<template>
  <section class="stats-section section-padding bg-gradient" ref="statsSection">
    <div class="container">
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-box">
          <div class="stat-icon">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-value">{{ stat.displayValue }}</div>
          <div v-if="stat.suffix" class="stat-suffix">{{ stat.suffix }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Stat {
  icon: string;
  target: number;
  displayValue: string;
  suffix?: string;
  label: string;
}

const statsSection = ref<HTMLElement | null>(null);
const hasAnimated = ref(false);

const stats = ref<Stat[]>([
  {
    icon: 'fas fa-solar-panel',
    target: 5000,
    displayValue: '0',
    label: 'Installations Completed',
  },
  {
    icon: 'fas fa-users',
    target: 4500,
    displayValue: '0',
    label: 'Happy Customers',
  },
  {
    icon: 'fas fa-bolt',
    target: 50,
    displayValue: '0',
    suffix: 'MW',
    label: 'Total Capacity Installed',
  },
  {
    icon: 'fas fa-leaf',
    target: 25000,
    displayValue: '0',
    suffix: 'tons',
    label: 'CO₂ Emissions Reduced',
  },
]);

const animateCounter = (stat: Stat, index: number) => {
  const duration = 2000; // 2 seconds
  const increment = stat.target / (duration / 16); // 60fps
  let current = 0;

  const updateCounter = () => {
    current += increment;
    if (current < stat.target) {
      stats.value[index].displayValue = Math.floor(current).toLocaleString();
      requestAnimationFrame(updateCounter);
    } else {
      stats.value[index].displayValue = stat.target.toLocaleString();
    }
  };

  updateCounter();
};

const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !hasAnimated.value) {
      hasAnimated.value = true;
      stats.value.forEach((stat, index) => {
        animateCounter(stat, index);
      });
    }
  });
};

let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (statsSection.value) {
    observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.5,
      rootMargin: '0px',
    });
    observer.observe(statsSection.value);
  }
});

onUnmounted(() => {
  if (observer && statsSection.value) {
    observer.unobserve(statsSection.value);
  }
});
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
