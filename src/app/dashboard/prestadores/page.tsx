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
import { 
  Trash2,
  Check,
  Wrench
} from 'lucide-react'

// Tipos para prestadores de serviço
interface ServiceProvider {
  id: string
  fullName: string
  cpf: string
  serviceType: string  // Tipo de serviço (eletricista, encanador, etc.)
  company: string      // Empresa que representa
  entryTime: string
  exitTime?: string
  serviceDescription?: string // Descrição do serviço a ser realizado
}

interface ServiceProviderFilter {
  fullName?: string
  cpf?: string
  serviceType?: string
  company?: string
}

// Funções mock com persistência usando localStorage
export const getMockServiceProviders = (filter?: ServiceProviderFilter): ServiceProvider[] => {
  // Tenta recuperar prestadores do localStorage ou usa os dados iniciais
  let providers: ServiceProvider[] = [];
  
  try {
    const savedProviders = localStorage.getItem('serviceProviders');
    if (savedProviders) {
      providers = JSON.parse(savedProviders);
    } else {
      // Dados iniciais
      providers = [
        {
          id: '1',
          fullName: 'João Silva',
          cpf: '12345678900',
          serviceType: 'Eletricista',
          company: 'Elétrica Rápida Ltda',
          entryTime: '21/03/2025 08:30:00',
          serviceDescription: 'Manutenção na rede elétrica do 3º andar'
        },
        {
          id: '2',
          fullName: 'Carlos Oliveira',
          cpf: '98765432100',
          serviceType: 'Encanador',
          company: 'Hidráulica Express',
          entryTime: '21/03/2025 09:15:00',
          exitTime: '21/03/2025 11:45:00',
          serviceDescription: 'Reparo de vazamento no banheiro térreo'
        },
        {
          id: '3',
          fullName: 'Maria Pereira',
          cpf: '45678912300',
          serviceType: 'Pintora',
          company: 'Cores & Cia',
          entryTime: '20/03/2025 13:00:00',
          serviceDescription: 'Pintura da sala de reuniões'
        }
      ];
      // Salva os dados iniciais no localStorage
      localStorage.setItem('serviceProviders', JSON.stringify(providers));
    }
  } catch (error) {
    console.error("Erro ao carregar prestadores do localStorage:", error);
    // Usa os dados padrão em caso de erro
    providers = [
      {
        id: '1',
        fullName: 'João Silva',
        cpf: '12345678900',
        serviceType: 'Eletricista',
        company: 'Elétrica Rápida Ltda',
        entryTime: '21/03/2025 08:30:00',
        serviceDescription: 'Manutenção na rede elétrica do 3º andar'
      },
      {
        id: '2',
        fullName: 'Carlos Oliveira',
        cpf: '98765432100',
        serviceType: 'Encanador',
        company: 'Hidráulica Express',
        entryTime: '21/03/2025 09:15:00',
        exitTime: '21/03/2025 11:45:00',
        serviceDescription: 'Reparo de vazamento no banheiro térreo'
      }
    ];
  }

  // Aplicar filtros
  return providers.filter(provider => {
    if (filter?.fullName && !provider.fullName.toLowerCase().includes(filter.fullName.toLowerCase())) return false
    if (filter?.cpf && provider.cpf !== filter.cpf) return false
    if (filter?.serviceType && provider.serviceType !== filter.serviceType) return false
    if (filter?.company && !provider.company.toLowerCase().includes(filter.company.toLowerCase())) return false
    return true
  })
}

export const addServiceProvider = async (provider: Partial<ServiceProvider>): Promise<ServiceProvider> => {
  // Cria novo prestador de serviço
  const newProvider = {
    id: Math.random().toString(36).substr(2, 9),
    fullName: provider.fullName || '',
    cpf: provider.cpf || '',
    serviceType: provider.serviceType || '',
    company: provider.company || '',
    entryTime: new Date().toLocaleString('pt-BR'),
    serviceDescription: provider.serviceDescription || '',
    exitTime: undefined
  };
  
  try {
    // Recupera lista atual
    const providers = getMockServiceProviders();
    // Adiciona novo prestador
    const updatedProviders = [newProvider, ...providers];
    // Salva no localStorage
    localStorage.setItem('serviceProviders', JSON.stringify(updatedProviders));
  } catch (error) {
    console.error("Erro ao salvar novo prestador:", error);
  }
  
  return newProvider;
}

export const registerServiceProviderExit = async (providerId: string): Promise<ServiceProvider | null> => {
  try {
    // Recupera prestadores do localStorage
    const providers = getMockServiceProviders();
    const currentProvider = providers.find(p => p.id === providerId);
    
    if (!currentProvider) return null;
    
    // Atualiza o horário de saída
    const exitTime = new Date().toLocaleString('pt-BR');
    const updatedProvider = {
      ...currentProvider,
      exitTime: exitTime
    };
    
    // Atualiza a lista de prestadores
    const updatedProviders = providers.map(p => 
      p.id === providerId ? updatedProvider : p
    );
    
    // Salva no localStorage
    localStorage.setItem('serviceProviders', JSON.stringify(updatedProviders));
    
    return updatedProvider;
  } catch (error) {
    console.error("Erro ao registrar saída:", error);
    return null;
  }
}

