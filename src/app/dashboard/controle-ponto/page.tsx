
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { 
  getMockTimeEntries, 
  getMockEmployeeTimesheet,
  getMockHourBank
} from '@/services/timesheet-service'
import { 
  Clock, 
  CalendarCheck, 
  Timer, 
  FileSpreadsheet 
} from 'lucide-react'

export default function TimeControlPage() {
  const [timeEntries, setTimeEntries] = useState(getMockTimeEntries())
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [timesheet, setTimesheet] = useState(getMockEmployeeTimesheet('1'))
  const [hourBank, setHourBank] = useState(getMockHourBank('1'))

  const handleRegisterEntry = () => {
    // Lógica para registrar entrada/saída
    console.log('Registrar entrada/saída')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Controle de Ponto e Jornada</h1>
          <p className="text-gray-600">Registro de entrada, saída e gestão de horas</p>
        </div>
        <Button onClick={handleRegisterEntry}>
          <Clock className="mr-2" size={16} /> Registrar Ponto
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <CalendarCheck className="text-blue-500" size={32} />
            <span className="text-lg font-bold">{timesheet.totalWorkHours}h</span>
          </div>
          <p className="text-gray-500">Horas Trabalhadas</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Timer className="text-green-500" size={32} />
            <span className="text-lg font-bold">{timesheet.extraHours}h</span>
          </div>
          <p className="text-gray-500">Horas Extras</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <FileSpreadsheet className="text-purple-500" size={32} />
            <span className="text-lg font-bold">{hourBank.availableBankedHours}h</span>
          </div>
          <p className="text-gray-500">Banco de Horas</p>
        </div>
      </div>

      {/* Tabela de Registros de Ponto */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Registros de Ponto</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Saída</TableHead>
              <TableHead>Horas Trabalhadas</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.employeeName}</TableCell>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.entryTime}</TableCell>
                <TableCell>{entry.exitTime}</TableCell>
                <TableCell>{entry.totalHours}h</TableCell>
                <TableCell>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${
                      entry.status === 'present' 
                        ? 'bg-green-100 text-green-800' 
                        : entry.status === 'late'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {
                      entry.status === 'present' 
                        ? 'Presente' 
                        : entry.status === 'late'
                        ? 'Atrasado'
                        : 'Ausente'
                    }
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}