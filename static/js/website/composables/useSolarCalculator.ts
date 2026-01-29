/**
 * Solar Calculator Composable
 * Calculates solar savings, ROI, and system size
 */

import { ref, computed, getCurrentInstance } from 'vue';

interface CalculatorInputs {
    monthlyBill: number;
    roofArea: number;
    location: string;
    electricityRate: number;
}

interface CalculatorResults {
    systemSize: number;
    estimatedCost: number;
    annualSavings: number;
    paybackPeriod: number;
    roi25Years: number;
    co2Offset: number;
}

export function useSolarCalculator() {
    const instance = getCurrentInstance();
    const $fx = instance?.appContext.config.globalProperties.$fx;

    const inputs = ref<CalculatorInputs>({
        monthlyBill: 0,
        roofArea: 0,
        location: '',
        electricityRate: 0.12, // Default $0.12/kWh
    });

    const results = ref<CalculatorResults>({
        systemSize: 0,
        estimatedCost: 0,
        annualSavings: 0,
        paybackPeriod: 0,
        roi25Years: 0,
        co2Offset: 0,
    });

    const isCalculating = ref(false);

    // Calculate system size based on monthly bill
    const calculateSystemSize = computed(() => {
        const annualUsage = (inputs.value.monthlyBill / inputs.value.electricityRate) * 12;
        const systemSize = annualUsage / 1200; // Assuming 1200 kWh per kW per year
        return Math.round(systemSize * 10) / 10; // Round to 1 decimal
    });

    // Calculate estimated cost (average $2.50-$3.50 per watt)
    const calculateCost = computed(() => {
        const pricePerWatt = 3.0; // $3/watt average
        return Math.round(calculateSystemSize.value * 1000 * pricePerWatt);
    });

    // Calculate annual savings
    const calculateAnnualSavings = computed(() => {
        const annualProduction = calculateSystemSize.value * 1200;
        return Math.round(annualProduction * inputs.value.electricityRate);
    });

    // Calculate payback period
    const calculatePaybackPeriod = computed(() => {
        if (calculateAnnualSavings.value === 0) return 0;
        const netCost = calculateCost.value * 0.7; // After 30% federal tax credit
        return Math.round((netCost / calculateAnnualSavings.value) * 10) / 10;
    });

    // Calculate 25-year ROI
    const calculate25YearROI = computed(() => {
        const totalSavings = calculateAnnualSavings.value * 25;
        const netCost = calculateCost.value * 0.7;
        return Math.round(totalSavings - netCost);
    });

    // Calculate CO2 offset (lbs per year)
    const calculateCO2Offset = computed(() => {
        const annualProduction = calculateSystemSize.value * 1200;
        const co2PerKwh = 0.92; // lbs of CO2 per kWh
        return Math.round(annualProduction * co2PerKwh);
    });

    // Main calculate function
    const calculate = async () => {
        isCalculating.value = true;

        try {
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            results.value = {
                systemSize: calculateSystemSize.value,
                estimatedCost: calculateCost.value,
                annualSavings: calculateAnnualSavings.value,
                paybackPeriod: calculatePaybackPeriod.value,
                roi25Years: calculate25YearROI.value,
                co2Offset: calculateCO2Offset.value,
            };

            // Track analytics
            if ($fx?.analytics) {
                $fx.analytics.track('solar_calculator_used', {
                    system_size: results.value.systemSize,
                    estimated_cost: results.value.estimatedCost,
                    location: inputs.value.location,
                });
            }

            // Show success toast
            if ($fx?.toast) {
                $fx.toast.success('Calculation complete!');
            }
        } catch (error) {
            console.error('Calculator error:', error);
            if ($fx?.toast) {
                $fx.toast.error('Calculation failed. Please try again.');
            }
        } finally {
            isCalculating.value = false;
        }
    };

    // Reset calculator
    const reset = () => {
        inputs.value = {
            monthlyBill: 0,
            roofArea: 0,
            location: '',
            electricityRate: 0.12,
        };
        results.value = {
            systemSize: 0,
            estimatedCost: 0,
            annualSavings: 0,
            paybackPeriod: 0,
            roi25Years: 0,
            co2Offset: 0,
        };
    };

    return {
        inputs,
        results,
        isCalculating,
        calculate,
        reset,
    };
}