export const deleteServiceProvider = async (providerId: string): Promise<boolean> => {
  try {
    // Recupera prestadores do localStorage
    const providers = getMockServiceProviders();
    
    // Remove o prestador da lista
    const updatedProviders = providers.filter(p => p.id !== providerId);
    
    // Salva no localStorage
    localStorage.setItem('serviceProviders', JSON.stringify(updatedProviders));
    
    return true;
  } catch (error) {
    console.error("Erro ao deletar prestador:", error);
    return false;
  }
}

export default function ServiceProvidersPage() {
  // Inicializa o estado com prestadores do localStorage
  const [providers, setProviders] = useState(() => getMockServiceProviders())
  const [newProvider, setNewProvider] = useState<Partial<ServiceProvider>>({})
  const [filter, setFilter] = useState<ServiceProviderFilter>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleAddProvider = async () => {
    if (Object.keys(newProvider).length > 0) {
      const providerToAdd = {
        fullName: newProvider.fullName || '',
        cpf: newProvider.cpf || '',
        serviceType: newProvider.serviceType || '',
        company: newProvider.company || '',
        serviceDescription: newProvider.serviceDescription || ''
      }

      const addedProvider = await addServiceProvider(providerToAdd)
      setProviders([addedProvider, ...providers])
      setNewProvider({})
    }
  }

  const handleRegisterExit = async (providerId: string) => {
    try {
      // Chama a função do serviço que agora persiste no localStorage
      const updatedProvider = await registerServiceProviderExit(providerId)
      
      if (updatedProvider) {
        // Atualiza o estado para refletir as mudanças
        setProviders(getMockServiceProviders()) // Recarrega do localStorage
      }
    } catch (error) {
      console.error("Erro ao registrar saída:", error)
    }
  }

  const handleDeleteProvider = async (providerId: string) => {
    const deleted = await deleteServiceProvider(providerId)
    if (deleted) {
      // Recarrega a lista atualizada do localStorage
      setProviders(getMockServiceProviders())
    }
  }

  const handleFilter = () => {
    const filteredProviders = getMockServiceProviders(filter)
    setProviders(filteredProviders)
  }
  
  // Adiciona um efeito para atualizar os prestadores quando a página é carregada
  useEffect(() => {
    // Atualiza a lista de prestadores do localStorage
    setProviders(getMockServiceProviders())
  }, [])

  // Lista de tipos de serviço para o select
  const serviceTypes = [
    "Eletricista",
    "Encanador",
    "Pintor",
    "Carpinteiro",
    "Ar-condicionado",
    "Limpeza",
    "TI/Redes",
    "Jardinagem",
    "Segurança",
    "Outro"
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Prestadores de Serviço</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>Cadastrar Prestador</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Prestador de Serviço</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name">Nome Completo</label>
                <Input 
                  id="name" 
                  value={newProvider.fullName || ''} 
                  onChange={(e) => setNewProvider({...newProvider, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="cpf">CPF</label>
                <Input 
                  id="cpf" 
                  value={newProvider.cpf || ''} 
                  onChange={(e) => setNewProvider({...newProvider, cpf: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="company">Empresa</label>
                <Input 
                  id="company" 
                  value={newProvider.company || ''} 
                  onChange={(e) => setNewProvider({...newProvider, company: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="serviceType">Tipo de Serviço</label>
                <Select 
                  value={newProvider.serviceType} 
                  onValueChange={(value) => setNewProvider({...newProvider, serviceType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="serviceDescription">Descrição do Serviço</label>
                <Input 
                  id="serviceDescription" 
                  value={newProvider.serviceDescription || ''} 
                  onChange={(e) => setNewProvider({...newProvider, serviceDescription: e.target.value})}
                />
              </div>
              <Button onClick={handleAddProvider} className="w-full">Cadastrar</Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
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
            <Input 
              placeholder="Empresa" 
              value={filter.company || ''} 
              onChange={(e) => setFilter({...filter, company: e.target.value})}
            />
            <Select 
              value={filter.serviceType} 
              onValueChange={(value) => setFilter({...filter, serviceType: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os serviços" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleFilter} className="md:col-span-2 lg:col-span-4">Filtrar</Button>
          </div>
        )}
      </div>

      {/* Tabela de Prestadores de Serviço */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Tipo de Serviço</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Entrada</TableHead>
            <TableHead>Saída</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider) => (
            <TableRow key={provider.id}>
              <TableCell>{provider.fullName}</TableCell>
              <TableCell>{provider.cpf}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  {provider.serviceType}
                </div>
              </TableCell>
              <TableCell>{provider.company}</TableCell>
              <TableCell className="max-w-xs truncate" title={provider.serviceDescription}>
                {provider.serviceDescription || '-'}
              </TableCell>
              <TableCell>{provider.entryTime}</TableCell>
              <TableCell>{provider.exitTime || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {!provider.exitTime && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-green-500"
                      onClick={() => handleRegisterExit(provider.id)}
                    >
                      <Check size={16} />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-red-500"
                    onClick={() => handleDeleteProvider(provider.id)}
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