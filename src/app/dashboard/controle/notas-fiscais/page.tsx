"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Download, Eye, Trash2, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,   
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Invoice {
  _id: string;
  number: string;
  serie: string;
  type: 'entrada' | 'saida';
  date: Date;
  totalValue: number;
  supplier?: string;
  status: 'pendente' | 'processado' | 'cancelado';
  filePath?: string;
}

interface FilterState {
  search: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Estado para filtros
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });

  const [newInvoice, setNewInvoice] = useState({
    number: '',
    serie: '',
    type: 'entrada',
    date: '',
    totalValue: '',
    supplier: '',
    status: 'pendente',
    file: null as File | null
  });

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Buscar notas fiscais
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Erro ao buscar notas fiscais:', error);
      setError('Falha ao carregar as notas fiscais');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let result = [...invoices];

    // Filtrar por texto (número, série, fornecedor)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(invoice => 
        invoice.number.toLowerCase().includes(searchLower) ||
        invoice.serie.toLowerCase().includes(searchLower) ||
        (invoice.supplier && invoice.supplier.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por tipo
    if (filters.type !== 'all') {
      result = result.filter(invoice => invoice.type === filters.type);
    }

    // Filtrar por status
    if (filters.status !== 'all') {
      result = result.filter(invoice => invoice.status === filters.status);
    }

    // Filtrar por data inicial
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      result = result.filter(invoice => new Date(invoice.date) >= startDate);
    }

    // Filtrar por data final
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Final do dia
      result = result.filter(invoice => new Date(invoice.date) <= endDate);
    }

    // Ordenar por data (mais recentes primeiro)
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredInvoices(result);
    setCurrentPage(1);
  }, [invoices, filters]);

  // Manipular upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setNewInvoice(prev => ({ ...prev, file }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsUploading(true);
    setError(null);

    // Validações
    if (!newInvoice.number || !newInvoice.serie || !newInvoice.date || !newInvoice.totalValue) {
      setError('Preencha todos os campos obrigatórios');
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('number', newInvoice.number);
    formData.append('serie', newInvoice.serie);
    formData.append('type', newInvoice.type);
    formData.append('date', newInvoice.date);
    formData.append('totalValue', newInvoice.totalValue);
    formData.append('supplier', newInvoice.supplier);
    formData.append('status', newInvoice.status);
    
    if (newInvoice.file) {
      formData.append('file', newInvoice.file);
    }

    try {
      await axios.post('/api/invoices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Limpar formulário e atualizar lista
      setNewInvoice({
        number: '',
        serie: '',
        type: 'entrada',
        date: '',
        totalValue: '',
        supplier: '',
        status: 'pendente',
        file: null
      });
      
      setSuccess('Nota fiscal adicionada com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      
      setOpenUploadDialog(false);
      fetchInvoices();
    } catch (error) {
      console.error('Erro no upload:', error);
      setError('Falha ao fazer upload da nota fiscal');
    } finally {
      setIsUploading(false);
    }
  };

  // Baixar ou visualizar arquivo
  const handleDownload = async (invoice: Invoice) => {
    if (!invoice.filePath) return;
    
    try {
      const response = await axios.get(`/api/invoices/download/${invoice._id}`, {
        responseType: 'blob'
      });

      // Criar link de download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nota_fiscal_${invoice.number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      setError('Erro ao baixar o arquivo');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Deletar nota fiscal
  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta nota fiscal?')) return;

    try {
      await axios.delete(`/api/invoices/${id}`);
      setSuccess('Nota fiscal excluída com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      fetchInvoices();
    } catch (error) {
      console.error('Erro ao deletar nota fiscal:', error);
      setError('Erro ao excluir a nota fiscal');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Formatação de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'processado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatação de status para exibição
  const formatStatus = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'processado': return 'Processado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  // Paginação
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const currentInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calcular totais
  const totalCount = filteredInvoices.length;
  const totalValue = filteredInvoices.reduce((sum, inv) => sum + inv.totalValue, 0);
  const totalEntrada = filteredInvoices
    .filter(inv => inv.type === 'entrada')
    .reduce((sum, inv) => sum + inv.totalValue, 0);
  const totalSaida = filteredInvoices
    .filter(inv => inv.type === 'saida')
    .reduce((sum, inv) => sum + inv.totalValue, 0);

  // Create state for selected invoice
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // View PDF document dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Function to handle viewing an invoice
  const handleViewInvoice = (invoice: Invoice) => {
    if (!invoice.filePath) return;
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  return (
    <div className="p-2 md:p-4 lg:p-6 w-full max-w-full mx-auto bg-white dark:bg-gray-900 dark:text-white rounded-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Notas Fiscais</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerenciamento de documentos fiscais
          </p>
        </div>
        
        {/* Botão de Upload */}
        <Button 
          variant="default" 
          onClick={() => setOpenUploadDialog(true)}
          className="md:self-end"
        >
          <Upload className="mr-2 h-4 w-4" /> Nova Nota Fiscal
        </Button>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700">
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-md mb-4 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-700">
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm text-gray-500">Total de Notas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm text-gray-500">Valor Total</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">
              {totalValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm text-gray-500">Total Entradas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">
              {totalEntrada.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm text-gray-500">Total Saídas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-600">
              {totalSaida.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row gap-2 mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por número ou fornecedor..."
            className="pl-9 h-9"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters({ ...filters, type: value })}
          >
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="processado">Processado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          {/* Ajuste nos campos de data */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="date"
              className="h-9 w-[150px]"
              placeholder="Data inicial"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
            <Input
              type="date"
              className="h-9 w-[150px]"
              placeholder="Data final"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() =>
              setFilters({
                search: '',
                type: 'all',
                status: 'all',
                startDate: '',
                endDate: '',
              })
            }
          >
            Limpar
          </Button>
        </div>
      </div>

      {/* Tabela de Notas Fiscais */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Série
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      <span className="mt-2 text-sm text-gray-500">Carregando notas fiscais...</span>
                    </div>
                  </td>
                </tr>
              ) : currentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 text-gray-400 mb-2" />
                      <span className="text-gray-500">Nenhuma nota fiscal encontrada</span>
                      {Object.values(filters).some(v => v !== '' && v !== 'all') && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setFilters({
                            search: '',
                            type: 'all',
                            status: 'all',
                            startDate: '',
                            endDate: ''
                          })}
                          className="mt-2"
                        >
                          Limpar filtros
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentInvoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 whitespace-nowrap">
                      {invoice.number}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {invoice.serie}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium 
                        ${invoice.type === 'entrada' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }
                      `}>
                        {invoice.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap font-medium">
                      R$ {invoice.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {invoice.supplier || '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                        {formatStatus(invoice.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <div className="flex space-x-1 justify-end">
                        {invoice.filePath && (
                          <>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleDownload(invoice)}
                              title="Baixar Arquivo"
                              className="h-7 w-7"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleViewInvoice(invoice)}
                              className="h-7 w-7"
                              title="Visualizar"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleDelete(invoice._id)}
                          className="h-7 w-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Excluir"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col xs:flex-row justify-between items-center gap-2 mt-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Exibindo {Math.min(filteredInvoices.length, (currentPage - 1) * itemsPerPage + 1)} a {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} de {filteredInvoices.length} notas fiscais
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(curr => curr - 1)}
            >
              Anterior
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(curr => curr + 1)}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Visualizando Nota Fiscal {selectedInvoice?.number}
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-[70vh] bg-gray-100 rounded">
            {selectedInvoice && (
              <iframe
                src={`/api/invoices/download/${selectedInvoice._id}`}
                className="w-full h-full"
                title={`Nota Fiscal ${selectedInvoice.number}`}
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Fechar</Button>
            {selectedInvoice && (
              <Button variant="outline" onClick={() => handleDownload(selectedInvoice)}>
                <Download className="mr-2 h-4 w-4" /> Baixar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Upload */}
      <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Adicionar Nova Nota Fiscal
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Número da Nota*</label>
                <Input 
                  type="text" 
                  value={newInvoice.number}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, number: e.target.value }))}
                  className="h-9" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Série*</label>
                <Input 
                  type="text" 
                  value={newInvoice.serie}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, serie: e.target.value }))}
                  className="h-9" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Tipo de Nota*</label>
                <Select
                  value={newInvoice.type}
                  onValueChange={(value: 'entrada' | 'saida') => 
                    setNewInvoice(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Data*</label>
                <Input 
                  type="date" 
                  value={newInvoice.date}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, date: e.target.value }))}
                  className="h-9" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Valor Total*</label>
                <Input 
                  type="number" 
                  value={newInvoice.totalValue}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, totalValue: e.target.value }))}
                  className="h-9" 
                  step="0.01"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Fornecedor</label>
                <Input 
                  type="text" 
                  value={newInvoice.supplier}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, supplier: e.target.value }))}
                  className="h-9" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Status*</label>
              <Select
                value={newInvoice.status}
                onValueChange={(value: 'pendente' | 'processado' | 'cancelado') => 
                  setNewInvoice(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="processado">Processado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Arquivo da Nota Fiscal*</label>
              <div className="border border-dashed rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                <input 
                  type="file" 
                  onChange={handleFileUpload}
                  className="w-full text-sm"
                  accept=".pdf,.jpg,.jpeg,.png,.xml" 
                  required 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: PDF, JPG, PNG, XML (máx. 5MB)
                </p>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenUploadDialog(false)}
                className="h-9"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading}
                className="h-9"
              >
                {isUploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Enviando...
                  </>
                ) : (
                  'Adicionar Nota Fiscal'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}