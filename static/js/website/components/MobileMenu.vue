<template>
  <Transition name="menu">
    <div v-if="isOpen" class="mobile-menu-overlay" @click="$emit('close')">
      <nav class="mobile-menu-content" @click.stop>
        <div class="mobile-menu-header">
          <h2>Menu</h2>
          <button class="close-button" @click="$emit('close')" aria-label="Close menu">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <ul class="mobile-nav-list">
          <li v-for="item in navItems" :key="item.name">
            <template v-if="item.children">
              <button 
                class="nav-item-button"
                @click="toggleSubmenu(item.name)"
                :class="{ active: activeSubmenu === item.name }"
              >
                {{ item.label }}
                <i class="fas fa-chevron-down"></i>
              </button>
              <Transition name="submenu">
                <ul v-show="activeSubmenu === item.name" class="submenu">
                  <li v-for="child in item.children" :key="child.name">
                    <a :href="child.url" @click="handleNavClick">
                      {{ child.label }}
                    </a>
                  </li>
                </ul>
              </Transition>
            </template>
            <template v-else>
              <a :href="item.url" @click="handleNavClick" class="nav-item-link">
                {{ item.label }}
              </a>
            </template>
          </li>
        </ul>
        
        <div class="mobile-menu-footer">
          <a href="/quote" class="btn btn-primary btn-block">
            Get Free Quote
          </a>
        </div>
      </nav>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface NavItem {
  name: string;
  label: string;
  url?: string;
  children?: NavItem[];
}

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const activeSubmenu = ref<string | null>(null);

const navItems: NavItem[] = [
  { name: 'home', label: 'Home', url: '/' },
  {
    name: 'services',
    label: 'Services',
    children: [
      { name: 'residential', label: 'Residential Solar', url: '/services/residential/' },
      { name: 'commercial', label: 'Commercial Solar', url: '/services/commercial/' },
      { name: 'industrial', label: 'Industrial Solar', url: '/services/industrial/' },
    ],
  },
  { name: 'products', label: 'Products', url: '/products/' },
  { name: 'portfolio', label: 'Portfolio', url: '/portfolio/' },
  { name: 'calculator', label: 'Calculator', url: '/calculator/' },
  { name: 'blog', label: 'Blog', url: '/blog/' },
  { name: 'about', label: 'About Us', url: '/about/' },
  { name: 'contact', label: 'Contact', url: '/contact/' },
];

const toggleSubmenu = (name: string) => {
  activeSubmenu.value = activeSubmenu.value === name ? null : name;
};

const handleNavClick = () => {
  emit('close');
};
</script>

<style scoped>
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  overflow-y: auto;
}

.mobile-menu-content {
  position: absolute;
  top: 0;
  right: 0;
  width: 80%;
  max-width: 400px;
  height: 100%;
  background-color: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.mobile-menu-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--solar-orange, #FF6B35);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: var(--solar-orange, #FF6B35);
}

.mobile-nav-list {
  flex: 1;
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
}

.mobile-nav-list > li {
  border-bottom: 1px solid #eee;
}

.nav-item-button,
.nav-item-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 1rem;
  color: #333;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.nav-item-button:hover,
.nav-item-link:hover {
  background-color: #f8f9fa;
  color: var(--solar-orange, #FF6B35);
}

.nav-item-button.active {
  color: var(--solar-orange, #FF6B35);
}

.nav-item-button i {
  transition: transform 0.3s ease;
}

.nav-item-button.active i {
  transform: rotate(180deg);
}

.submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: #f8f9fa;
}

.submenu li a {
  display: block;
  padding: 0.75rem 1.5rem 0.75rem 3rem;
  color: #666;
  text-decoration: none;
  font-size: 0.95rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.submenu li a:hover {
  background-color: #e9ecef;
  color: var(--solar-orange, #FF6B35);
}

.mobile-menu-footer {
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.btn-block {
  width: 100%;
  text-align: center;
}

/* Transitions */
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.3s ease;
}

.menu-enter-active .mobile-menu-content,
.menu-leave-active .mobile-menu-content {
  transition: transform 0.3s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}

.menu-enter-from .mobile-menu-content {
  transform: translateX(100%);
}

.menu-leave-to .mobile-menu-content {
  transform: translateX(100%);
}

.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
}

.submenu-enter-to,
.submenu-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
