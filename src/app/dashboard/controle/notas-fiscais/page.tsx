"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Download, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    number: '',
    serie: '',
    type: 'entrada',
    date: '',
    totalValue: '',
    supplier: '',
    file: null as File | null
  });

  // Buscar notas fiscais
  const fetchInvoices = async () => {
    try {
      const response = await axios.get('/api/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Erro ao buscar notas fiscais:', error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Manipular upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setNewInvoice(prev => ({ ...prev, file }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    formData.append('number', newInvoice.number);
    formData.append('serie', newInvoice.serie);
    formData.append('type', newInvoice.type);
    formData.append('date', newInvoice.date);
    formData.append('totalValue', newInvoice.totalValue);
    formData.append('supplier', newInvoice.supplier);
    
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
        file: null
      });
      
      fetchInvoices();
    } catch (error) {
      console.error('Erro no upload:', error);
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
    }
  };

  // Deletar nota fiscal
  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta nota fiscal?')) return;

    try {
      await axios.delete(`/api/invoices/${id}`);
      fetchInvoices();
    } catch (error) {
      console.error('Erro ao deletar nota fiscal:', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Notas Fiscais
      </h1>

      {/* Formulário de Upload */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="default" className="mb-6">
            <Upload className="mr-2 h-4 w-4" /> Nova Nota Fiscal
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Nota Fiscal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Número da Nota</label>
                <input 
                  type="text" 
                  value={newInvoice.number}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, number: e.target.value }))}
                  className="w-full border rounded p-2" 
                  required 
                />
              </div>
              <div>
                <label className="block mb-2">Série</label>
                <input 
                  type="text" 
                  value={newInvoice.serie}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, serie: e.target.value }))}
                  className="w-full border rounded p-2" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Tipo de Nota</label>
                <select 
                  value={newInvoice.type}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, type: e.target.value as 'entrada' | 'saida' }))}
                  className="w-full border rounded p-2"
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">Data</label>
                <input 
                  type="date" 
                  value={newInvoice.date}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border rounded p-2" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Valor Total</label>
                <input 
                  type="number" 
                  value={newInvoice.totalValue}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, totalValue: e.target.value }))}
                  className="w-full border rounded p-2" 
                  step="0.01"
                  required 
                />
              </div>
              <div>
                <label className="block mb-2">Fornecedor</label>
                <input 
                  type="text" 
                  value={newInvoice.supplier}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, supplier: e.target.value }))}
                  className="w-full border rounded p-2" 
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">Arquivo da Nota Fiscal</label>
              <input 
                type="file" 
                onChange={handleFileUpload}
                className="w-full border rounded p-2" 
                accept=".pdf,.jpg,.jpeg,.png,.xml" 
                required 
              />
            </div>

            <Button 
              type="submit" 
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? 'Enviando...' : 'Adicionar Nota Fiscal'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tabela de Notas Fiscais */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Série
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fornecedor
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {invoices.map((invoice) => (
              <tr key={invoice._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {invoice.number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {invoice.serie}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`
                    px-2 py-1 rounded text-xs font-medium 
                    ${invoice.type === 'entrada' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                    }
                  `}>
                    {invoice.type === 'entrada' ? 'Entrada' : 'Saída'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(invoice.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  R$ {invoice.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {invoice.supplier || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right flex space-x-2 justify-end">
                  {invoice.filePath && (
                    <>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleDownload(invoice)}
                        title="Baixar Arquivo"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => window.open(`/api/invoices/download/${invoice._id}`, '_blank')}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleDelete(invoice._id)}
                    className="text-red-500 hover:bg-red-50"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}