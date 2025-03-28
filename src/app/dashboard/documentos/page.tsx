'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
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
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip"
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,  
  MoreVertical,
  File,
  FileImage,  
  FileArchive,
  Eye,
  Clock,
  Calendar,  
  Briefcase,
  Heart,
  UserPlus,
  UserMinus  
} from 'lucide-react'

// Interface para o documento
interface Document {
  _id: string;
  name: string;
  type: string;
  employee: string;
  employeeId: string;
  department: string;
  uploadDate: string;
  expiryDate: string;
  size: string;
  fileType: string;
  path: string;
  tags: string[];
}

// Interface para funcionário
interface Employee {
  _id: string;
  name: string;
  department?: string;
}

// Lista de tipos de documentos
const documentTypes = [
  { id: 1, label: "Contrato de Trabalho", icon: Briefcase },
  { id: 2, label: "Atestado Médico", icon: Heart },
  { id: 3, label: "Documento de Admissão", icon: UserPlus },
  { id: 4, label: "Documento de Demissão", icon: UserMinus },
  { id: 5, label: "Certificado", icon: FileText },
  { id: 6, label: "Outros", icon: File }
]

// Departamentos
const departments = [
  "Todos",
  "TI",
  "Marketing",
  "Financeiro",
  "Vendas",
  "RH",
  "Administrativo"
]

