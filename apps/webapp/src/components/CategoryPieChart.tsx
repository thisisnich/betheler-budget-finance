'use client';

import { formatCurrency } from '@/lib/formatCurrency';
import { api } from '@workspace/backend/convex/_generated/api';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Define color palette for the chart
const CHART_COLORS = [
  'rgba(255, 99, 132, 0.7)',
  'rgba(54, 162, 235, 0.7)',
  'rgba(255, 206, 86, 0.7)',
  'rgba(75, 192, 192, 0.7)',
  'rgba(153, 102, 255, 0.7)',
  'rgba(255, 159, 64, 0.7)',
  'rgba(199, 199, 199, 0.7)',
  'rgba(83, 102, 255, 0.7)',
  'rgba(78, 166, 134, 0.7)',
  'rgba(255, 99, 255, 0.7)',
];

const CHART_BORDER_COLORS = [
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
  'rgba(199, 199, 199, 1)',
  'rgba(83, 102, 255, 1)',
  'rgba(78, 166, 134, 1)',
  'rgba(255, 99, 255, 1)',
];

// Define props type for the component
interface CategoryPieChartProps {
  data: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  totalSpent: number;
  year?: number;
  month?: number;
  showBudgetComparison?: boolean;
}

export function CategoryPieChart({
  data,
  totalSpent,
  year,
  month,
  showBudgetComparison = false,
}: CategoryPieChartProps) {
  // Only fetch budget data if we're showing the comparison and have year/month
  const budgetProgress = useSessionQuery(
    api.budgets.getBudgetProgress,
    year !== undefined && month !== undefined && showBudgetComparison
      ? {
          year,
          month,
        }
      : 'skip'
  );

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    // Sort data by amount (descending)
    const sortedData = [...data].sort((a, b) => b.amount - a.amount);

    // Create labels and data arrays
    const labels = sortedData.map((item) => item.category);
    const amounts = sortedData.map((item) => Math.abs(item.amount));

    // Calculate color for each data point
    const backgroundColors = sortedData.map(
      (_, index) => CHART_COLORS[index % CHART_COLORS.length]
    );
    const borderColors = sortedData.map(
      (_, index) => CHART_BORDER_COLORS[index % CHART_BORDER_COLORS.length]
    );

    return {
      labels,
      datasets: [
        {
          label: 'Spending',
          data: amounts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  // Create chart options
  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            padding: 15,
            boxWidth: 15,
            usePointStyle: true,
            generateLabels: (chart: any) => {
              const original = ChartJS.overrides.pie.plugins.legend.labels.generateLabels(chart);

              // Add percentage and amount to legend labels
              return original.map((label: any, i: number) => {
                const item = data[i];
                if (item) {
                  label.text = `${item.category} · ${formatCurrency(Math.abs(item.amount))} · ${Math.round(
                    item.percentage
                  )}%`;
                }
                return label;
              });
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.parsed;
              const label = context.label || '';
              const formattedValue = formatCurrency(value);
              const percentage = ((value / totalSpent) * 100).toFixed(1);

              // Add budget comparison if available
              if (showBudgetComparison && budgetProgress) {
                const budgetItem = budgetProgress.budgeted.find((b) => b.category === label);

                if (budgetItem) {
                  const budgetAmount = formatCurrency(budgetItem.amount);
                  const status =
                    budgetItem.status === 'within_budget' ? 'Under budget' : 'Over budget';
                  const diff = formatCurrency(Math.abs(budgetItem.remaining));
                  return [
                    `${label}: ${formattedValue} (${percentage}%)`,
                    `Budget: ${budgetAmount}`,
                    `${status} by ${diff}`,
                  ];
                }
              }

              // Default tooltip
              return `${label}: ${formattedValue} (${percentage}%)`;
            },
          },
        },
      },
    }),
    [data, totalSpent, showBudgetComparison, budgetProgress]
  );

  return (
    <div className="pt-4">
      <Pie data={chartData} options={options} />
    </div>
  );
}
