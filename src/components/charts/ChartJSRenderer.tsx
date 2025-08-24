import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData as ChartJSData
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import type { ChartData, ChartConfig } from './types';

// Register Chart.js components (tree-shaking)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartJSRendererProps {
  data: ChartData;
  config: ChartConfig;
  height?: number;
}

export const ChartJSRenderer: React.FC<ChartJSRendererProps> = ({
  data,
  config,
  height = 400
}) => {
  const chartData: ChartJSData = {
    labels: data.labels,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || generateColors(data.labels.length),
      borderColor: dataset.borderColor || '#3B82F6',
      borderWidth: dataset.borderWidth || 2
    }))
  };

  const options: ChartOptions = {
    responsive: config.responsive !== false,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: config.title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false
      }
    },
    scales: config.type !== 'pie' ? {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Categories'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Values'
        },
        beginAtZero: true
      }
    } : undefined
  };

  switch (config.type) {
    case 'bar':
      return <Bar data={chartData as any} options={options as any} width={config.width || 100} height={height} />;
    case 'line':
      return <Line data={chartData as any} options={options as any} width={config.width || 100} height={height} />;
    case 'pie':
      return <Pie data={chartData as any} options={options as any} width={config.width || 100} height={height} />;
    case 'doughnut':
      return <Doughnut data={chartData as any} options={options as any} width={config.width || 100} height={height} />;
    default:
      return <Bar data={chartData as any} options={options as any} width={config.width || 100} height={height} />;
  }
};

function generateColors(count: number): string[] {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#F97316', '#06B6D4', '#84CC16',
    '#EC4899', '#6366F1'
  ];
  
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
}