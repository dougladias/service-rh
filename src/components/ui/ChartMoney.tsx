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
  
  // Fixed data array that won't change between renders
  const chartData = React.useMemo(() => [
    { month: 'Jan', value: 128250 },
    { month: 'Fev', value: 134500 },
    { month: 'Mar', value: 129800 },
    { month: 'Abr', value: 132400 },
    { month: 'Mai', value: 140200 },
    { month: 'Jun', value: 172500 },
  ], []);
  
  // Memoized formatters to prevent new function creation on every render
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
  
  // Calculate margins based on screen size
  const margins = React.useMemo(() => {
    if (isMobile) {
      return { top: 10, right: 10, bottom: 30, left: 35 };
    }
    if (isTablet) {
      return { top: 10, right: 10, bottom: 30, left: 50 };
    }
    return { top: 10, right: 10, bottom: 30, left: 70 };
  }, [isMobile, isTablet]);
  
  // Update dimensions on resize, debounced to prevent too many rerenders
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        
        // Adjust height based on width for better proportions
        const height = width < 400 ? 200 : width < 700 ? 250 : 300;
        
        setDimensions({ width, height });
      }
    };
    
    const debouncedUpdateDimensions = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 100);
    };
    
    // Initial dimensions
    updateDimensions();
    
    // Update on resize
    window.addEventListener('resize', debouncedUpdateDimensions);
    return () => {
      window.removeEventListener('resize', debouncedUpdateDimensions);
      clearTimeout(timeoutId);
    };
  }, []);

  // Memoized series configuration
  const series = React.useMemo(() => [
    {
      data: chartData.map(item => item.value),
      color: '#22d3ee', // cyan-400
      valueFormatter: (value: number | null) => value !== null ? formatCurrency(value) : '',
      label: 'Folha Mensal',
      marginLeft: 10,
    }
  ], [chartData, formatCurrency]);

  // Only render chart when we have a valid width
  if (dimensions.width === 0) {
    return (
      <div ref={containerRef} className="w-full bg-white p-4 rounded-lg shadow-sm min-h-[300px] flex items-center justify-center">
        <div className="text-gray-400">Carregando gráfico...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full bg-white p-4 rounded-lg shadow-sm overflow-hidden">
      <h3 className="text-lg font-semibold mb-4">Folha de Pagamento Mensal</h3>
      <BarChart
        xAxis={[{
          id: 'barCategories',
          data: chartData.map(item => item.month),
          scaleType: 'band',
          tickLabelStyle: {
            fontSize: isMobile ? 10 : 12,
          },
        }]}
        yAxis={[{
          id: 'yAxis',
          tickLabelStyle: {
            fontSize: isMobile ? 10 : 12,
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
            transform: 'translateY(1px)'
          },
          '.MuiChartsAxis-line': {
            stroke: '#e5e7eb',
          },
          '.MuiChartsAxis-tick': {
            stroke: '#e5e7eb',
          },
        }}
      />
    </div>
  );
}