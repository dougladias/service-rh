'use client'

import { useState } from 'react'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table"
import { 
  Card, 
  CardContent
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle  
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  FileText,
  Briefcase,
  Heart,
  UserPlus,
  UserMinus,
  MoreVertical,
  Plus,
  Trash2,  
  Download,
  FilePlus2,
  Copy,
  Eye
} from 'lucide-react'
import Link from 'next/link'

// Dados de exemplo para tipos de documentos
const documentTypes = [
  { id: 1, name: "Contrato de Trabalho", icon: Briefcase },
  { id: 2, name: "Atestado Médico", icon: Heart },
  { id: 3, name: "Documento de Admissão", icon: UserPlus },
  { id: 4, name: "Documento de Demissão", icon: UserMinus },
  { id: 5, name: "Certificado", icon: FileText },
  { id: 6, name: "Outros", icon: FileText }
]

// Dados de exemplo para modelos de documentos
const documentTemplates = [
  { 
    id: 1, 
    name: "Contrato de Trabalho Padrão", 
    type: "Contrato de Trabalho",
    description: "Modelo padrão de contrato por tempo indeterminado",
    createdBy: "Admin",
    createdAt: "10/02/2025",
    updatedAt: "21/03/2025",
    format: "docx",
    variables: ["NOME_FUNCIONARIO", "CPF", "CARGO", "SALARIO", "DATA_ADMISSAO"]
  },
  { 
    id: 2, 
    name: "Contrato de Experiência", 
    type: "Contrato de Trabalho",
    description: "Modelo para contrato de experiência de 90 dias",
    createdBy: "Admin",
    createdAt: "12/02/2025",
    updatedAt: "12/02/2025",
    format: "docx",
    variables: ["NOME_FUNCIONARIO", "CPF", "CARGO", "SALARIO", "DATA_ADMISSAO", "DATA_TERMINO"]
  },
  { 
    id: 3, 
    name: "Termo de Rescisão", 
    type: "Documento de Demissão",
    description: "Modelo para rescisão de contrato sem justa causa",
    createdBy: "Maria RH",
    createdAt: "05/03/2025",
    updatedAt: "05/03/2025",
    format: "docx",
    variables: ["NOME_FUNCIONARIO", "CPF", "CARGO", "DATA_ADMISSAO", "DATA_DEMISSAO", "MOTIVO"]
  },
  { 
    id: 4, 
    name: "Ficha de Admissão", 
    type: "Documento de Admissão",
    description: "Formulário para registro de informações do novo funcionário",
    createdBy: "João RH",
    createdAt: "15/01/2025",
    updatedAt: "18/03/2025",
    format: "pdf",
    variables: ["NOME_FUNCIONARIO", "CPF", "RG", "DATA_NASCIMENTO", "ENDERECO", "TELEFONE", "EMAIL"]
  },
  { 
    id: 5, 
    name: "Declaração de Vale Transporte", 
    type: "Documento de Admissão",
    description: "Declaração de opção pelo benefício do vale transporte",
    createdBy: "Admin",
    createdAt: "20/01/2025",
    updatedAt: "20/01/2025",
    format: "docx",
    variables: ["NOME_FUNCIONARIO", "CPF", "VALOR_VT", "OPCAO"]
  }
]

