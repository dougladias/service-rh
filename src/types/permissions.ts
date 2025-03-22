

export enum UserRole {
    CEO = 'CEO',
    ADMIN = 'ADMIN',
    ASSISTENTE = 'ASSISTENTE'
  }
  
  export enum Permission {
    // Usuários
    READ_USERS = 'read:users',
    CREATE_USERS = 'create:users',
    UPDATE_USERS = 'update:users',
    DELETE_USERS = 'delete:users',
    
    // Folha de pagamento
    READ_PAYROLL = 'read:payroll',
    CREATE_PAYROLL = 'create:payroll',
    UPDATE_PAYROLL = 'update:payroll',
    DELETE_PAYROLL = 'delete:payroll',
    
    // Documentos
    READ_DOCUMENTS = 'read:documents',
    CREATE_DOCUMENTS = 'create:documents',
    UPDATE_DOCUMENTS = 'update:documents',
    DELETE_DOCUMENTS = 'delete:documents',
    
    // Relatórios
    READ_REPORTS = 'read:reports',
    CREATE_REPORTS = 'create:reports'
  }
  
  // Mapeamento de papéis para permissões
  export const rolePermissions: Record<string, Permission[]> = {
    // CEO tem acesso a tudo
    'CEO': Object.values(Permission),
    
    // Administrador tem a maioria das permissões, mas não pode excluir usuários
    'ADMIN': [
      Permission.READ_USERS, 
      Permission.CREATE_USERS, 
      Permission.UPDATE_USERS,
      Permission.READ_PAYROLL, 
      Permission.CREATE_PAYROLL, 
      Permission.UPDATE_PAYROLL,
      Permission.READ_DOCUMENTS, 
      Permission.CREATE_DOCUMENTS,
      Permission.UPDATE_DOCUMENTS,
      Permission.READ_REPORTS, 
      Permission.CREATE_REPORTS
    ],
    
    // Assistente tem permissões limitadas a leitura
    'ASSISTENTE': [
      Permission.READ_USERS,
      Permission.READ_PAYROLL,
      Permission.READ_DOCUMENTS,
      Permission.READ_REPORTS
    ]
  }