"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Trash2, Check, Wrench, Loader2 } from "lucide-react";
import { ButtonGlitchBrightness } from "@/components/ui/ButtonGlitch";
// import { iPrestador } from '@/models/Prestadores'

// UI model that matches our MongoDB model
interface UiPrestador {
  id: string;
  name: string;
  company: string;
  address: string;
  phone: string;
  service: string;
  rg: string;
  cpf: string;
  cnpj: string;
  entryTime?: string;
  exitTime?: string;
  logs?: { entryTime: string; leaveTime?: string }[];
}

interface PrestadorFilter {
  name?: string;
  cpf?: string;
  service?: string;
  company?: string;
}

// Defina esta interface antes da função convertPrestadorData
interface PrestadorData {
  _id?: string;
  id?: string;
  name?: string;
  company?: string;
  address?: string;
  phone?: string;
  service?: string;
  rg?: string;
  cpf?: string;
  cnpj?: string;
  logs?: { entryTime: string; leaveTime?: string }[];
}

export default function ServiceProvidersPage() {
  const [prestadores, setPrestadores] = useState<UiPrestador[]>([]);
  const [newPrestador, setNewPrestador] = useState({
    name: "",
    company: "",
    address: "",
    phone: "",
    service: "",
    rg: "",
    cpf: "",
    cnpj: "",
  });
  const [filter, setFilter] = useState<PrestadorFilter>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    text: "",
    isError: false,
  });

  // Convert MongoDB prestador to UI format
  const convertPrestadorData = useCallback(
    (prestador: PrestadorData): UiPrestador => {
      // Extrair o ID do documento MongoDB corretamente
      const prestadorId = prestador._id
        ? prestador._id.toString()
        : prestador.id ||
          `prestador-${Math.random().toString(36).substring(2, 9)}`;

      let entryTime = undefined;
      let exitTime = undefined;

      // Tratamento seguro para as datas
      try {
        if (prestador.logs && prestador.logs.length > 0) {
          const lastLog = prestador.logs[prestador.logs.length - 1];

          if (lastLog.entryTime) {
            entryTime = new Date(lastLog.entryTime).toLocaleString("pt-BR");
          }

          if (lastLog.leaveTime) {
            exitTime = new Date(lastLog.leaveTime).toLocaleString("pt-BR");
          }
        }
      } catch (error) {
        console.error("Erro ao processar datas do prestador:", error);
      }

      return {
        id: prestadorId, // ID nunca será vazio
        name: prestador.name || "",
        company: prestador.company || "",
        address: prestador.address || "",
        phone: prestador.phone || "",
        service: prestador.service || "",
        rg: prestador.rg || "",
        cpf: prestador.cpf || "",
        cnpj: prestador.cnpj || "",
        entryTime,
        exitTime,
        logs: prestador.logs || [],
      };
    },
    []
  );

  // Fetch all service providers
  const fetchPrestadores = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/prestador");

      if (Array.isArray(response.data)) {
        const mappedPrestadores = response.data.map(convertPrestadorData);
        setPrestadores(mappedPrestadores);
      } else {
        setPrestadores([]);
      }
    } catch (error) {
      console.error("Failed to fetch prestadores:", error);
      setStatusMessage({
        text: "Falha ao carregar prestadores",
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [convertPrestadorData]);

  // Add new provider
  const handleAddPrestador = async () => {
    // Validate required fields
    if (
      !newPrestador.name ||
      !newPrestador.cpf ||
      !newPrestador.service ||
      !newPrestador.company ||
      !newPrestador.rg ||
      !newPrestador.phone ||
      !newPrestador.cnpj ||
      !newPrestador.address
    ) {
      setStatusMessage({
        text: "Preencha todos os campos obrigatórios",
        isError: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/prestador", {
        ...newPrestador,
        logs: [{ entryTime: new Date() }],
      });

      // Reset form and close dialog
      setNewPrestador({
        name: "",
        company: "",
        address: "",
        phone: "",
        service: "",
        rg: "",
        cpf: "",
        cnpj: "",
      });
      setIsDialogOpen(false);

      // Refresh list
      await fetchPrestadores();
      setStatusMessage({
        text: "Prestador adicionado com sucesso",
        isError: false,
      });
    } catch (error) {
      console.error("Failed to add prestador:", error);
      setStatusMessage({ text: "Falha ao adicionar prestador", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Register provider exit
  const handleRegisterExit = async (prestadorId: string) => {
    setIsLoading(true);
    try {
      await axios.put("/api/prestador", {
        id: prestadorId,
        action: "saida",
      });

      await fetchPrestadores();
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

  // Delete provider
  const handleDeletePrestador = async (prestadorId: string) => {
    if (!confirm("Tem certeza que deseja excluir este prestador?")) return;

    setIsLoading(true);
    try {
      await axios.delete("/api/prestador", {
        data: { id: prestadorId },
      });

      await fetchPrestadores();
      setStatusMessage({
        text: "Prestador excluído com sucesso",
        isError: false,
      });
    } catch (error) {
      console.error("Failed to delete prestador:", error);
      setStatusMessage({ text: "Falha ao excluir prestador", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter service providers
  const handleFilter = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/prestador");

      if (!Array.isArray(response.data)) {
        setPrestadores([]);
        return;
      }

      let filteredPrestadores = response.data.map(convertPrestadorData);

      if (filter.name) {
        filteredPrestadores = filteredPrestadores.filter(
          (p) =>
            p.name && p.name.toLowerCase().includes(filter.name!.toLowerCase())
        );
      }

      if (filter.cpf) {
        filteredPrestadores = filteredPrestadores.filter(
          (p) => p.cpf && p.cpf.includes(filter.cpf!)
        );
      }

      if (filter.service) {
        filteredPrestadores = filteredPrestadores.filter(
          (p) => p.service && p.service === filter.service
        );
      }

      if (filter.company) {
        filteredPrestadores = filteredPrestadores.filter(
          (p) =>
            p.company &&
            p.company.toLowerCase().includes(filter.company!.toLowerCase())
        );
      }

      setPrestadores(filteredPrestadores);
    } catch (error) {
      console.error("Failed to filter prestadores:", error);
      setStatusMessage({ text: "Falha ao filtrar prestadores", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Load service providers on page load
  useEffect(() => {
    fetchPrestadores();
  }, [fetchPrestadores]);

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
    "Outro",
  ];

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

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Prestadores de Serviço</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <ButtonGlitchBrightness
              text="Cadastrar Prestador"
              className="bg-black hover:bg-gray-600 dark:bg-blue-500/80"
            />
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Prestador de Serviço</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 flex flex-col items-center justify-center">
              <div className="space-y-2">
                <label htmlFor="name">Nome Completo*</label>
                <Input
                  id="name"
                  value={newPrestador.name}
                  onChange={(e) =>
                    setNewPrestador({ ...newPrestador, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="cpf">CPF*</label>
                <Input
                  id="cpf"
                  value={newPrestador.cpf}
                  onChange={(e) =>
                    setNewPrestador({ ...newPrestador, cpf: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="rg">RG*</label>
                <Input
                  id="rg"
                  value={newPrestador.rg}
                  onChange={(e) =>
                    setNewPrestador({ ...newPrestador, rg: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="company">Empresa*</label>
                <Input
                  id="company"
                  value={newPrestador.company}
                  onChange={(e) =>
                    setNewPrestador({
                      ...newPrestador,
                      company: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="cnpj">CNPJ*</label>
                <Input
                  id="cnpj"
                  value={newPrestador.cnpj}
                  onChange={(e) =>
                    setNewPrestador({ ...newPrestador, cnpj: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="address">Endereço*</label>
                <Input
                  id="address"
                  value={newPrestador.address}
                  onChange={(e) =>
                    setNewPrestador({
                      ...newPrestador,
                      address: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone">Telefone*</label>
                <Input
                  id="phone"
                  value={newPrestador.phone}
                  onChange={(e) =>
                    setNewPrestador({ ...newPrestador, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="service">Tipo de Serviço*</label>
                <Select
                  value={newPrestador.service}
                  onValueChange={(value) =>
                    setNewPrestador({ ...newPrestador, service: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ButtonGlitchBrightness
                text={isLoading ? "Cadastrando..." : "Cadastrar"}
                onClick={handleAddPrestador}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <Input
              placeholder="Nome"
              value={filter.name || ""}
              onChange={(e) => setFilter({ ...filter, name: e.target.value })}
            />
            <Input
              placeholder="CPF"
              value={filter.cpf || ""}
              onChange={(e) => setFilter({ ...filter, cpf: e.target.value })}
            />
            <Input
              placeholder="Empresa"
              value={filter.company || ""}
              onChange={(e) =>
                setFilter({ ...filter, company: e.target.value })
              }
            />
            <Select
              value={filter.service}
              onValueChange={(value) =>
                setFilter({ ...filter, service: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os serviços" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ButtonGlitchBrightness
              text={isLoading ? "Filtrando..." : "Filtrar"}
              onClick={handleFilter}
              disabled={isLoading}
              className="md:col-span-2 lg:col-span-4 w-fit"
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

      {/* Tabela de Prestadores de Serviço */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Tipo de Serviço</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Entrada</TableHead>
            <TableHead>Saída</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prestadores.length === 0 && !isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                Nenhum prestador encontrado
              </TableCell>
            </TableRow>
          ) : (
            prestadores.map((prestador, index) => (
              <TableRow key={prestador.id || `prestador-${index}`}>
                <TableCell>{prestador.name}</TableCell>
                <TableCell>{prestador.cpf}</TableCell>
                <TableCell>{prestador.cnpj}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    {prestador.service}
                  </div>
                </TableCell>
                <TableCell>{prestador.company}</TableCell>
                <TableCell>{prestador.phone}</TableCell>
                <TableCell>{prestador.entryTime || "-"}</TableCell>
                <TableCell>{prestador.exitTime || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {!prestador.exitTime && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-green-500 hover:text-green-700 hover:bg-green-100"
                        onClick={() => handleRegisterExit(prestador.id)}
                        disabled={isLoading}
                      >
                        <Check size={16} />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={() => handleDeletePrestador(prestador.id)}
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
    </div>
  );
}
