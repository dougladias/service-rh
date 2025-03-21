
// Definição do tipo Employee
// O tipo Employee é um objeto que possui as seguintes propriedades:

export interface Employee {
    id: string;
    name: string;
    role: string;
    department: string;
    email: string;
    admissionDate: string;
    salary: number;
    status: 'active' | 'inactive';
  }