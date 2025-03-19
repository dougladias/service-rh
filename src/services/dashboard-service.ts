// src/services/dashboard-service.ts
import React from 'react'
import { 
  Users, 
  DollarSign, 
  FileText, 
  TrendingUp 
} from 'lucide-react'
import { DashboardCard, RecentActivity, DashboardStats } from '@/types/dashboard'

// Função que retorna os cards de estatísticas do dashboard
export const getDashboardCards = (): DashboardCard[] => [
  {
    icon: Users,
    title: 'Total de Funcionários',
    value: '32',
    percentage: 1.5,
    positive: true
  },
  {
    icon: DollarSign,
    title: 'Folha Mensal',
    value: 'R$ 128.250,00',
    percentage: 2.3,
    positive: true
  },
  {
    icon: FileText,
    title: 'Holerites Gerados',
    value: '32',
    percentage: 0,
    positive: true
  },
  {
    icon: TrendingUp,
    title: 'Custo Médio',
    value: 'R$ 4.007,81',
    percentage: 1.2,
    positive: false
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