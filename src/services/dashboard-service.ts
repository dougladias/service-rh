// src/services/dashboard-service.ts
import React from 'react'
import { 
  Users, 
  DollarSign, 
  FileText, 
  TrendingUp 
} from 'lucide-react'

// Dashboard card interface
interface DashboardCard {
  icon: React.ElementType;
  title: string;
  value: string;
  percentage: number;
  positive: boolean;
  link: string;
  animationKey: string; // The key for animation mapping
}

// Recent activity interface
interface RecentActivity {
  id: string;
  icon: React.ReactNode;
  title: string;
  timestamp: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

// Dashboard stats interface
interface DashboardStats {
  totalEmployees: number;
  monthlyPayroll: number;
  generatedPayslips: number;
  averageCost: number;
}

// Função que retorna os cards de estatísticas do dashboard
export const getDashboardCards = (): DashboardCard[] => [
  {
    icon: Users,
    title: 'Total de Funcionários',
    value: '32',
    percentage: 1.5,
    positive: true,
    link: '/dashboard/funcionarios',
    animationKey: 'staff'  // Maps to Staff.json
  },
  {
    icon: DollarSign,
    title: 'Folha Mensal',
    value: 'R$ 128.250,00',
    percentage: 2.3,
    positive: true,
    link: '/dashboard/folha-pagamento',
    animationKey: 'dollar-symbol'  // Maps to dollar-symbol.json
  },
  {
    icon: FileText,
    title: 'Holerites Gerados',
    value: '32',
    percentage: 0,
    positive: true,
    link: '/dashboard/relatorios',
    animationKey: 'pdf'  // Maps to pdf.json
  },
  {
    icon: TrendingUp,
    title: 'Custo Médio',
    value: 'R$ 4.007,81',
    percentage: 1.2,
    positive: false,
    link: '/dashboard/relatorios',
    animationKey: 'support'  // Maps to support.json
  }
]

export const getRecentActivities = (): RecentActivity[] => [
  {
    id: '1',
    icon: React.createElement(FileText, { className: "text-green-600" }),
    title: 'Folha de pagamento do mês de Março/2023 processada com sucesso',
    timestamp: 'Admin • 30/03/2023, 10:23',
    type: 'success'
  },
  {
    id: '2',
    icon: React.createElement(Users, { className: "text-blue-600" }),
    title: 'Novo funcionário cadastrado: Maria Silva (Desenvolvedor)',
    timestamp: 'Admin • 28/03/2023, 06:15',
    type: 'info'
  },
  {
    id: '3',
    icon: React.createElement(FileText, { className: "text-purple-600" }),
    title: 'Relatório financeiro de Março/2023 gerado',
    timestamp: 'Admin • 25/03/2023, 12:45',
    type: 'warning'
  },
  {
    id: '4',
    icon: React.createElement(Users, { className: "text-blue-600" }),
    title: 'Novo funcionário cadastrado: João Costa (Designer)',
    timestamp: 'Admin • 20/03/2023, 05:30',
    type: 'info'
  },
  {
    id: '5',
    icon: React.createElement(FileText, { className: "text-green-600" }),
    title: 'Holerites do mês de Fevereiro/2023 enviados aos funcionários',
    timestamp: 'Admin • 05/03/2023, 07:20',
    type: 'success'
  }
]

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return {
    totalEmployees: 32,
    monthlyPayroll: 128250.00,
    generatedPayslips: 32,
    averageCost: 4007.81
  }
}