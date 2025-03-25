'use client'

import { useState, useEffect, useRef } from 'react'
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
  Eye,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

// Dados de exemplo para tipos de documentos
const documentTypes = [
  { id: 1, name: "Contrato de Trabalho", icon: Briefcase },
  { id: 2, name: "Atestado Médico", icon: Heart },
  { id: 3, name: "Documento de Admissão", icon: UserPlus },
  { id: 4, name: "Documento de Demissão", icon: UserMinus },
  { id: 5, name: "Certificado", icon: FileText },
  { id: 6, name: "Outros", icon: FileText }
]

// Interface para modelo de documento da API
interface ApiDocumentTemplate {
  _id: string;
  name: string;
  type: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  format: string;
  filePath?: string;
}

// Interface para modelo de documento formatado
interface DocumentTemplate {
  _id: string;
  name: string;
  type: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  format: string;
  filePath?: string;
}

export default function ModelosDocumentosPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("Todos")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estados para novo modelo
  const [newModelName, setNewModelName] = useState("")
  const [newModelType, setNewModelType] = useState("Contrato de Trabalho")
  const [newModelDescription, setNewModelDescription] = useState("")
  const [newModelFile, setNewModelFile] = useState<File | null>(null)
  const [selectedFileName, setSelectedFileName] = useState("")
  
  // Carregar modelos ao iniciar
  useEffect(() => {
    fetchTemplates()
  }, [])

  // Mostrar mensagem de sucesso apenas por um tempo limitado
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Mostrar mensagem de erro apenas por um tempo limitado
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Buscar modelos da API
  const fetchTemplates = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/document-models')
      // Formatar as datas para o formato brasileiro
      const formattedTemplates = response.data.map((template: ApiDocumentTemplate) => ({
        ...template,
        createdAt: new Date(template.createdAt).toLocaleDateString('pt-BR'),
        updatedAt: new Date(template.updatedAt).toLocaleDateString('pt-BR')
      }))
      setTemplates(formattedTemplates)
    } catch (error) {
      console.error('Erro ao buscar modelos:', error)
      setError("Não foi possível carregar os modelos de documentos.")
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar modelos com base nos filtros
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
  
  // Função para visualizar um modelo
  const handleViewTemplate = async (template: DocumentTemplate) => {
    if (!template.filePath) {
      setError("Este modelo não possui arquivo para visualização.")
      return
    }

    // Abrir o arquivo em uma nova aba
    window.open(`/api/document-models/download/${template._id}`, '_blank')
  }
  
  // Função para fazer download de um modelo
  const handleDownloadTemplate = async (template: DocumentTemplate) => {
    try {
      // Usar a API de download
      window.location.href = `/api/document-models/download/${template._id}`
    } catch (error) {
      console.error('Erro ao baixar modelo:', error)
      setError("Não foi possível baixar o modelo.")
    }
  }
  
  // Função para duplicar um modelo
  const handleDuplicateTemplate = async (template: DocumentTemplate) => {
    try {
      const response = await axios.post(`/api/document-models/duplicate/${template._id}`)
      
      // Adicionar o novo modelo à lista
      const newTemplate = {
        ...response.data,
        createdAt: new Date(response.data.createdAt).toLocaleDateString('pt-BR'),
        updatedAt: new Date(response.data.updatedAt).toLocaleDateString('pt-BR')
      }
      
      setTemplates([...templates, newTemplate])
      setSuccess(`Modelo "${template.name}" duplicado com sucesso.`)
    } catch (error) {
      console.error('Erro ao duplicar modelo:', error)
      setError("Não foi possível duplicar o modelo.")
    }
  }
  
  // Função para excluir um modelo
  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este modelo?")) {
      try {
        await axios.delete(`/api/document-models/${templateId}`)
        setTemplates(templates.filter(t => t._id !== templateId))
        setSuccess("Modelo excluído com sucesso.")
      } catch (error) {
        console.error('Erro ao excluir modelo:', error)
        setError("Não foi possível excluir o modelo.")
      }
    }
  }
  
  // Função para criar um novo modelo
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newModelName || !newModelType || !newModelDescription || !newModelFile) {
      setError("Por favor, preencha todos os campos.")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Criar um FormData para enviar o arquivo
      const formData = new FormData()
      formData.append('name', newModelName)
      formData.append('type', newModelType)
      formData.append('description', newModelDescription)
      formData.append('file', newModelFile)
      
      // Enviar para a API
      const response = await axios.post('/api/document-models', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Adicionar o novo modelo à lista
      const newTemplate = {
        ...response.data,
        createdAt: new Date(response.data.createdAt).toLocaleDateString('pt-BR'),
        updatedAt: new Date(response.data.updatedAt).toLocaleDateString('pt-BR')
      }
      
      setTemplates([...templates, newTemplate])
      
      // Limpar formulário
      setNewModelName("")
      setNewModelType("Contrato de Trabalho")
      setNewModelDescription("")
      setNewModelFile(null)
      setSelectedFileName("")
      
      // Fechar diálogo
      setIsDialogOpen(false)
      
      setSuccess("Modelo criado com sucesso!")
    } catch (error) {
      console.error('Erro ao criar modelo:', error)
      setError("Não foi possível criar o modelo.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Manipulador para seleção de arquivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setNewModelFile(file)
      setSelectedFileName(file.name)
    }
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
  
  // Abrir o seletor de arquivo
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Mensagens de feedback */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

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
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando modelos...</span>
            </div>
          ) : filteredTemplates.length > 0 ? (
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
                  <TableRow key={template._id}>
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
                            <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                              <Copy className="mr-2 h-4 w-4" /> Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteTemplate(template._id)}
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
      
      {/* Diálogo para criar novo modelo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Modelo de Documento</DialogTitle>
            <DialogDescription>
              Crie um novo modelo para uso nos documentos da empresa
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateTemplate} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Modelo</label>
              <Input 
                placeholder="Ex: Contrato de Trabalho Padrão" 
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Documento</label>
              <Select 
                value={newModelType} 
                onValueChange={setNewModelType}
              >
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
                value={newModelDescription}
                onChange={(e) => setNewModelDescription(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Arquivo de Modelo</label>
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                onClick={triggerFileInput}
              >
                {selectedFileName ? (
                  <>
                    <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm font-medium">{selectedFileName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Clique para mudar o arquivo
                    </p>
                  </>
                ) : (
                  <>
                    <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-muted-foreground">
                      Arraste um arquivo ou clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Formatos suportados: DOCX, PDF (max. 5MB)
                    </p>
                  </>
                )}
                <Input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef}
                  accept=".docx,.pdf"
                  onChange={handleFileSelect}
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Modelo'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
        </Dialog>
      </div>
    )
  }