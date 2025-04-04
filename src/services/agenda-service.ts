import { format, parse, compareAsc, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces
export interface Compromisso {
  id: string;
  titulo: string;
  data: string;
  hora: string;
  tipo: string;
  participantes: string;
  local: string;
  descricao: string;
  concluido: boolean;
}

// Tipos de Compromisso Disponíveis
export const tiposCompromisso = [
  { valor: 'reuniao', label: 'Reunião' },
  { valor: 'entrevista', label: 'Entrevista' },
  { valor: 'evento', label: 'Evento' },
  { valor: 'prazo', label: 'Prazo de entrega' },
  { valor: 'outro', label: 'Outro' }
];

// Retorna todos os compromissos do localStorage
export const getCompromissos = (): Compromisso[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const compromissosSalvos = localStorage.getItem('compromissos');
    return compromissosSalvos ? JSON.parse(compromissosSalvos) : [];
  } catch (error) {
    console.error('Erro ao buscar compromissos:', error);
    return [];
  }
};

// Salva todos os compromissos no localStorage
export const saveCompromissos = (compromissos: Compromisso[]): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('compromissos', JSON.stringify(compromissos));
  } catch (error) {
    console.error('Erro ao salvar compromissos:', error);
  }
};

// Adiciona um novo compromisso
export const adicionarCompromisso = (compromisso: Omit<Compromisso, 'id' | 'concluido'>): Compromisso => {
  const novoCompromisso: Compromisso = {
    ...compromisso,
    id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    concluido: false
  };
  
  const compromissos = getCompromissos();
  const novosCompromissos = [...compromissos, novoCompromisso];
  saveCompromissos(novosCompromissos);
  
  return novoCompromisso;
};

// Atualiza um compromisso existente
export const atualizarCompromisso = (compromisso: Compromisso): boolean => {
  const compromissos = getCompromissos();
  const index = compromissos.findIndex(c => c.id === compromisso.id);
  
  if (index === -1) {
    return false;
  }
  
  compromissos[index] = compromisso;
  saveCompromissos(compromissos);
  return true;
};

// Exclui um compromisso
export const excluirCompromisso = (id: string): boolean => {
  const compromissos = getCompromissos();
  const novosCompromissos = compromissos.filter(c => c.id !== id);
  
  if (novosCompromissos.length === compromissos.length) {
    return false;
  }
  
  saveCompromissos(novosCompromissos);
  return true;
};

// Alterna o status de um compromisso (concluído/não concluído)
export const alternarStatusCompromisso = (id: string): boolean => {
  const compromissos = getCompromissos();
  const index = compromissos.findIndex(c => c.id === id);
  
  if (index === -1) {
    return false;
  }
  
  compromissos[index].concluido = !compromissos[index].concluido;
  saveCompromissos(compromissos);
  return true;
};

// Filtra compromissos por termo de busca, tipo e data
export const filtrarCompromissos = (
  termo: string = '',
  tipo: string = 'todos',
  data: string = ''
): Compromisso[] => {
  const compromissos = getCompromissos();
  
  return compromissos.filter(comp => {
    // Filtro por termo de busca (título, local ou participantes)
    const matchesTermo = 
      !termo ||
      comp.titulo.toLowerCase().includes(termo.toLowerCase()) ||
      comp.local.toLowerCase().includes(termo.toLowerCase()) ||
      comp.participantes.toLowerCase().includes(termo.toLowerCase());
    
    // Filtro por tipo
    const matchesTipo = 
      tipo === 'todos' || comp.tipo === tipo;
    
    // Filtro por data
    const matchesData = 
      !data || comp.data === data;
    
    return matchesTermo && matchesTipo && matchesData;
  });
};

// Ordena compromissos por data e hora
export const ordenarCompromissos = (compromissos: Compromisso[]): Compromisso[] => {
  return [...compromissos].sort((a, b) => {
    try {
      // Comparar datas
      const dataA = new Date(`${a.data}T${a.hora}`);
      const dataB = new Date(`${b.data}T${b.hora}`);
      return compareAsc(dataA, dataB);
    } catch {
      return 0;
    }
  });
};

// Formata data para exibição (de YYYY-MM-DD para DD/MM/YYYY)
export const formatarData = (dataStr: string): string => {
  try {
    if (!isValid(parse(dataStr, 'yyyy-MM-dd', new Date()))) {
      return dataStr;
    }
    return format(parse(dataStr, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dataStr;
  }
};

// Verifica se um compromisso está atrasado
export const isCompromissoAtrasado = (compromisso: Compromisso): boolean => {
  if (compromisso.concluido) {
    return false;
  }
  
  try {
    const dataCompromisso = new Date(`${compromisso.data}T${compromisso.hora}`);
    return dataCompromisso < new Date();
  } catch {
    return false;
  }
};

// Obter compromissos para uma data específica
export const getCompromissosPorData = (data: string): Compromisso[] => {
  const compromissos = getCompromissos();
  return compromissos.filter(comp => comp.data === data);
};

// Gerar dados de exemplo para testes
export const gerarDadosExemplo = (): void => {
  const exemploCompromissos: Omit<Compromisso, 'id' | 'concluido'>[] = [
    {
      titulo: 'Reunião de Planejamento',
      data: format(new Date(), 'yyyy-MM-dd'),
      hora: '09:00',
      tipo: 'reuniao',
      participantes: 'João, Maria, Pedro',
      local: 'Sala de Reuniões 1',
      descricao: 'Discutir planejamento estratégico para o próximo trimestre'
    },
    {
      titulo: 'Entrevista com Candidato',
      data: format(new Date(), 'yyyy-MM-dd'),
      hora: '14:30',
      tipo: 'entrevista',
      participantes: 'RH, Gerente de TI',
      local: 'Sala de Entrevistas',
      descricao: 'Entrevista para vaga de desenvolvedor front-end'
    },
    {
      titulo: 'Prazo para entrega do Relatório Mensal',
      data: format(new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      hora: '18:00',
      tipo: 'prazo',
      participantes: '',
      local: '',
      descricao: 'Finalizar e entregar o relatório de desempenho mensal'
    }
  ];
  
  const compromissosExistentes = getCompromissos();
  
  if (compromissosExistentes.length === 0) {
    // Só adiciona os dados de exemplo se não houver compromissos já salvos
    const novosCompromissos = exemploCompromissos.map(comp => ({
      ...comp,
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      concluido: false
    }));
    
    saveCompromissos(novosCompromissos);
  }
};