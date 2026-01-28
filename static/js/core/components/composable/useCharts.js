import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

/**
 * useCharts Composable
 * Wraps Chart.js and provides theme-aware configuration.
 */
export function useCharts(container) {
    /**
     * Get theme-specific chart options
     */
    const getThemeOptions = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const color = isDark ? '#ffffff' : '#333333';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color }
                }
            }
        };
    };

    /**
     * Create a new chart
     * @param {string|HTMLCanvasElement} el - Canvas element or selector
     * @param {Object} config - Chart.js config
     */
    const create = (el, config) => {
        const canvas = typeof el === 'string' ? document.querySelector(el) : el;
        if (!canvas) return null;

        const baseOptions = getThemeOptions();
        const finalConfig = {
            ...config,
            options: {
                ...baseOptions,
                ...(config.options || {})
            }
        };

        return new Chart(canvas, finalConfig);
    };

    return {
        create,
        getThemeOptions
    };
}
