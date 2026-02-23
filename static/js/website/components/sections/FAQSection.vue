<template>
  <Teleport to="#faq-app" v-if="isMounted">
    <section class="faq-section section-padding">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">Frequently Asked Questions</h2>
          <p class="section-subtitle">
            Find answers to common questions about solar panel installation
          </p>
        </div>
        <div class="faq-grid">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index" 
            class="faq-item"
            :class="{ active: activeIndex === index }"
          >
            <button class="faq-question" @click="toggleFAQ(index)">
              <span>{{ faq.question }}</span>
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="faq-answer">
              <p v-html="faq.answer"></p>
            </div>
          </div>
        </div>
        <div class="text-center" style="margin-top: 2rem;">
          <a href="/faq" class="btn btn-outline">
            View All FAQs
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </section>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isMounted = ref(false);

onMounted(() => {
  isMounted.value = !!document.querySelector('#faq-app');
});

interface FAQ {
  question: string;
  answer: string;
}

const activeIndex = ref<number | null>(null);

const faqs = ref<FAQ[]>([
  {
    question: 'How much can I save with solar panels?',
    answer: 'Most homeowners save between 40-70% on their electricity bills. The exact savings depend on your location, energy consumption, system size, and local electricity rates. Use our <a href="/calculator">solar calculator</a> to get a personalized estimate.',
  },
  {
    question: 'How long does installation take?',
    answer: 'The physical installation typically takes 1-3 days for residential systems. However, the entire process from consultation to activation usually takes 4-8 weeks, including design, permits, and utility approvals.',
  },
  {
    question: 'What financing options are available?',
    answer: 'We offer multiple financing options including cash purchase, solar loans, leases, and Power Purchase Agreements (PPAs). We also help you take advantage of federal tax credits and state incentives. Learn more about <a href="/financing">financing options</a>.',
  },
  {
    question: 'Do solar panels work on cloudy days?',
    answer: 'Yes! Solar panels still generate electricity on cloudy days, though at reduced efficiency (typically 10-25% of full capacity). Modern solar panels are designed to capture diffuse sunlight and work efficiently in various weather conditions.',
  },
  {
    question: 'What is the warranty on solar panels?',
    answer: 'Our solar panels come with a 25-year performance warranty, guaranteeing at least 80% efficiency after 25 years. We also provide a 10-year workmanship warranty on installation and a 25-year warranty on inverters.',
  },
  {
    question: 'How much maintenance do solar panels require?',
    answer: 'Solar panels require minimal maintenance. Rain naturally cleans the panels, but we recommend professional cleaning 1-2 times per year for optimal performance. We offer maintenance plans for worry-free operation.',
  },
]);

const toggleFAQ = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
