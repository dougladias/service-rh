'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  CalendarDays,
  Search,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger, // Adicionei DialogTrigger que estava faltando
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ButtonGlitchBrightness } from '@/components/ui/ButtonGlitch';
import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces
interface Compromisso {
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

// Componente principal
export default function AgendaPage() {
  // Estado para compromissos
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroData, setFiltroData] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ texto: '', erro: false });
  
  // Estado para novo compromisso
  const [novoCompromisso, setNovoCompromisso] = useState<Omit<Compromisso, 'id' | 'concluido'>>({
    titulo: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    hora: '',
    tipo: 'reuniao',
    participantes: '',
    local: '',
    descricao: ''
  });
  
  // Estado para edição de compromisso
  const [compromissoEditando, setCompromissoEditando] = useState<Compromisso | null>(null);
  
  // Tipos de compromissos disponíveis
  const tiposCompromisso = [
    { valor: 'reuniao', label: 'Reunião' },
    { valor: 'entrevista', label: 'Entrevista' },
    { valor: 'evento', label: 'Evento' },
    { valor: 'prazo', label: 'Prazo de entrega' },
    { valor: 'outro', label: 'Outro' }
  ];
  
  // Carregar compromissos do localStorage ao iniciar
  useEffect(() => {
    const compromissosSalvos = localStorage.getItem('compromissos');
    if (compromissosSalvos) {
      try {
        setCompromissos(JSON.parse(compromissosSalvos));
      } catch (error) {
        console.error('Erro ao carregar compromissos do localStorage:', error);
        setStatusMessage({
          texto: 'Erro ao carregar compromissos salvos',
          erro: true
        });
      }
    }
    setIsLoading(false);
  }, []);
  
  // Salvar compromissos no localStorage sempre que forem atualizados
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('compromissos', JSON.stringify(compromissos));
    }
  }, [compromissos, isLoading]);
  
  // Limpar mensagem de status após alguns segundos
  useEffect(() => {
    if (statusMessage.texto) {
      const timer = setTimeout(() => {
        setStatusMessage({ texto: '', erro: false });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);
  
  // Funções para gerenciar compromissos
  const adicionarCompromisso = () => {
    // Validar campos obrigatórios
    if (!novoCompromisso.titulo || !novoCompromisso.data || !novoCompromisso.hora) {
      setStatusMessage({
        texto: 'Preencha os campos obrigatórios: título, data e hora',
        erro: true
      });
      return;
    }
    
    // Validar formato da data
    const dataValida = isValid(parse(novoCompromisso.data, 'yyyy-MM-dd', new Date()));
    if (!dataValida) {
      setStatusMessage({
        texto: 'Formato de data inválido',
        erro: true
      });
      return;
    }
    
    // Adicionar novo compromisso
    const novoItem: Compromisso = {
      ...novoCompromisso,
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      concluido: false
    };
    
    setCompromissos([...compromissos, novoItem]);
    
    // Limpar formulário e fechar diálogo
    setNovoCompromisso({
      titulo: '',
      data: format(new Date(), 'yyyy-MM-dd'),
      hora: '',
      tipo: 'reuniao',
      participantes: '',
      local: '',
      descricao: ''
    });
    
    setIsAddDialogOpen(false);
    setStatusMessage({
      texto: 'Compromisso adicionado com sucesso',
      erro: false
    });
  };
  
  const excluirCompromisso = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este compromisso?')) {
      setCompromissos(compromissos.filter(comp => comp.id !== id));
      setStatusMessage({
        texto: 'Compromisso excluído com sucesso',
        erro: false
      });
    }
  };
  
  const iniciarEdicao = (compromisso: Compromisso) => {
    setCompromissoEditando(compromisso);
    setIsEditDialogOpen(true);
  };
  
  const salvarEdicao = () => {
    if (!compromissoEditando) return;
    
    // Validar campos obrigatórios
    if (!compromissoEditando.titulo || !compromissoEditando.data || !compromissoEditando.hora) {
      setStatusMessage({
        texto: 'Preencha os campos obrigatórios: título, data e hora',
        erro: true
      });
      return;
    }
    
    // Validar formato da data
    const dataValida = isValid(parse(compromissoEditando.data, 'yyyy-MM-dd', new Date()));
    if (!dataValida) {
      setStatusMessage({
        texto: 'Formato de data inválido',
        erro: true
      });
      return;
    }
    
    // Atualizar compromisso na lista
    setCompromissos(compromissos.map(comp => 
      comp.id === compromissoEditando.id ? compromissoEditando : comp
    ));
    
    setIsEditDialogOpen(false);
    setCompromissoEditando(null);
    setStatusMessage({
      texto: 'Compromisso atualizado com sucesso',
      erro: false
    });
  };
  
  const alternarStatus = (id: string) => {
    setCompromissos(compromissos.map(comp => 
      comp.id === id ? { ...comp, concluido: !comp.concluido } : comp
    ));
  };
  
  // Filtrar compromissos
  const compromissosFiltrados = compromissos.filter(comp => {
    // Filtro por termo de busca (título, local ou participantes)
    const matchesTermo = 
      !searchTerm ||
      comp.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.participantes.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por tipo
    const matchesTipo = 
      filtroTipo === 'todos' || comp.tipo === filtroTipo;
    
    // Filtro por data
    const matchesData = 
      !filtroData || comp.data === filtroData;
    
    return matchesTermo && matchesTipo && matchesData;
  });
  
  // Ordenar compromissos por data e hora
  const compromissosOrdenados = [...compromissosFiltrados].sort((a, b) => {
    // Comparar datas
    const dataA = new Date(a.data + 'T' + a.hora);
    const dataB = new Date(b.data + 'T' + b.hora);
    return dataA.getTime() - dataB.getTime();
  });
  
  // Formatação de data para exibição
  const formatarData = (dataStr: string) => {
    try {
      return format(parse(dataStr, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dataStr;
    }
  };
  
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Mensagem de status */}
      <AnimatePresence>
        {statusMessage.texto && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-md ${
              statusMessage.erro ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
          >
            {statusMessage.erro ? <AlertCircle className="inline mr-2 h-4 w-4" /> : <Check className="inline mr-2 h-4 w-4" />}
            {statusMessage.texto}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Agenda Administrativa</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie seus compromissos e eventos</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <ButtonGlitchBrightness
              text="Novo Compromisso"
              className="bg-black hover:bg-gray-800 dark:bg-blue-500/80"
            />
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Compromisso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="titulo" className="block text-sm font-medium">Título*</label>
                <Input
                  id="titulo"
                  value={novoCompromisso.titulo}
                  onChange={(e) => setNovoCompromisso({...novoCompromisso, titulo: e.target.value})}
                  placeholder="Digite o título do compromisso"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="data" className="block text-sm font-medium">Data*</label>
                  <Input
                    id="data"
                    type="date"
                    value={novoCompromisso.data}
                    onChange={(e) => setNovoCompromisso({...novoCompromisso, data: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="hora" className="block text-sm font-medium">Hora*</label>
                  <Input
                    id="hora"
                    type="time"
                    value={novoCompromisso.hora}
                    onChange={(e) => setNovoCompromisso({...novoCompromisso, hora: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="tipo" className="block text-sm font-medium">Tipo</label>
                <Select
                  value={novoCompromisso.tipo}
                  onValueChange={(valor) => setNovoCompromisso({...novoCompromisso, tipo: valor})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposCompromisso.map((tipo) => (
                      <SelectItem key={tipo.valor} value={tipo.valor}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="participantes" className="block text-sm font-medium">Participantes</label>
                <Input
                  id="participantes"
                  value={novoCompromisso.participantes}
                  onChange={(e) => setNovoCompromisso({...novoCompromisso, participantes: e.target.value})}
                  placeholder="Nome dos participantes"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="local" className="block text-sm font-medium">Local</label>
                <Input
                  id="local"
                  value={novoCompromisso.local}
                  onChange={(e) => setNovoCompromisso({...novoCompromisso, local: e.target.value})}
                  placeholder="Local do compromisso"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="descricao" className="block text-sm font-medium">Descrição</label>
                <Input
                  id="descricao"
                  value={novoCompromisso.descricao}
                  onChange={(e) => setNovoCompromisso({...novoCompromisso, descricao: e.target.value})}
                  placeholder="Descrição do compromisso"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <ButtonGlitchBrightness
                  text="Adicionar Compromisso"
                  onClick={adicionarCompromisso}
                  className="px-4 py-2"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar compromissos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select
          value={filtroTipo}
          onValueChange={setFiltroTipo}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {tiposCompromisso.map((tipo) => (
              <SelectItem key={tipo.valor} value={tipo.valor}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex items-center space-x-2">
          <Input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            className="flex-1"
            placeholder="Filtrar por data"
          />
          {filtroData && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setFiltroData('')}
              className="h-10 w-10"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Lista de Compromissos */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : compromissosOrdenados.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-8 text-center"
        >
          <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Nenhum compromisso encontrado</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchTerm || filtroTipo !== 'todos' || filtroData
              ? 'Nenhum compromisso corresponde aos filtros atuais.'
              : 'Adicione seu primeiro compromisso clicando no botão "Novo Compromisso".'}
          </p>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="mt-4"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Compromisso
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <AnimatePresence>
            {compromissosOrdenados.map((compromisso, index) => (
              <motion.div
                key={compromisso.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border-l-4 ${
                  compromisso.concluido 
                    ? 'border-green-500 dark:border-green-600' 
                    : new Date(`${compromisso.data}T${compromisso.hora}`) < new Date() 
                      ? 'border-red-500 dark:border-red-600'
                      : 'border-blue-500 dark:border-blue-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={`text-lg font-medium ${
                      compromisso.concluido ? 'text-gray-500 line-through dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {compromisso.titulo}
                    </h3>
                    
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatarData(compromisso.data)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="mr-2 h-4 w-4" />
                        {compromisso.hora}
                      </div>
                      
                      {compromisso.local && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 col-span-2">
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {compromisso.local}
                        </div>
                      )}
                    </div>
                    
                    {compromisso.descricao && (
                      <p className={`mt-2 text-sm ${
                        compromisso.concluido ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {compromisso.descricao}
                      </p>
                    )}
                    
                    {compromisso.participantes && (
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {compromisso.participantes}
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        {
                          'reuniao': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                          'entrevista': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
                          'evento': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
                          'prazo': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                          'outro': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }[compromisso.tipo]
                      }`}>
                        {tiposCompromisso.find(t => t.valor === compromisso.tipo)?.label || 'Outro'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => alternarStatus(compromisso.id)}
                      className={`p-1.5 rounded-full ${
                        compromisso.concluido
                          ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}
                    >
                      <Check size={16} />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => iniciarEdicao(compromisso)}
                      className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      <Edit size={16} />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => excluirCompromisso(compromisso.id)}
                      className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      
      {/* Diálogo de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Compromisso</DialogTitle>
          </DialogHeader>
          {compromissoEditando && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-titulo" className="block text-sm font-medium">Título*</label>
                <Input
                  id="edit-titulo"
                  value={compromissoEditando.titulo}
                  onChange={(e) => setCompromissoEditando({...compromissoEditando, titulo: e.target.value})}
                  placeholder="Digite o título do compromisso"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-data" className="block text-sm font-medium">Data*</label>
                  <Input
                    id="edit-data"
                    type="date"
                    value={compromissoEditando.data}
                    onChange={(e) => setCompromissoEditando({...compromissoEditando, data: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-hora" className="block text-sm font-medium">Hora*</label>
                  <Input
                    id="edit-hora"
                    type="time"
                    value={compromissoEditando.hora}
                    onChange={(e) => setCompromissoEditando({...compromissoEditando, hora: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-tipo" className="block text-sm font-medium">Tipo</label>
                <Select
                  value={compromissoEditando.tipo}
                  onValueChange={(valor) => setCompromissoEditando({...compromissoEditando, tipo: valor})}
                >
                  <SelectTrigger id="edit-tipo">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposCompromisso.map((tipo) => (
                      <SelectItem key={tipo.valor} value={tipo.valor}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-participantes" className="block text-sm font-medium">Participantes</label>
                <Input
                  id="edit-participantes"
                  value={compromissoEditando.participantes}
                  onChange={(e) => setCompromissoEditando({...compromissoEditando, participantes: e.target.value})}
                  placeholder="Nome dos participantes"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-local" className="block text-sm font-medium">Local</label>
                <Input
                  id="edit-local"
                  value={compromissoEditando.local}
                  onChange={(e) => setCompromissoEditando({...compromissoEditando, local: e.target.value})}
                  placeholder="Local do compromisso"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-descricao" className="block text-sm font-medium">Descrição</label>
                <Input
                  id="edit-descricao"
                  value={compromissoEditando.descricao}
                  onChange={(e) => setCompromissoEditando({...compromissoEditando, descricao: e.target.value})}
                  placeholder="Descrição do compromisso"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setCompromissoEditando(null);
                }}>
                  Cancelar
                </Button>
                <ButtonGlitchBrightness
                  text="Salvar Alterações"
                  onClick={salvarEdicao}
                  className="px-4 py-2"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}