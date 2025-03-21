
// Definição de tipos de dados para visitantes
export interface Visitor {
    id: string;
    fullName: string;
    cpf: string;
    sector?: string;
    entryTime: string;
    exitTime?: string;
  }
  
  // Definição de tipos de dados para filtros de visitantes
  export interface VisitorFilter {
    fullName?: string;
    cpf?: string;
    sector?: string;
  }