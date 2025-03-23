"use client";

import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function SimpleCharts() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 300 });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const chartData = React.useMemo(() => [
    { month: 'Jan', value: 128250 },
    { month: 'Fev', value: 134500 },
    { month: 'Mar', value: 129800 },
    { month: 'Abr', value: 132400 },
    { month: 'Mai', value: 140200 },
    { month: 'Jun', value: 172500 },
  ], []);

  const formatCurrency = React.useCallback((value: number) => {
    if (isMobile) {
      return `R$ ${Math.round(value / 1000)}K`;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  }, [isMobile]);

  const formatAxisLabel = React.useCallback((value: number) => {
    if (isMobile) {
      return `${Math.round(value / 1000)}K`;
    }
    if (isTablet) {
      return `R$ ${Math.round(value / 1000)}K`;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  }, [isMobile, isTablet]);

  const margins = React.useMemo(() => {
    if (isMobile) return { top: 10, right: 10, bottom: 30, left: 35 };
    if (isTablet) return { top: 10, right: 10, bottom: 30, left: 50 };
    return { top: 10, right: 10, bottom: 30, left: 70 };
  }, [isMobile, isTablet]);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = width < 400 ? 200 : width < 700 ? 250 : 300;
        setDimensions({ width, height });
      }
    };

    const debouncedUpdateDimensions = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 100);
    };

    updateDimensions();
    window.addEventListener('resize', debouncedUpdateDimensions);
    return () => {
      window.removeEventListener('resize', debouncedUpdateDimensions);
      clearTimeout(timeoutId);
    };
  }, []);

  const series = React.useMemo(() => [
    {
      data: chartData.map(item => item.value),
      color: '#22d3ee',
      valueFormatter: (value: number | null) => value !== null ? formatCurrency(value) : '',
      label: 'Folha Mensal',
      labelStyle: {
        fill: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
      },
    }
  ], [chartData, formatCurrency, theme.palette.mode]);

  if (dimensions.width === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full bg-neutral-100 dark:bg-neutral-800 p-6 rounded-2xl shadow-md min-h-[300px] flex items-center justify-center"
      >
        <div className="text-neutral-400 dark:text-neutral-300 animate-pulse">Carregando gráfico...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full bg-neutral-100 dark:bg-gray-800 border p-6 rounded-2xl shadow-md overflow-hidden"
    >
      <h3 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">
        Folha de Pagamento Mensal
      </h3>
      <BarChart
        xAxis={[{
          id: 'barCategories',
          data: chartData.map(item => item.month),
          scaleType: 'band',
          tickLabelStyle: {
            fontSize: isMobile ? 10 : 12,
            fill: theme.palette.mode === 'dark' ? '#e5e7eb' : '#374151',
          },
        }]}
        yAxis={[{
          id: 'yAxis',
          tickLabelStyle: {
            fontSize: isMobile ? 10 : 12,
            fill: theme.palette.mode === 'dark' ? '#e5e7eb' : '#374151',
          },
          valueFormatter: formatAxisLabel,
          tickNumber: isMobile ? 3 : 5,
        }]}
        series={series}
        width={dimensions.width}
        height={dimensions.height}
        margin={margins}
        slotProps={{
          legend: { hidden: isMobile },
        }}
        sx={{
          '.MuiChartsAxis-tickLabel': {
            transform: 'translateY(1px)',
          },
          '.MuiChartsAxis-line': {
            stroke: theme.palette.mode === 'dark' ? '#4b5563' : '#d1d5db',
          },
          '.MuiChartsAxis-tick': {
            stroke: theme.palette.mode === 'dark' ? '#4b5563' : '#d1d5db',
          },
        }}
      />
    </div>
  );
}
