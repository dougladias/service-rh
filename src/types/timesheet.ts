
// Este arquivo contém os tipos para o recurso de folha de ponto
export interface TimeEntry {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    entryTime: string;
    exitTime: string;
    totalHours: number;
    extraHours: number;
    status: 'present' | 'absent' | 'late'
  }
  
  // Este arquivo contém os tipos para o recurso de folha de ponto
  export interface EmployeeTimesheet {
    employeeId: string;
    employeeName: string;
    monthYear: string;
    totalWorkHours: number;
    extraHours: number;
    absences: number;
    delays: number;
  }
  // Este arquivo contém os tipos para o recurso de banco de horas
  export interface HourBank {
    employeeId: string;
    employeeName: string;
    totalBankedHours: number;
    usedBankedHours: number;
    availableBankedHours: number;
  }