// src/types/dashboard.ts
import { LucideIcon } from 'lucide-react'
import React from 'react'

export interface DashboardCard {
  icon: LucideIcon;
  title: string;
  value: string;
  percentage: number;
  positive: boolean;
}

export interface RecentActivity {
  id: string;
  icon: React.ReactNode;
  title: string;
  timestamp: string;
  type: 'success' | 'info' | 'warning';
}

export interface DashboardStats {
  totalEmployees: number;
  monthlyPayroll: number;
  generatedPayslips: number;
  averageCost: number;
}