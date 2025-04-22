import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { formatCurrency } from '@/lib/formatCurrency';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Define the color scheme for categories
const CATEGORY_COLORS = [
  '#FF6384', // Red
  '#36A2EB', // Blue
  '#FFCE56', // Yellow
  '#4BC0C0', // Teal
  '#9966FF', // Purple
  '#FF9F40', // Orange
  '#C9CBCF', // Grey
  '#7ED321', // Green
  '#F73378', // Pink
  '#00E5FF', // Cyan
  '#CDDC39', // Lime
  '#651FFF', // Indigo
  '#795548', // Brown
  '#607D8B', // Blue-grey
  '#FF5722', // Deep orange
];

export interface CategoryData {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
  totalSpent: number;
  className?: string;
}

export function CategoryPieChart({ data, totalSpent, className }: CategoryPieChartProps) {
  // Sort data by amount descending
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  const chartData = {
    labels: sortedData.map(item => item.category),
    datasets: [
      {
        data: sortedData.map(item => Math.abs(item.amount)),
        backgroundColor: sortedData.map((_, index) => CATEGORY_COLORS[index % CATEGORY_COLORS.length]),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label: string, i: number) => {
              const meta = chart.getDatasetMeta(0);
              const style = meta.controller.getStyle(i);
              const percentage = sortedData[i].percentage.toFixed(1);
              const value = formatCurrency(Math.abs(sortedData[i].amount));
              
              return {
                text: `${label}: ${value} (${percentage}%)`,
                fillStyle: style.backgroundColor,
                strokeStyle: style.borderColor,
                lineWidth: style.borderWidth,
                hidden: !chart.getDataVisibility(i),
                index: i
              };
            });
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const index = context.dataIndex;
            const value = Math.abs(sortedData[index].amount);
            const percentage = sortedData[index].percentage.toFixed(1);
            return `${sortedData[index].category}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className={`${className} h-80 w-full`}>
      <h3 className="text-lg font-medium mb-2">Spending by Category</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Total: {formatCurrency(Math.abs(totalSpent))}
      </p>
      <div className="h-64">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
} 