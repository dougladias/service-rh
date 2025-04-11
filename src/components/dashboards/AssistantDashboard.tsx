import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, FileText, ListTodo, Package, 
  Utensils, Calendar 
} from 'lucide-react'
import AssistantCharts from '@/components/ui/AssistantCharts'
import Lottie from 'lottie-react'

interface DashboardCard {
  link: string
  animationKey: string
  icon: React.ElementType
  positive: boolean
  percentage: number
  title: string
  value: string | number
}

interface RecentActivity {
  icon: React.ElementType
  title: string
  description: string
  time: string
}

interface AssistantDashboardProps {
  isClient: boolean
  animations: Record<string, object>
  dashboardCards: DashboardCard[]
  recentActivities: RecentActivity[]
}

export default function AssistantDashboard({ 
  isClient, 
  animations, 
  dashboardCards,
  recentActivities 
}: AssistantDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold dark:text-white">
            Painel do Assistente
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gerencie tarefas, visitantes e documentos
          </p>
        </div>
      </div>

      {/* Cards específicos do assistente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card, index) => (
          <Link 
            key={index} 
            href={card.link}
            className="dark:bg-gray-800 bg-white border rounded-lg p-4 shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200 hover:border-cyan-300 group"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="w-14 h-14 flex items-center justify-center">
                {isClient && animations[card.animationKey] ? (
                  <Lottie 
                    animationData={animations[card.animationKey]} 
                    loop={true}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div className="bg-cyan-50 dark:bg-gray-800 border rounded-md p-2 group-hover:bg-cyan-100 transition-colors duration-200">
                    {React.createElement(card.icon as React.ElementType, { 
                      className: "text-cyan-500 group-hover:text-cyan-600 transition-colors", 
                      size: 30 
                    })}
                  </div>
                )}
              </div>
              <Badge 
                variant={card.positive ? 'secondary' : 'destructive'}
                className={`
                  ${card.positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
                  dark:bg-opacity-20 text-xs font-normal
                `}
              >
                {card.positive ? '+' : '-'}{card.percentage}%
              </Badge>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {card.title}
            </h3>
            <p className="text-2xl font-bold mt-1 dark:text-white">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Gráficos específicos para assistente */}
      <AssistantCharts />

      {/* Tarefas Rápidas */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Tarefas Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/dashboard/visitantes/novo">
              <Users className="mr-2 h-4 w-4" /> Registrar Visitante
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/dashboard/controle/notas-fiscais?new=true">
              <FileText className="mr-2 h-4 w-4" /> Nova Nota Fiscal
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/dashboard/lista-tarefas">
              <ListTodo className="mr-2 h-4 w-4" /> Criar Tarefa
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/dashboard/controle/materiais">
              <Package className="mr-2 h-4 w-4" /> Gerenciar Materiais
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/dashboard/controle/marmitas">
              <Utensils className="mr-2 h-4 w-4" /> Controle de Marmitas
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/dashboard/agenda">
              <Calendar className="mr-2 h-4 w-4" /> Agenda
            </Link>
          </Button>
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Atividades Recentes
        </h3>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="mt-1 bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded-full">
                {React.createElement(activity.icon as React.ElementType, { 
                  className: "text-cyan-600 dark:text-cyan-400", 
                  size: 16 
                })}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium dark:text-white">{activity.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.description}</p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}