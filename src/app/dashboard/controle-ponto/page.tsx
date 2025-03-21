"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, X, Calendar, User, FileText } from "lucide-react";
import { IWorker } from "@/models/Worker";

// Time log history modal component
const LogHistoryModal = ({
  isOpen,
  onClose,
  worker,
}: {
  isOpen: boolean;
  onClose: () => void;
  worker: IWorker;
}) => {
  // Format date and time for better display
  const formatDateTime = (dateInput: string | Date | undefined | null) => {
    if (!dateInput) return "Não registrada";

    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Data inválida";
      }

      const formattedDate = date.toLocaleDateString("pt-BR");
      const formattedTime = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return `${formattedDate} às ${formattedTime}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Erro no formato";
    }
  };

  // Format just the date (without time)
  const formatDate = (dateInput: string | Date | undefined | null) => {
    if (!dateInput) return "Não registrada";

    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Data inválida";
      }

      return date.toLocaleDateString("pt-BR");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Erro no formato";
    }
  };

  // Group logs by date - fixed to properly return the grouped data
  const groupLogsByDate = () => {
    const grouped: Record<string, (typeof worker.logs)[0][]> = {};

    if (worker.logs && worker.logs.length > 0) {
      worker.logs.forEach((log) => {
        // For absent logs, we need to ensure we have a valid date to group by
        let dateToUse;

        if (log.absent) {
          // For absent logs, use createdAt or a fallback
          dateToUse =
            log.createdAt || log.entryTime || new Date().toISOString();
        } else if (log.entryTime) {
          // For regular logs with entry time
          dateToUse = log.entryTime;
        } else {
          // Skip logs without any usable date
          return;
        }

        const date = new Date(dateToUse);
        const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD format

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }

        grouped[dateKey].push(log);
      });
    }

    return grouped; // This return was missing
  };

  const groupedLogs = groupLogsByDate();
  const sortedDates = Object.keys(groupedLogs).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-[#00000091] bg-opacity-50 z-90"
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-100 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center">
                  <User className="text-cyan-500 mr-2" size={20} />
                  <h2 className="text-xl font-semibold">{worker.name}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center px-4 py-2 bg-gray-50">
                <div className="text-sm text-gray-600 mr-6">
                  <span className="font-medium">Cargo:</span> {worker.role}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">E-mail:</span> {worker.email}
                </div>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Calendar className="mr-2 text-cyan-500" size={18} />
                  Histórico de Registros de Ponto
                </h3>

                {sortedDates.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Nenhum registro de ponto encontrado
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedDates.map((dateKey) => (
                      <div
                        key={dateKey}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-100 px-4 py-2 font-medium">
                          {new Date(dateKey).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="divide-y">
                          {groupedLogs[dateKey].map((log, idx) => (
                            <div key={idx} className="px-4 py-3">
                              {log.absent ? (
                                <div className="flex items-center text-yellow-600">
                                  <FileText size={16} className="mr-2" />
                                  <span className="font-medium">
                                    Dia não trabalhado
                                  </span>
                                  <span className="text-gray-500 ml-2 text-sm">
                                    {formatDate(log.createdAt || log.entryTime)}
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center text-green-600">
                                    <Clock size={16} className="mr-2" />
                                    <span>
                                      Entrada: {formatDateTime(log.entryTime)}
                                    </span>
                                  </div>
                                  {log.leaveTime && (
                                    <div className="flex items-center text-red-600">
                                      <Clock size={16} className="mr-2" />
                                      <span>
                                        Saída: {formatDateTime(log.leaveTime)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t p-4 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Simplified WorkerRow component that calculates its own button states
const WorkerRow = ({
  worker,
  onCheckIn,
  onCheckOut,
  onFaltou,
  onNameClick,
}: {
  worker: IWorker;
  onCheckIn: (id: string) => void;
  onCheckOut: (id: string) => void;
  onFaltou: (id: string) => void;
  onNameClick: (worker: IWorker) => void;
}) => {
  const lastLog =
    worker.logs && worker.logs.length > 0
      ? worker.logs[worker.logs.length - 1]
      : null;

  // Debug log to check worker logs
  React.useEffect(() => {
    if (lastLog?.absent) {
      console.log(`Worker ${worker.name} has absent status:`, lastLog);
    }
  }, [worker, lastLog]);

  // Calculate button states directly in the component
  const checkInDisabled =
    !!(lastLog && !lastLog.leaveTime) || !!lastLog?.absent;
  const checkOutDisabled =
    !lastLog || lastLog.leaveTime !== undefined || !!lastLog.absent;

  const getStatus = () => {
    if (!lastLog) return "Ausente";
    // More explicit check for absent property
    if (lastLog.absent === true) return "Faltou";
    if (!lastLog.leaveTime) return "Presente";
    return "Ausente";
  };

  // Format just the date (without time)
  const formatDate = (dateInput: string | Date | undefined | null) => {
    if (!dateInput) return "Não registrada";

    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Data inválida";
      }

      return date.toLocaleDateString("pt-BR");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Erro no formato";
    }
  };

  // Format date and time for better display
  const formatDateTime = (dateInput: string | Date | undefined | null) => {
    if (!dateInput) return "Não registrada";

    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Data inválida";
      }

      const formattedDate = date.toLocaleDateString("pt-BR");
      const formattedTime = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return `${formattedDate} às ${formattedTime}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Erro no formato";
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td
        className="py-3 px-4 cursor-pointer hover:text-cyan-600 transition-colors"
        onClick={() => onNameClick(worker)}
      >
        <div className="flex items-center">
          <span className="font-medium">{worker.name}</span>
          <Calendar size={14} className="ml-2 text-gray-400" />
        </div>
      </td>
      <td className="py-3 px-4">{worker.role}</td>
      <td className="py-3 px-4">
        {lastLog ? (
          lastLog.absent ? (
            <div className="flex items-center text-yellow-600">
              <FileText size={14} className="mr-1" />
              <span className="text-xs">
                Dia não trabalhado:{" "}
                {formatDate(lastLog.createdAt || lastLog.entryTime)}
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center text-xs text-gray-600 mb-1">
                <Clock size={12} className="mr-1" /> Entrada:{" "}
                {lastLog.entryTime
                  ? formatDateTime(lastLog.entryTime)
                  : "Não registrada"}
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <Clock size={12} className="mr-1" /> Saída:{" "}
                {lastLog.leaveTime
                  ? formatDateTime(lastLog.leaveTime)
                  : "Não registrada"}
              </div>
            </div>
          )
        ) : (
          <span className="text-xs text-gray-500">Sem registros</span>
        )}
      </td>
      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            getStatus() === "Presente"
              ? "bg-green-100 text-green-800"
              : getStatus() === "Faltou" // Changed from "Falta" to "Faltou"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {getStatus()}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onCheckIn(worker._id as string)}
            disabled={checkInDisabled}
            className={`px-3 py-1 rounded text-xs font-medium ${
              checkInDisabled
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            Entrada
          </button>
          <button
            onClick={() => onCheckOut(worker._id as string)}
            disabled={checkOutDisabled}
            className={`px-3 py-1 rounded text-xs font-medium ${
              checkOutDisabled
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
          >
            Saída
          </button>
          <button
            onClick={() => onFaltou(worker._id as string)}
            className="px-3 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          >
            Faltou
          </button>
        </div>
      </td>
    </tr>
  );
};

const TimeTrackingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null); // Changed to store ID instead of worker object
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const { data: currentSelectedWorker } = useQuery<IWorker>({
    queryKey: ["worker", selectedWorkerId],
    queryFn: async () => {
      if (!selectedWorkerId) return null;
      const response = await axios.get(`/api/workers/${selectedWorkerId}`);
      return response.data;
    },
    enabled: !!selectedWorkerId && isLogModalOpen,
    refetchInterval: isLogModalOpen ? 1000 : false, // Poll every second if modal is open
  });

  // Fetch all workers
  const {
    data: workers = [],
    isLoading,
    error,
  } = useQuery<IWorker[]>({
    queryKey: ["workers"],
    queryFn: async () => {
      const response = await axios.get("/api/workers");
      return response.data.map((worker: IWorker) => ({
        ...worker,
        nascimento: new Date(worker.nascimento),
        admissao: new Date(worker.admissao),
      }));
    },
    staleTime: 5000,
  });

  // Get the currently selected worker from the latest data
  const selectedWorker = selectedWorkerId
    ? workers.find((w) => w._id === selectedWorkerId)
    : null;

  // Filter workers based on search term
  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update worker (for check-in, check-out, faltou)
  const updateWorker = useMutation({
    mutationFn: ({
      workerId,
      action,
    }: {
      workerId: string;
      action: "entrada" | "saida" | "faltou";
    }) => {
      console.log(`Calling API with action: ${action} for worker: ${workerId}`);
      return axios.put("/api/workers", { id: workerId, action });
    },
    onSuccess: (data) => {
      console.log("API call successful:", data);
      // Force an immediate refetch to get fresh data
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      // Optionally refetch immediately
      queryClient.refetchQueries({ queryKey: ["workers"] });
    },
    onError: (err) => {
      console.error("Failed to update worker", err);
      alert("Failed to update worker");
    },
  });

  // Handlers
  const handleCheckIn = (workerId: string) => {
    updateWorker.mutate({ workerId, action: "entrada" });
  };

  const handleCheckOut = (workerId: string) => {
    updateWorker.mutate({ workerId, action: "saida" });
  };

  const handleFaltou = (workerId: string) => {
    updateWorker.mutate({ workerId, action: "faltou" });
  };

  const handleNameClick = (worker: IWorker) => {
    setSelectedWorkerId(worker._id as string); // Store ID instead of object
    setIsLogModalOpen(true);
  };

  return (
    <div className="w-full mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-black">Controle de Ponto</h2>
          <p className="text-gray-600">
            Registro de entradas e saídas dos funcionários
          </p>
        </div>
        {/* Only render modal when we have a valid worker */}
        {(currentSelectedWorker || selectedWorker) && (
          <LogHistoryModal
            isOpen={isLogModalOpen}
            onClose={() => setIsLogModalOpen(false)}
            worker={(currentSelectedWorker || selectedWorker) as IWorker}
          />
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block pl-10 p-2.5 transition-all duration-200 focus:w-64 w-48"
            placeholder="Buscar funcionário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="py-2 px-4 text-left">Nome</th>
            <th className="py-2 px-4 text-left">Cargo</th>
            <th className="py-2 px-4 text-left">Registro de Ponto</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <motion.div
                    className="w-12 h-12 mb-3 border-4 border-gray-200 rounded-full"
                    style={{ borderTopColor: "#22d3ee" }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.span
                    className="text-cyan-400 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Carregando dados...
                  </motion.span>
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={5} className="py-4 text-center text-red-500">
                Error: {(error as Error).message}
              </td>
            </tr>
          ) : filteredWorkers.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-4 text-center text-gray-600">
                {searchTerm
                  ? "Nenhum funcionário encontrado com esse termo de busca."
                  : "Nenhum funcionário encontrado."}
              </td>
            </tr>
          ) : (
            filteredWorkers.map((worker) => (
              <WorkerRow
                key={worker._id as string}
                worker={worker}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onFaltou={handleFaltou}
                onNameClick={handleNameClick}
              />
            ))
          )}
        </tbody>
      </table>

      {/* Log History Modal */}
      {selectedWorker && (
        <LogHistoryModal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          worker={selectedWorker} // This will always have the latest data
        />
      )}
    </div>
  );
};

export default TimeTrackingPage;
