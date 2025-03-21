'use client'

import { useState, useEffect } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Visitor, VisitorFilter } from '@/types/visitor'
import { 
  Trash2,
  Check
} from 'lucide-react'

// Funções mock com persistência usando localStorage
export const getMockVisitors = (filter?: VisitorFilter): Visitor[] => {
  // Tenta recuperar visitantes do localStorage ou usa os dados iniciais
  let visitors: Visitor[] = [];
  
  try {
    const savedVisitors = localStorage.getItem('visitors');
    if (savedVisitors) {
      visitors = JSON.parse(savedVisitors);
    } else {
      // Dados iniciais
      visitors = [
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
      ];
      // Salva os dados iniciais no localStorage
      localStorage.setItem('visitors', JSON.stringify(visitors));
    }
  } catch (error) {
    console.error("Erro ao carregar visitantes do localStorage:", error);
    // Usa os dados padrão em caso de erro
    visitors = [
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
    ];
  }

  // Aplicar filtros
  return visitors.filter(visitor => {
    if (filter?.fullName && !visitor.fullName.toLowerCase().includes(filter.fullName.toLowerCase())) return false
    if (filter?.cpf && visitor.cpf !== filter.cpf) return false
    if (filter?.sector && visitor.sector !== filter.sector) return false
    return true
  })
}

// Adicionar a função que estava faltando
export const addVisitor = async (visitor: Partial<Visitor>): Promise<Visitor> => {
  // Cria novo visitante
  const newVisitor = {
    id: Math.random().toString(36).substr(2, 9),
    fullName: visitor.fullName || '',
    cpf: visitor.cpf || '',
    sector: visitor.sector || '',
    entryTime: new Date().toLocaleString('pt-BR'),
    exitTime: undefined
  };
  
  try {
    // Recupera lista atual
    const visitors = getMockVisitors();
    // Adiciona novo visitante
    const updatedVisitors = [newVisitor, ...visitors];
    // Salva no localStorage
    localStorage.setItem('visitors', JSON.stringify(updatedVisitors));
  } catch (error) {
    console.error("Erro ao salvar novo visitante:", error);
  }
  
  return newVisitor;
}

export const registerExit = async (visitorId: string): Promise<Visitor | null> => {
  try {
    // Recupera visitantes do localStorage
    const visitors = getMockVisitors();
    const currentVisitor = visitors.find(v => v.id === visitorId);
    
    if (!currentVisitor) return null;
    
    // Atualiza o horário de saída
    const exitTime = new Date().toLocaleString('pt-BR');
    const updatedVisitor = {
      ...currentVisitor,
      exitTime: exitTime
    };
    
    // Atualiza a lista de visitantes
    const updatedVisitors = visitors.map(v => 
      v.id === visitorId ? updatedVisitor : v
    );
    
    // Salva no localStorage
    localStorage.setItem('visitors', JSON.stringify(updatedVisitors));
    
    return updatedVisitor;
  } catch (error) {
    console.error("Erro ao registrar saída:", error);
    return null;
  }
}

export const deleteVisitor = async (visitorId: string): Promise<boolean> => {
  try {
    // Recupera visitantes do localStorage
    const visitors = getMockVisitors();
    
    // Remove o visitante da lista
    const updatedVisitors = visitors.filter(v => v.id !== visitorId);
    
    // Salva no localStorage
    localStorage.setItem('visitors', JSON.stringify(updatedVisitors));
    
    return true;
  } catch (error) {
    console.error("Erro ao deletar visitante:", error);
    return false;
  }
}

export default function VisitorsPage() {
  // Inicializa o estado com visitantes do localStorage
  const [visitors, setVisitors] = useState(() => getMockVisitors())
  const [newVisitor, setNewVisitor] = useState<Partial<Visitor>>({})
  const [filter, setFilter] = useState<VisitorFilter>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleAddVisitor = async () => {
    if (Object.keys(newVisitor).length > 0) {
      const visitorToAdd = {
        fullName: newVisitor.fullName || '',
        cpf: newVisitor.cpf || '',
        sector: newVisitor.sector || ''
      }

      const addedVisitor = await addVisitor(visitorToAdd)
      setVisitors([addedVisitor, ...visitors])
      setNewVisitor({})
    }
  }

  const handleRegisterExit = async (visitorId: string) => {
    try {
      // Chama a função do serviço que agora persiste no localStorage
      const updatedVisitor = await registerExit(visitorId)
      
      if (updatedVisitor) {
        // Atualiza o estado para refletir as mudanças
        setVisitors(getMockVisitors()) // Recarrega do localStorage para garantir dados atualizados
      }
    } catch (error) {
      console.error("Erro ao registrar saída:", error)
    }
  }

  const handleDeleteVisitor = async (visitorId: string) => {
    const deleted = await deleteVisitor(visitorId)
    if (deleted) {
      // Recarrega a lista atualizada do localStorage
      setVisitors(getMockVisitors())
    }
  }

  const handleFilter = () => {
    const filteredVisitors = getMockVisitors(filter)
    setVisitors(filteredVisitors)
  }
  
  // Adiciona um efeito para atualizar os visitantes quando a página é carregada
  useEffect(() => {
    // Atualiza a lista de visitantes do localStorage
    setVisitors(getMockVisitors())
  }, [])

  return (
    <div className="space-y-6">
      {/* Aqui deveria ter o código de adição e filtro */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Visitantes</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>Adicionar Visitante</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Visitante</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name">Nome Completo</label>
                <Input 
                  id="name" 
                  value={newVisitor.fullName || ''} 
                  onChange={(e) => setNewVisitor({...newVisitor, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="cpf">CPF</label>
                <Input 
                  id="cpf" 
                  value={newVisitor.cpf || ''} 
                  onChange={(e) => setNewVisitor({...newVisitor, cpf: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="sector">Setor</label>
                <Select 
                  value={newVisitor.sector} 
                  onValueChange={(value) => setNewVisitor({...newVisitor, sector: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddVisitor}>Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div>
        <Button 
          variant="outline" 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          {isFilterOpen ? "Esconder Filtros" : "Mostrar Filtros"}
        </Button>
        
        {isFilterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input 
              placeholder="Nome" 
              value={filter.fullName || ''} 
              onChange={(e) => setFilter({...filter, fullName: e.target.value})}
            />
            <Input 
              placeholder="CPF" 
              value={filter.cpf || ''} 
              onChange={(e) => setFilter({...filter, cpf: e.target.value})}
            />
            <Select 
              value={filter.sector} 
              onValueChange={(value) => setFilter({...filter, sector: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os setores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TI">TI</SelectItem>
                <SelectItem value="RH">RH</SelectItem>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
                <SelectItem value="Administrativo">Administrativo</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleFilter}>Filtrar</Button>
          </div>
        )}
      </div>

      {/* Tabela de Visitantes */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Horário de Entrada</TableHead>
            <TableHead>Horário de Saída</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitors.map((visitor) => (
            <TableRow key={visitor.id}>
              <TableCell>{visitor.fullName}</TableCell>
              <TableCell>{visitor.cpf}</TableCell>
              <TableCell>{visitor.sector || '-'}</TableCell>
              <TableCell>{visitor.entryTime}</TableCell>
              <TableCell>{visitor.exitTime || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {!visitor.exitTime && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-green-500"
                      onClick={() => handleRegisterExit(visitor.id)}
                    >
                      <Check size={16} />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-red-500"
                    onClick={() => handleDeleteVisitor(visitor.id)}
                  >
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