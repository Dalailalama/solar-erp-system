/**
 * useFormatter Composable
 * Provides standardized formatting logic for the entire ERP system.
 */
export function useFormatter(container) {
    /**
     * Format currency (Default: INR)
     */
    const currency = (amount, currencyCode = 'INR', locale = 'en-IN') => {
        if (amount === undefined || amount === null) return '-';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: 0
        }).format(amount);
    };

    /**
     * Format date
     */
    const date = (val, format = 'short', locale = 'en-IN') => {
        if (!val) return '-';
        const d = new Date(val);

        if (format === 'short') {
            return d.toLocaleDateString(locale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

        if (format === 'long') {
            return d.toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
        }

        if (format === 'time') {
            return d.toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        if (format === 'datetime') {
            return d.toLocaleString(locale, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        return d.toLocaleDateString(locale);
    };

    /**
     * Format a number
     */
    const number = (val, locale = 'en-IN') => {
        if (val === undefined || val === null) return '0';
        return new Intl.NumberFormat(locale).format(val);
    };

    /**
     * Format status text
     */
    const status = (val) => {
        if (!val) return '-';
        return val
            .split(/[_-]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    /**
     * Format phone numbers (basic)
     */
    const phone = (val) => {
        if (!val) return '-';
        const cleaned = ('' + val).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{5})$/);
        if (match) {
            return `+${match[1]} ${match[2]}-${match[3]}`;
        }
        return val;
    };

    return {
        currency,
        date,
        number,
        status,
        phone
    };
}
