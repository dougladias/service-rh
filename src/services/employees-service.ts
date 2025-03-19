
import { Employee } from '@/types/employee'

// Dados mocados - preparado para substituição por API
export const getEmployees = (): Employee[] => [
  {
    id: '1',
    name: 'Maria Silva',
    role: 'Desenvolvedora',
    department: 'TI',
    email: 'maria.silva@empresa.com',
    admissionDate: '2022-03-15',
    salary: 7500,
    status: 'active'
  },
  {
    id: '2',
    name: 'João Costa',
    role: 'Designer',
    department: 'Criação',
    email: 'joao.costa@empresa.com',
    admissionDate: '2021-11-20',
    salary: 6200,
    status: 'active'
  },
  {
    id: '3',
    name: 'Ana Oliveira',
    role: 'Analista RH',
    department: 'Recursos Humanos',
    email: 'ana.oliveira@empresa.com',
    admissionDate: '2023-01-10',
    salary: 5500,
    status: 'active'
  }
]

// Função para buscar funcionário por ID
export const getEmployeeById = (id: string): Employee | undefined => {
  return getEmployees().find(emp => emp.id === id)
}

// Função para adicionar novo funcionário (mock)
export const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
  // No futuro, será substituída por chamada de API
  const newEmployee = {
    ...employee,
    id: String(Date.now()) // Geração temporária de ID
  }
  return newEmployee
}