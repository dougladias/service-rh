'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Dados fictícios para os gráficos do assistente
const visitantesPorDia = [
  { name: 'Seg', visitantes: 4 },
  { name: 'Ter', visitantes: 7 },
  { name: 'Qua', visitantes: 5 },
  { name: 'Qui', visitantes: 8 },
  { name: 'Sex', visitantes: 12 },
]

const tarefasPorCategoria = [
  { name: 'Documentação', tarefas: 8 },
  { name: 'Visitantes', tarefas: 5 },
  { name: 'Materiais', tarefas: 3 },
  { name: 'Notas Fiscais', tarefas: 7 },
]

export default function AssistantCharts() {
  return (
    <Tabs defaultValue="visitantes" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="visitantes">Visitantes</TabsTrigger>
        <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
      </TabsList>
      <TabsContent value="visitantes">
        <Card>
          <CardHeader>
            <CardTitle>Registro de Visitantes</CardTitle>
            <CardDescription>
              Número de visitantes registrados na última semana
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visitantesPorDia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visitantes" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tarefas">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Tarefas</CardTitle>
            <CardDescription>
              Tarefas por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tarefasPorCategoria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tarefas" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}