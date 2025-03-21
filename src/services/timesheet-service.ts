
import { TimeEntry, EmployeeTimesheet, HourBank } from '@/types/timesheet'

// Dados mocados para desenvolvimento
export const getMockTimeEntries = (): TimeEntry[] => [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'Maria Silva',
    date: '2024-03-20',
    entryTime: '08:00',
    exitTime: '17:00',
    totalHours: 9,
    extraHours: 1,
    status: 'present'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'João Costa',
    date: '2024-03-20',
    entryTime: '09:15',
    exitTime: '18:15',
    totalHours: 9,
    extraHours: 0,
    status: 'late'
  }
]

// Dados mocados para desenvolvimento
export const getMockEmployeeTimesheet = (employeeId: string): EmployeeTimesheet => ({
  employeeId,
  employeeName: 'Maria Silva',
  monthYear: '2024-03',
  totalWorkHours: 176, // 22 dias * 8 horas
  extraHours: 12,
  absences: 1,
  delays: 2
})

// Dados mocados para desenvolvimento
export const getMockHourBank = (employeeId: string): HourBank => ({
  employeeId,
  employeeName: 'Maria Silva',
  totalBankedHours: 20,
  usedBankedHours: 5,
  availableBankedHours: 15
})