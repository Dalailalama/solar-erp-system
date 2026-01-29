<template>
  <Transition name="slide">
    <div :class="['notification-toast', `notification-${type}`]">
      <div class="notification-icon">
        <i :class="iconClass"></i>
      </div>
      <div class="notification-content">
        <p>{{ message }}</p>
      </div>
      <button class="notification-close" @click="$emit('close')" aria-label="Close notification">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}>();

defineEmits<{
  close: [];
}>();

const iconClass = computed(() => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation-triangle',
  };
  return icons[props.type] || icons.info;
});
</script>

<style scoped>
.notification-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  min-width: 300px;
  max-width: 500px;
  padding: 1rem 1.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 10000;
  border-left: 4px solid;
}

.notification-success {
  border-left-color: #2ECC71;
}

.notification-error {
  border-left-color: #E74C3C;
}

.notification-info {
  border-left-color: #3498DB;
}

.notification-warning {
  border-left-color: #F39C12;
}

.notification-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notification-success .notification-icon {
  color: #2ECC71;
}

.notification-error .notification-icon {
  color: #E74C3C;
}

.notification-info .notification-icon {
  color: #3498DB;
}

.notification-warning .notification-icon {
  color: #F39C12;
}

.notification-content {
  flex: 1;
}

.notification-content p {
  margin: 0;
  color: #333;
  font-size: 0.95rem;
  line-height: 1.5;
}

.notification-close {
  background: none;
  border: none;
  color: #999;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.3s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  color: #333;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(400px);
  opacity: 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .notification-toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    min-width: auto;
    max-width: none;
  }
  
  .slide-enter-from,
  .slide-leave-to {
    transform: translateY(-100px);
  }
}
</style>