export default function ModelosDocumentosPage() {
  const [templates, setTemplates] = useState(documentTemplates)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("Todos")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<{
    id: number;
    name: string;
    type: string;
    description: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    format: string;
    variables: string[];
  } | null>(null)
  const [isViewingVariables, setIsViewingVariables] = useState(false)
  
  // Filtra modelos com base nos filtros
  const filteredTemplates = templates.filter(template => {
    // Filtro por texto de busca
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por tipo
    const matchesType = 
      selectedType === "Todos" || template.type === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  // Função para simular a visualização de um modelo
  const handleViewTemplate = (template: { 
    id: number; 
    name: string; 
    type: string; 
    description: string; 
    createdBy: string; 
    createdAt: string; 
    updatedAt: string; 
    format: string; 
    variables: string[]; 
  }) => {
    alert(`Visualizando modelo: ${template.name}`);
  }
  
  // Função para simular o download de um modelo
  const handleDownloadTemplate = (template: { 
    id: number; 
    name: string; 
    type: string; 
    description: string; 
    createdBy: string; 
    createdAt: string; 
    updatedAt: string; 
    format: string; 
    variables: string[]; 
  }) => {
    alert(`Baixando modelo: ${template.name}`);
  }
  
  // Função para simular a duplicação de um modelo
  const handleDuplicateTemplate = (template: { 
    id: number; 
    name: string; 
    type: string; 
    description: string; 
    createdBy: string; 
    createdAt: string; 
    updatedAt: string; 
    format: string; 
    variables: string[]; 
  }) => {
    const newTemplate = {
      ...template,
      id: templates.length + 1,
      name: `${template.name} (Cópia)`,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      updatedAt: new Date().toLocaleDateString('pt-BR')
    };
    
    setTemplates([...templates, newTemplate]);
    alert(`Modelo duplicado: ${newTemplate.name}`);
  }
  
  // Função para simular a exclusão de um modelo
  const handleDeleteTemplate = (templateId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este modelo?")) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  }
  
  // Função para visualizar variáveis do modelo
  const handleViewVariables = (template: { 
    id: number; 
    name: string; 
    type: string; 
    description: string; 
    createdBy: string; 
    createdAt: string; 
    updatedAt: string; 
    format: string; 
    variables: string[]; 
  }) => {
    setSelectedTemplate(template);
    setIsViewingVariables(true);
  }
  
  // Obter ícone para tipo de documento
  const getTypeIcon = (typeName: string) => {
    const type = documentTypes.find(t => t.name === typeName);
    const Icon = type ? type.icon : FileText;
    return <Icon className="h-5 w-5" />;
  }
  
  // Obter ícone para formato de arquivo
  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-700" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/dashboard/documentos">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Modelos de Documentos</h1>
          <p className="text-muted-foreground">
            Gerencie os modelos de documentos da empresa
          </p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative w-full md:w-80">
            <Input
              type="search"
              placeholder="Buscar modelos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-60">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os tipos</SelectItem>
                {documentTypes.map(type => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <FilePlus2 className="mr-2 h-4 w-4" />
          Novo Modelo
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {filteredTemplates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Modelo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Criação</TableHead>
                  <TableHead>Atualização</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getFormatIcon(template.format)}
                        <span className="font-medium">{template.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(template.type)}
                        <span>{template.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{template.createdAt}</div>
                        <div className="text-muted-foreground text-xs">{template.createdBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>{template.updatedAt}</TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewTemplate(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDownloadTemplate(template)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewTemplate(template)}>
                              <Eye className="mr-2 h-4 w-4" /> Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadTemplate(template)}>
                              <Download className="mr-2 h-4 w-4" /> Baixar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewVariables(template)}>
                              <FileText className="mr-2 h-4 w-4" /> Ver Variáveis
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                              <Copy className="mr-2 h-4 w-4" /> Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">Nenhum modelo encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-2">
                Não foi possível encontrar modelos correspondentes aos filtros aplicados. 
                Tente ajustar seus critérios de busca ou crie um novo modelo.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                <FilePlus2 className="mr-2 h-4 w-4" />
                Criar novo modelo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Diálogo para criar novo modelo - Simplificado */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Modelo de Documento</DialogTitle>
            <DialogDescription>
              Crie um novo modelo para uso nos documentos da empresa
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Modelo</label>
              <Input placeholder="Ex: Contrato de Trabalho Padrão" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Documento</label>
              <Select defaultValue="Contrato de Trabalho">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea 
                placeholder="Descreva a finalidade deste modelo..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Arquivo de Modelo</label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50">
                <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-muted-foreground">
                  Arraste um arquivo ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos suportados: DOCX, PDF (max. 5MB)
                </p>
                <Input 
                  type="file" 
                  className="hidden" 
                  accept=".docx,.pdf"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              alert("Modelo criado com sucesso!");
              setIsDialogOpen(false);
            }}>
              Criar Modelo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para visualizar variáveis */}
      <Dialog open={isViewingVariables} onOpenChange={setIsViewingVariables}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Variáveis do Modelo</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm mb-4">
              Este modelo utiliza as seguintes variáveis que serão substituídas pelos dados do funcionário:
            </p>
            
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variável</TableHead>
                    <TableHead>Exemplo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTemplate?.variables.map((variable: string) => (
                    <TableRow key={variable}>
                      <TableCell className="font-mono text-sm">
                        {`{{${variable}}}`}
                      </TableCell>
                      <TableCell>
                        {variable === 'NOME_FUNCIONARIO' ? 'João da Silva' :
                         variable === 'CPF' ? '123.456.789-00' :
                         variable === 'CARGO' ? 'Analista de TI' :
                         variable === 'SALARIO' ? 'R$ 5.000,00' :
                         variable === 'DATA_ADMISSAO' ? '01/04/2025' :
                         variable === 'DATA_TERMINO' ? '30/06/2025' :
                         variable === 'DATA_DEMISSAO' ? '15/04/2025' :
                         variable === 'MOTIVO' ? 'Sem justa causa' :
                         variable === 'RG' ? '12.345.678-9' :
                         variable === 'DATA_NASCIMENTO' ? '01/01/1990' :
                         variable === 'ENDERECO' ? 'Rua Exemplo, 123' :
                         variable === 'TELEFONE' ? '(11) 91234-5678' :
                         variable === 'EMAIL' ? 'email@exemplo.com' :
                         variable === 'VALOR_VT' ? 'R$ 220,00' :
                         variable === 'OPCAO' ? 'Aceito' :
                         'Exemplo não disponível'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsViewingVariables(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}