export default function DocumentosPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [activeTab, setActiveTab] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("Todos")
  const [selectedDepartment, setSelectedDepartment] = useState("Todos")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [newDocument, setNewDocument] = useState({
    name: "",
    type: "",
    employee: "",
    employeeId: "",
    department: "",
    expiryDate: "",
    tags: ""
  })
  
  // Carregar funcionários e documentos
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('/api/workers');
        setEmployees(response.data);
      } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
        setError('Falha ao carregar funcionários');
      }
    };

    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/documents');
        setDocuments(response.data);
      } catch (error) {
        console.error('Erro ao buscar documentos:', error);
        setError('Falha ao carregar documentos');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
    fetchDocuments();
  }, []);
  
  // Filtra documentos com base nos filtros
  const filteredDocuments = documents.filter(doc => {
    // Filtro por texto de busca
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro por tipo na aba atual
    const matchesTab = 
      activeTab === "todos" || 
      (activeTab === "contratos" && doc.type === "Contrato de Trabalho") ||
      (activeTab === "atestados" && doc.type === "Atestado Médico") ||
      (activeTab === "admissao" && doc.type === "Documento de Admissão") ||
      (activeTab === "demissao" && doc.type === "Documento de Demissão");
    
    // Filtro por tipo selecionado
    const matchesType = 
      selectedType === "Todos" || doc.type === selectedType;
    
    // Filtro por departamento
    const matchesDept = 
      selectedDepartment === "Todos" || doc.department === selectedDepartment;
    
    return matchesSearch && matchesTab && matchesType && matchesDept;
  });
  
  // Função para obter o ícone do tipo de arquivo
  const getFileIcon = (fileType: string) => {
    switch(fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'jpg':
      case 'png':
      case 'jpeg':
        return <FileImage className="h-5 w-5 text-blue-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-700" />;
      case 'zip':
      case 'rar':
        return <FileArchive className="h-5 w-5 text-yellow-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  }
  
  // Função para obter o ícone do tipo de documento
  const getDocTypeIcon = (docType: string) => {
    const type = documentTypes.find(t => t.label === docType);
    return type ? type.icon : File;
  }
  
  // Função para visualizar documento
  const handleViewDocument = (doc: Document) => {
    try {
      console.log('Visualizando documento:', doc._id);
      // Use a API de download em vez do caminho direto
      window.open(`/api/documents/download/${doc._id}`, '_blank');
    } catch (error) {
      console.error('Erro ao visualizar documento:', error);
      setError('Não foi possível visualizar o documento.');
    }
  };
  
  // Função para baixar documento
  const handleDownloadDocument = (doc: Document) => {
    try {
      console.log('Baixando documento:', doc._id);
      // Use a API de download com parâmetro para forçar o download
      window.open(`/api/documents/download/${doc._id}?download=true`, '_blank');
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      setError('Não foi possível baixar o documento.');
    }
  };
  
  // Função para excluir documento
  const handleDeleteDocument = async (docId: string) => {
    console.log('ID do documento:', docId);
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;
  
    try {
      await axios.delete(`/api/documents/${docId}`);
      setDocuments(documents.filter(doc => doc._id !== docId));
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      setError('Falha ao excluir o documento.');
    }
  }
  
  // Função para fazer upload de novo documento
  const handleUploadDocument = async () => {
    if (!selectedFile || !newDocument.type || !newDocument.employeeId) {
      setError('Por favor, preencha todos os campos obrigatórios e selecione um arquivo.');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', newDocument.type);
      formData.append('employeeId', newDocument.employeeId);
      formData.append('department', newDocument.department);
      formData.append('expiryDate', newDocument.expiryDate);
      formData.append('tags', newDocument.tags);
      
      const response = await axios.post('/api/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setDocuments([...documents, response.data]);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setNewDocument({
        name: "",
        type: "",
        employee: "",
        employeeId: "",
        department: "",
        expiryDate: "",
        tags: ""
      });
      
      alert('Documento enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      setError('Falha ao enviar o documento. Por favor, tente novamente.');
    } finally {
      setUploading(false);
    }
  }
  
  // Atualiza os campos quando o funcionário é selecionado
  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp._id === employeeId);
    if (employee) {
      setNewDocument({
        ...newDocument,
        employeeId,
        employee: employee.name,
        department: employee.department || ""
      });
    }
  }
  
  // Formatação de tamanho de arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
          <button 
            className="absolute top-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span>&times;</span>
          </button>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Documentos</h1>
          <p className="text-muted-foreground">
            Armazene e gerencie documentos importantes da empresa
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Enviar Documento
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="atestados">Atestados</TabsTrigger>
          <TabsTrigger value="admissao">Admissão</TabsTrigger>
          <TabsTrigger value="demissao">Demissão</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar documentos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-72">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos os tipos</SelectItem>
                    {documentTypes.map(type => (
                      <SelectItem key={`type-${type.id}`} value={type.label}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-64">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept, index) => (
                      <SelectItem key={`dept-${index}`} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin h-8 w-8 border-4 border-cyan-500 rounded-full border-t-transparent"></div>
                </div>
              ) : filteredDocuments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Funcionário</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data de Envio</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => {
                      const DocTypeIcon = getDocTypeIcon(doc.type);
                      
                      return (
                        <TableRow key={doc._id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getFileIcon(doc.fileType)}
                              <span className="font-medium">{doc.name}</span>
                            </div>
                            <div className="flex mt-1 space-x-1">
                              {doc.tags && doc.tags.map((tag, tagIndex) => (
                                <span 
                                  key={`tag-${doc._id}-${tagIndex}`}
                                  className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {formatFileSize(parseInt(doc.size))}
                            </div>
                          </TableCell>
                          <TableCell>{doc.employee}</TableCell>
                          <TableCell>{doc.department}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <DocTypeIcon className="h-4 w-4" />
                              <span>{doc.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{doc.uploadDate}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{doc.expiryDate}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center space-x-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleViewDocument(doc)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Visualizar</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleDownloadDocument(doc)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Baixar</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleViewDocument(doc)}>
                                    <Eye className="mr-2 h-4 w-4" /> Visualizar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownloadDocument(doc)}>
                                    <Download className="mr-2 h-4 w-4" /> Baixar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteDocument(doc._id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">Nenhum documento encontrado</h3>
                  <p className="text-sm text-muted-foreground max-w-md mt-2">
                    Não foi possível encontrar documentos correspondentes aos filtros aplicados. 
                    Tente ajustar seus critérios de busca ou faça upload de novos documentos.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar novo documento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo para upload de documento */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Novo Documento</DialogTitle>
            <DialogDescription>
              Preencha as informações e selecione o arquivo para upload
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="file" className="text-sm font-medium">Arquivo</label>
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                onClick={() => document.getElementById('file')?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-muted-foreground">
                  {selectedFile 
                    ? selectedFile.name 
                    : "Arraste um arquivo ou clique para selecionar"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos suportados: PDF, DOCX, JPG, PNG (max. 10MB)
                </p>
                <Input 
                  id="file" 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="doc-type" className="text-sm font-medium">Tipo de Documento</label>
              <Select
                value={newDocument.type}
                onValueChange={(value) => setNewDocument({...newDocument, type: value})}
              >
                <SelectTrigger id="doc-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={`modal-type-${type.id}`} value={type.label}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="employee" className="text-sm font-medium">Funcionário</label>
              <Select
                value={newDocument.employeeId}
                onValueChange={handleEmployeeSelect}
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={`modal-employee-${employee._id}`} value={employee._id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="department" className="text-sm font-medium">Departamento</label>
                <Select
                  value={newDocument.department}
                  onValueChange={(value) => setNewDocument({...newDocument, department: value})}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.slice(1).map((dept, index) => (
                      <SelectItem key={`modal-dept-${index}`} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="expiry" className="text-sm font-medium">Data de Validade</label>
                <Input 
                  id="expiry" 
                  type="date" 
                  value={newDocument.expiryDate}
                  onChange={(e) => setNewDocument({...newDocument, expiryDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">Tags (separadas por vírgula)</label>
              <Input 
                id="tags" 
                placeholder="ex: contrato, permanente" 
                value={newDocument.tags}
                onChange={(e) => setNewDocument({...newDocument, tags: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUploadDocument}
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Enviando...
                </>
              ) : (<>
                <Upload className="mr-2 h-4 w-4" />
                Enviar Documento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
)
}