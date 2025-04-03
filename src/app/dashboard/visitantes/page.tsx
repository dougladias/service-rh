"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Check, Loader2, PencilIcon, Camera } from "lucide-react";
import { ButtonGlitchBrightness } from "@/components/ui/ButtonGlitch";
import WebcamCapture from "@/components/WebcamCapture/WebcamCapture"; // Componente de captura de webcam

// Just extend the MongoDB model for UI purposes
interface UiVisitor {
  id: string;
  name: string;
  rg: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  photo?: string; // Campo para a foto
  entryTime?: string;
  exitTime?: string;
  logs?: { entryTime: string; leaveTime?: string }[];
}

type VisitorInput = {
  name: string;
  rg: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  photo?: string; // Campo para a foto
};

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<UiVisitor[]>([]);
  const [newVisitor, setNewVisitor] = useState<VisitorInput>({
    name: "",
    rg: "",
    cpf: "",
    phone: "",
    email: "",
    address: "",
    photo: undefined,
  });
  const [editingVisitor, setEditingVisitor] = useState<UiVisitor | null>(null);
  const [filter, setFilter] = useState({ name: "", cpf: "", address: "" });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    text: "",
    isError: false,
  });
  const [photoData, setPhotoData] = useState<string | null>(null);

  // Modifique a função convertVisitorData para tratar corretamente os IDs:
  interface VisitorData {
    _id?: string;
    id?: string;
    name?: string;
    rg?: string;
    cpf?: string;
    phone?: string;
    email?: string;
    address?: string;
    photo?: string;
    logs?: { entryTime: string; leaveTime?: string }[];
  }

  const convertVisitorData = useCallback((visitor: VisitorData): UiVisitor => {
    if (!visitor)
      return {
        id: "",
        name: "",
        rg: "",
        cpf: "",
        phone: "",
        email: "",
        address: "",
      };

    // Extrair o ID do documento MongoDB corretamente
    const visitorId = visitor._id ? visitor._id.toString() : visitor.id || "";

    let entryTime = undefined;
    let exitTime = undefined;

    // Tratamento seguro para as datas
    try {
      if (visitor.logs && visitor.logs.length > 0) {
        const lastLog = visitor.logs[visitor.logs.length - 1];

        if (lastLog.entryTime) {
          entryTime = new Date(lastLog.entryTime).toLocaleString("pt-BR");
        }

        if (lastLog.leaveTime) {
          exitTime = new Date(lastLog.leaveTime).toLocaleString("pt-BR");
        }
      }
    } catch (error) {
      console.error("Erro ao processar datas do visitante:", error);
    }

    return {
      id: visitorId,
      name: visitor.name || "",
      rg: visitor.rg || "",
      cpf: visitor.cpf || "",
      phone: visitor.phone || "",
      email: visitor.email || "",
      address: visitor.address || "",
      photo: visitor.photo || "",
      entryTime,
      exitTime,
      logs: visitor.logs || [],
    };
  }, []);

  // Fetch all visitors
  const fetchVisitors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/visitors");
      if (Array.isArray(response.data)) {
        const mappedVisitors = response.data.map(convertVisitorData);
        setVisitors(mappedVisitors);
      } else {
        setVisitors([]);
      }
    } catch (error) {
      console.error("Failed to fetch visitors:", error);
      setStatusMessage({ text: "Falha ao carregar visitantes", isError: true });
    } finally {
      setIsLoading(false);
    }
  }, [convertVisitorData]);

  // Add new visitor
  const handleAddVisitor = async () => {
    // Validate required fields
    if (
      !newVisitor.name ||
      !newVisitor.cpf ||
      !newVisitor.rg ||
      !newVisitor.phone ||
      !newVisitor.email ||
      !newVisitor.address
    ) {
      setStatusMessage({
        text: "Preencha todos os campos obrigatórios",
        isError: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Adicionar a foto ao objeto de novo visitante
      const visitorData = {
        ...newVisitor,
        photo: photoData,
        logs: [{ entryTime: new Date() }],
      };

      await axios.post("/api/visitors", visitorData);

      // Reset form and close dialog
      setNewVisitor({
        name: "",
        rg: "",
        cpf: "",
        phone: "",
        email: "",
        address: "",
        photo: undefined,
      });
      setPhotoData(null);
      setIsAddDialogOpen(false);

      // Refresh visitors list
      await fetchVisitors();
      setStatusMessage({
        text: "Visitante adicionado com sucesso",
        isError: false,
      });
    } catch (error) {
      console.error("Failed to add visitor:", error);
      setStatusMessage({ text: "Falha ao adicionar visitante", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Update visitor
  const handleUpdateVisitor = async () => {
    if (!editingVisitor) return;

    setIsLoading(true);
    try {
      // Incluir a foto na atualização se foi alterada
      const updateData = {
        ...editingVisitor,
        photo: photoData !== undefined ? photoData : editingVisitor.photo,
      };

      await axios.put("/api/visitors", {
        id: editingVisitor.id,
        update: updateData,
      });

      setIsEditDialogOpen(false);
      setEditingVisitor(null);
      setPhotoData(null);
      await fetchVisitors();
      setStatusMessage({
        text: "Visitante atualizado com sucesso",
        isError: false,
      });
    } catch (error) {
      console.error("Failed to update visitor:", error);
      setStatusMessage({ text: "Falha ao atualizar visitante", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Register visitor exit
  const handleRegisterExit = async (visitorId: string) => {
    setIsLoading(true);
    try {
      await axios.put("/api/visitors", {
        id: visitorId,
        action: "saida",
      });

      await fetchVisitors();
      setStatusMessage({
        text: "Saída registrada com sucesso",
        isError: false,
      });
    } catch (error) {
      console.error("Failed to register exit:", error);
      setStatusMessage({ text: "Falha ao registrar saída", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete visitor
  const handleDeleteVisitor = async (visitorId: string) => {
    if (!confirm("Tem certeza que deseja excluir este visitante?")) return;

    setIsLoading(true);
    try {
      await axios.delete("/api/visitors", {
        data: { id: visitorId },
      });

      await fetchVisitors();
      setStatusMessage({
        text: "Visitante excluído com sucesso",
        isError: false,
      });
    } catch (error) {
      console.error("Failed to delete visitor:", error);
      setStatusMessage({ text: "Falha ao excluir visitante", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter visitors
  const handleFilter = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/visitors");

      if (!Array.isArray(response.data)) {
        setVisitors([]);
        return;
      }

      let filteredVisitors = response.data.map(convertVisitorData);

      if (filter.name) {
        filteredVisitors = filteredVisitors.filter(
          (v) =>
            v.name && v.name.toLowerCase().includes(filter.name.toLowerCase())
        );
      }

      if (filter.cpf) {
        filteredVisitors = filteredVisitors.filter(
          (v) => v.cpf && v.cpf.includes(filter.cpf)
        );
      }

      if (filter.address) {
        filteredVisitors = filteredVisitors.filter(
          (v) =>
            v.address &&
            v.address.toLowerCase().includes(filter.address.toLowerCase())
        );
      }

      setVisitors(filteredVisitors);
    } catch (error) {
      console.error("Failed to filter visitors:", error);
      setStatusMessage({ text: "Falha ao filtrar visitantes", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up editing visitor
  const startEditing = (visitor: UiVisitor) => {
    setEditingVisitor(visitor);
    setPhotoData(visitor.photo || null);
    setIsEditDialogOpen(true);
  };

  // Função para lidar com captura de foto
  const handleCapturePhoto = (data: string | null) => {
    setPhotoData(data);
  };

  // Load visitors on page load
  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-md ${
            statusMessage.isError
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {statusMessage.text}
          <button
            className="ml-4 text-sm underline"
            onClick={() => setStatusMessage({ text: "", isError: false })}
          >
            Fechar
          </button>
        </div>
      )}

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Visitantes</h1>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <ButtonGlitchBrightness
              text="Adicionar Visitante"
              className="bg-black hover:bg-gray-600 dark:bg-blue-500/80 transition-all ease-in-out"
            />
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Visitante</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 flex flex-col items-center justify-center">
              {/* Componente de captura de foto */}
              <div className="w-full">
                <label className="block text-sm font-medium mb-2">Foto do Visitante</label>
                <WebcamCapture onCapture={handleCapturePhoto} photoData={photoData} />
              </div>
              
              <div className="space-y-2 w-full">
                <label htmlFor="name">Nome Completo*</label>
                <Input
                  id="name"
                  value={newVisitor.name}
                  onChange={(e) =>
                    setNewVisitor({ ...newVisitor, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 w-full">
                <label htmlFor="rg">RG*</label>
                <Input
                  id="rg"
                  value={newVisitor.rg}
                  onChange={(e) =>
                    setNewVisitor({ ...newVisitor, rg: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 w-full">
                <label htmlFor="cpf">CPF*</label>
                <Input
                  id="cpf"
                  value={newVisitor.cpf}
                  onChange={(e) =>
                    setNewVisitor({ ...newVisitor, cpf: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 w-full">
                <label htmlFor="phone">Telefone*</label>
                <Input
                  id="phone"
                  value={newVisitor.phone}
                  onChange={(e) =>
                    setNewVisitor({ ...newVisitor, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 w-full">
                <label htmlFor="email">Email*</label>
                <Input
                  id="email"
                  value={newVisitor.email}
                  onChange={(e) =>
                    setNewVisitor({ ...newVisitor, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 w-full">
                <label htmlFor="address">Setor*</label>
                <Select
                  value={newVisitor.address}
                  onValueChange={(value) =>
                    setNewVisitor({ ...newVisitor, address: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Administrativo">
                      Administrativo
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ButtonGlitchBrightness
                text={isLoading ? "Adicionando..." : "Adicionar"}
                onClick={handleAddVisitor}
                disabled={isLoading}
                className="w-fit text-center"
              />
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
              value={filter.name}
              onChange={(e) => setFilter({ ...filter, name: e.target.value })}
            />
            <Input
              placeholder="CPF"
              value={filter.cpf}
              onChange={(e) => setFilter({ ...filter, cpf: e.target.value })}
            />
            <Select
              value={filter.address}
              onValueChange={(value) =>
                setFilter({ ...filter, address: value })
              }
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
            <ButtonGlitchBrightness
              text={isLoading ? "Filtrando..." : "Filtrar"}
              onClick={handleFilter}
              disabled={isLoading}
              className="w-fit"
            />
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Tabela de Visitantes */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Foto</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>RG</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Entrada</TableHead>
            <TableHead>Saída</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitors.length === 0 && !isLoading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                Nenhum visitante encontrado
              </TableCell>
            </TableRow>
          ) : (
            visitors.map((visitor, index) => (
              <TableRow key={visitor.id || `visitor-${index}`}>
                <TableCell>
                  {visitor.photo ? (
                    <Image 
                      src={visitor.photo} 
                      alt={`Foto de ${visitor.name}`} 
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Camera size={16} className="text-gray-500" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{visitor.name}</TableCell>
                <TableCell>{visitor.cpf}</TableCell>
                <TableCell>{visitor.rg}</TableCell>
                <TableCell>{visitor.phone}</TableCell>
                <TableCell>{visitor.email}</TableCell>
                <TableCell>{visitor.address}</TableCell>
                <TableCell>{visitor.entryTime || "-"}</TableCell>
                <TableCell>{visitor.exitTime || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                      onClick={() => startEditing(visitor)}
                      disabled={isLoading}
                    >
                      <PencilIcon size={16} />
                    </Button>
                    {!visitor.exitTime && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-green-500 hover:text-green-700 hover:bg-green-100"
                        onClick={() => handleRegisterExit(visitor.id)}
                        disabled={isLoading}
                      >
                        <Check size={16} />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={() => handleDeleteVisitor(visitor.id)}
                      disabled={isLoading}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Visitante</DialogTitle>
          </DialogHeader>
          {editingVisitor && (
            <div className="space-y-4 py-4">
              {/* Componente de captura de foto na edição */}
              <div>
                <label className="block text-sm font-medium mb-2">Foto do Visitante</label>
                <WebcamCapture onCapture={handleCapturePhoto} photoData={photoData} />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-name">Nome Completo*</label>
                <Input
                  id="edit-name"
                  value={editingVisitor.name}
                  onChange={(e) =>
                    setEditingVisitor({
                      ...editingVisitor,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-rg">RG*</label>
                <Input
                  id="edit-rg"
                  value={editingVisitor.rg}
                  onChange={(e) =>
                    setEditingVisitor({ ...editingVisitor, rg: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-cpf">CPF*</label>
                <Input
                  id="edit-cpf"
                  value={editingVisitor.cpf}
                  onChange={(e) =>
                    setEditingVisitor({
                      ...editingVisitor,
                      cpf: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-phone">Telefone*</label>
                <Input
                  id="edit-phone"
                  value={editingVisitor.phone}
                  onChange={(e) =>
                    setEditingVisitor({
                      ...editingVisitor,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-email">Email*</label>
                <Input
                  id="edit-email"
                  value={editingVisitor.email}
                  onChange={(e) =>
                    setEditingVisitor({
                      ...editingVisitor,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-address">Setor*</label>
                <Select
                  value={editingVisitor.address}
                  onValueChange={(value) =>
                    setEditingVisitor({ ...editingVisitor, address: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Administrativo">
                      Administrativo
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ButtonGlitchBrightness
                text={isLoading ? "Salvando..." : "Salvar Alterações"}
                onClick={handleUpdateVisitor}
                disabled={isLoading}
                className="w-full text-center"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}