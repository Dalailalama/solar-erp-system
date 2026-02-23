<template>
  <Teleport to="#cta-app" v-if="isMounted">
    <section class="cta-section section-padding bg-gradient">
      <div class="container">
        <div class="cta-content text-center">
          <h2 class="cta-title">Ready to Start Saving with Solar?</h2>
          <p class="cta-subtitle">
            Get a free, no-obligation quote today and discover how much you can save with solar energy
          </p>
          <div class="cta-buttons">
            <a href="/quote" class="btn btn-white btn-lg" @click.prevent="navigateToQuote">
              <i class="fas fa-file-invoice"></i>
              Get Free Quote
            </a>
            <a href="tel:+12345678900" class="btn btn-outline-white btn-lg">
              <i class="fas fa-phone"></i>
              Call Now: (234) 567-8900
            </a>
          </div>
          <p class="cta-note">
            <i class="fas fa-clock"></i>
            Average response time: Under 2 hours
          </p>
        </div>
      </div>
    </section>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const isMounted = ref(false);
const router = useRouter();

onMounted(() => {
  isMounted.value = true;
});

const navigateToQuote = () => {
  router.push('/quote');
};
</script>
