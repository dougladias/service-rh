
import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  getDashboardCards, 
  getRecentActivities 
} from '@/services/dashboard-service'

export default function DashboardPage() {
  const dashboardCards = getDashboardCards()
  const recentActivities = getRecentActivities()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema de RH</p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-4 gap-4">
        {dashboardCards.map((card, index) => (
          <div 
            key={index} 
            className="bg-white border rounded-lg p-4 shadow-sm flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              {React.createElement(card.icon as React.ElementType, { className: "text-cyan-400", size: 32 })}
              <Badge 
                variant={card.positive ? 'secondary' : 'destructive'}
                className={`
                  ${card.positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
                  text-xs px-2 py-1 rounded-full
                `}
              >
                {card.positive ? '+' : ''}{card.percentage}%
              </Badge>
            </div>
            <div>
              <p className="text-gray-500 mb-2 text-sm">{card.title}</p>
              <h2 className="text-2xl font-bold">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Atividades Recentes */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Atividades Recentes</h3>
          <Button variant="link" className="text-cyan-600 p-0">
            Ver Todas as Atividades
          </Button>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-center justify-between border-b pb-3 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 p-2 rounded">
                  {activity.icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}