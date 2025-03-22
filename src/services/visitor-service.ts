
import { Visitor, VisitorFilter } from '@/types/visitor'

export const getMockVisitors = (filter?: VisitorFilter): Visitor[] => {
  const visitors: Visitor[] = [
    {
      id: '1',
      fullName: 'Carlos Eduardo Vicente Ryan Pinto',
      cpf: '92549170369',
      sector: 'TI',
      entryTime: '21/03/2025 09:29:34',
      exitTime: undefined
    },
    {
      id: '2',
      fullName: 'Filipe Danilo José Novaes',
      cpf: '57514780378',
      sector: 'RH',
      entryTime: '08/04/2022 09:05',
      exitTime: '08/04/2022 09:05'
    }
  ]

  // Aplicar filtros
  return visitors.filter(visitor => {
    if (filter?.fullName && !visitor.fullName.toLowerCase().includes(filter.fullName.toLowerCase())) return false
    if (filter?.cpf && visitor.cpf !== filter.cpf) return false
    if (filter?.sector && visitor.sector !== filter.sector) return false
    return true
  })
}


// Simula adição de visitante
export const registerExit = async (visitorId: string): Promise<Visitor | null> => {
  // Simula registro de saída
  const exitTime = new Date().toLocaleString('pt-BR')
  return {
    id: visitorId,
    fullName: 'Carlos Eduardo Vicente Ryan Pinto', // Dados mockados
    cpf: '92549170369',
    sector: 'TI',
    entryTime: '21/03/2025 09:29:34',
    exitTime: exitTime
  }
}


export const deleteVisitor = async (visitorId: string): Promise<boolean> => {
  // Lógica para deletar visitante
  return true
}