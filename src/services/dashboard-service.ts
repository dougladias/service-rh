// src/services/dashboard-service.ts
import React from 'react'
import {
  Users, Clock, FileText, BriefcaseBusiness, CircleUser,
  Package, Banknote, ReceiptText, ListTodo, StickyNote
} from 'lucide-react'

// Tipo para card do dashboard
export interface DashboardCard {
  title: string
  value: string
  percentage: string
  positive: boolean
  icon: React.ElementType
  animationKey: string
  link: string
}

// Recent activity interface
export interface RecentActivity {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
}

// Dashboard stats interface
interface DashboardStats {
  totalEmployees: number;
  monthlyPayroll: number;
  generatedPayslips: number;
  averageCost: number;
}

export const getDashboardCards = () => {
  return [
    {
      title: "Total de Funcionários",
      value: "42",
      percentage: "5",
      positive: true,
      icon: Users,
      animationKey: "staff",
      link: "/dashboard/funcionarios"
    },
    {
      title: "Folha Salarial",
      value: "R$ 129.850",
      percentage: "2.5",
      positive: true,
      icon: Banknote,
      animationKey: "finance",
      link: "/dashboard/folha-pagamento"
    },
    {
      title: "Documentos",
      value: "187",
      percentage: "12",
      positive: true,
      icon: FileText,
      animationKey: "documents",
      link: "/dashboard/documentos"
    },
    {
      title: "Orçamentos",
      value: "25",
      percentage: "8",
      positive: false,
      icon: ReceiptText,
      animationKey: "dollar-symbol",
      link: "/dashboard/controle/orcamentos"
    }
  ];
};

export const getAssistantDashboardCards = () => {
  return [
    {
      title: "Visitantes Hoje",
      value: "12",
      percentage: "33",
      positive: true,
      icon: CircleUser,
      animationKey: "people-search",
      link: "/dashboard/visitantes"
    },
    {
      title: "Notas Fiscais",
      value: "8",
      percentage: "12",
      positive: false,
      icon: StickyNote,
      animationKey: "pdf",
      link: "/dashboard/controle/notas-fiscais"
    },
    {
      title: "Tarefas Pendentes",
      value: "5",
      percentage: "40",
      positive: true,
      icon: ListTodo,
      animationKey: "support",
      link: "/dashboard/lista-tarefas"
    },
    {
      title: "Materiais",
      value: "132",
      percentage: "5",
      positive: true,
      icon: Package,
      animationKey: "dollar-symbol",
      link: "/dashboard/controle/materiais"
    }
  ];
};

export const getRecentActivities = () => {
  return [
    {
      icon: Users,
      title: "Novo visitante registrado",
      description: "João Silva foi registrado como visitante",
      time: "Agora"
    },
    {
      icon: FileText,
      title: "Nota fiscal adicionada",
      description: "NF-e #45982 foi cadastrada no sistema",
      time: "2h atrás"
    },
    {
      icon: ListTodo,
      title: "Tarefa concluída",
      description: "A tarefa 'Verificar documentos' foi finalizada",
      time: "3h atrás"
    },
    {
      icon: Clock,
      title: "Solicitação de ponto",
      description: "Carlos solicitou ajuste de ponto",
      time: "1d atrás"
    },
    {
      icon: BriefcaseBusiness,
      title: "Novo prestador cadastrado",
      description: "Empresa XYZ foi adicionada como prestadora",
      time: "2d atrás"
    }
  ];
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return {
    totalEmployees: 32,
    monthlyPayroll: 128250.00,
    generatedPayslips: 32,
    averageCost: 4007.81
  }
}