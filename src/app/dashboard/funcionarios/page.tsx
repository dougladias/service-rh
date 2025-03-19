
'use client'

import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { 
  getEmployees, 
  addEmployee 
} from '@/services/employees-service'
import { Employee } from '@/types/employee'
import { 
  Plus, 
  Edit, 
  Trash2 
} from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(getEmployees())
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({})

  const handleAddEmployee = async () => {
    if (Object.keys(newEmployee).length > 0) {
      const employeeToAdd = {
        ...newEmployee,
        admissionDate: new Date().toISOString(),
        status: 'active'
      } as Omit<Employee, 'id'>

      const addedEmployee = await addEmployee(employeeToAdd)
      setEmployees([...employees, addedEmployee])
      // Limpar formulário
      setNewEmployee({})
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Funcionários</h1>
          <p className="text-gray-600">Gerenciamento de funcionários</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" size={16} /> Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Funcionário</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Nome</label>
                <Input 
                  className="col-span-3"
                  value={newEmployee.name || ''}
                  onChange={(e) => setNewEmployee({
                    ...newEmployee, 
                    name: e.target.value
                  })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Cargo</label>
                <Input 
                  className="col-span-3"
                  value={newEmployee.role || ''}
                  onChange={(e) => setNewEmployee({
                    ...newEmployee, 
                    role: e.target.value
                  })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Departamento</label>
                <Input 
                  className="col-span-3"
                  value={newEmployee.department || ''}
                  onChange={(e) => setNewEmployee({
                    ...newEmployee, 
                    department: e.target.value
                  })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">E-mail</label>
                <Input 
                  className="col-span-3"
                  value={newEmployee.email || ''}
                  onChange={(e) => setNewEmployee({
                    ...newEmployee, 
                    email: e.target.value
                  })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Salário</label>
                <Input 
                  type="number"
                  className="col-span-3"
                  value={newEmployee.salary || ''}
                  onChange={(e) => setNewEmployee({
                    ...newEmployee, 
                    salary: Number(e.target.value)
                  })}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddEmployee}>
                Salvar Funcionário
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Funcionários */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Salário</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.role}</TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{formatCurrency(employee.salary)}</TableCell>
              <TableCell>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${employee.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                  }
                `}>
                  {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon">
                    <Edit size={16} />
                  </Button>
                  <Button variant="outline" size="icon" className="text-red-600">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}