/**
 * Vue 3 Custom Directives
 * Register global directives here
 */

import type { App } from 'vue';

// Smooth scroll directive
export const vSmoothScroll = {
    mounted(el: HTMLElement) {
        el.addEventListener('click', (e: Event) => {
            const href = el.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('.solar-header')?.clientHeight || 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth',
                    });
                }
            }
        });
    },
};

// Click outside directive
export const vClickOutside = {
    mounted(el: any, binding: any) {
        el.clickOutsideEvent = (event: Event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el: any) {
        document.removeEventListener('click', el.clickOutsideEvent);
    },
};

// Register all directives
export function registerDirectives(app: App) {
    app.directive('smooth-scroll', vSmoothScroll);
    app.directive('click-outside', vClickOutside);
}
