'use client';

import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import {
  ArcElement,
  ChartData,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type TooltipItem,
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';

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

  // State to track window width for responsive legend positioning
  const [isMobile, setIsMobile] = useState(false);

  // Effect to detect screen size
  useEffect(() => {
    // Function to check if viewport is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint in Tailwind
    };

    // Set initial value
    checkMobile();

    // Add listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chartData = {
    labels: sortedData.map((item) => item.category),
    datasets: [
      {
        data: sortedData.map((item) => Math.abs(item.amount)),
        backgroundColor: sortedData.map(
          (_, index) => CATEGORY_COLORS[index % CATEGORY_COLORS.length]
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: isMobile ? ('bottom' as const) : ('right' as const),
        labels: {
          boxWidth: isMobile ? 12 : 20, // Smaller color boxes on mobile
          padding: isMobile ? 10 : 20, // Less padding on mobile
          font: {
            size: isMobile ? 10 : 12, // Smaller font on mobile
          },
          generateLabels: (chart: ChartJS<'pie', number[], string>) => {
            const datasets = chart.data.datasets;
            return (chart.data.labels ?? []).map((label: string, i: number) => {
              const meta = chart.getDatasetMeta(0);
              const style = meta.controller.getStyle(i, false);
              const percentage = sortedData[i].percentage.toFixed(1);

              // On mobile, only show category and percentage to save space
              const text = isMobile
                ? `${label}: ${percentage}%`
                : `${label}: ${formatCurrency(Math.abs(sortedData[i].amount))} (${percentage}%)`;

              return {
                text,
                fillStyle: style.backgroundColor,
                strokeStyle: style.borderColor,
                lineWidth: style.borderWidth,
                hidden: !chart.getDataVisibility(i),
                index: i,
              };
            });
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'pie'>) => {
            const index = context.dataIndex;
            const value = Math.abs(sortedData[index].amount);
            const percentage = sortedData[index].percentage.toFixed(1);
            return `${sortedData[index].category}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Adjust chart height based on screen size and number of categories
  const getChartHeight = () => {
    if (isMobile) {
      // On mobile with legend at bottom, adjust height based on number of categories
      const categoryCount = sortedData.length;
      const minHeight = 200; // Minimum height of chart area
      const legendHeight = Math.ceil(categoryCount / 2) * 24; // Estimate legend height
      return minHeight + legendHeight;
    }
    // Default height for desktop
    return 240;
  };

  return (
    <div className={cn('w-full', className)}>
      <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Spending by Category</h3>
      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
        Total: {formatCurrency(Math.abs(totalSpent))}
      </p>
      <div style={{ height: `${getChartHeight()}px` }} className="max-h-[400px]">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}
