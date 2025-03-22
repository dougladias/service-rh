'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  getDashboardCards, 
  getRecentActivities 
} from '@/services/dashboard-service'
import SimpleCharts from '@/components/ui/ChartMoney'
import dynamic from 'next/dynamic'

// Dynamically import Lottie with SSR disabled
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

export default function DashboardPage() {
  const dashboardCards = getDashboardCards()
  const recentActivities = getRecentActivities()
  const [isClient, setIsClient] = useState(false)
  const [animations, setAnimations] = useState<Record<string, object>>({})

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load all animations
  useEffect(() => {
    if (!isClient) return

    const loadAnimations = async () => {
      try {
        const animationFiles = {
          'dollar-symbol': '/dollar-simbol.json',
          'pdf': '/Pdf.json',
          'staff': '/Staff.json',
          'support': '/plane.json'
        }

        const loadedAnimations: Record<string, object> = {}

        // Load each animation file
        await Promise.all(
          Object.entries(animationFiles).map(async ([key, path]) => {
            try {
              const response = await fetch(path)
              if (!response.ok) {
                throw new Error(`Failed to fetch ${path}`)
              }
              const data = await response.json()
              loadedAnimations[key] = data
            } catch (error) {
              console.error(`Error loading animation ${path}:`, error)
            }
          })
        )

        setAnimations(loadedAnimations)
      } catch (error) {
        console.error("Error loading animations:", error)
      }
    }

    loadAnimations()
  }, [isClient])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Visão geral do sistema de RH</p>
        </div>
      </div>

      {/* Cards de Estatísticas como Links */}
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
                  // Fallback to original icon if animation isn't loaded
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
                  ${card.positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600 dark:text-white'}
                  text-xs px-2 py-1 rounded-full
                `}
              >
                {card.positive ? '+' : ''}{card.percentage}%
              </Badge>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm font-medium">{card.title}</p>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-300">{card.value}</h2>
            </div>
          </Link>
        ))}
      </div>

      <SimpleCharts />

      {/* Atividades Recentes */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Atividades Recentes</h3>
          <Button variant="link" className="text-cyan-600 p-0 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300">
            Ver Todas as Atividades
          </Button>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-center justify-between border-b pb-3 last:border-b-0 dark:border-gray-700"
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  p-2 rounded-full
                  ${activity.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 
                    activity.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30' : 
                    activity.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-700'}
                `}>
                  {activity.icon}
                </div>
                <div>
                  <p className="font-medium text-sm dark:text-white">{activity.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}