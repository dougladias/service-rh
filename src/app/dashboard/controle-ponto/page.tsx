// app/funcionarios/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

import WorkerCard from "@/components/ui/WorkerCard";
import EditWorkerModal from "@/components/ui/EditWorkModal";
import AddWorkerModal from "@/components/ui/AddWorkerModal"; // Import the new modal
import { IWorker } from "@/models/Worker";
import { ButtonGlitchBrightness } from "@/components/ui/ButtonGlitch";

const WorkersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [buttonState, setButtonState] = useState<
    Map<string, { checkInDisabled: boolean; checkOutDisabled: boolean }>
  >(new Map());

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State for the add modal
  const [selectedWorker, setSelectedWorker] = useState<IWorker | null>(null);

  // 1. Fetch all workers and transform dates
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

  // 2. Delete worker mutation
  const deleteWorker = useMutation({
    mutationFn: (workerId: string) =>
      axios.delete("/api/workers", { data: { id: workerId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workers"] }),
    onError: (err) => {
      console.error("Failed to delete worker", err);
      alert("Failed to delete worker");
    },
  });

  // 3. Update worker (for check-in, check-out, faltou)
  const updateWorker = useMutation({
    mutationFn: ({
      workerId,
      action,
    }: {
      workerId: string;
      action: "entrada" | "saida" | "faltou";
    }) => axios.put("/api/workers", { id: workerId, action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workers"] }),
    onError: (err) => {
      console.error("Failed to update worker", err);
      alert("Failed to update worker");
    },
  });

  // 4. Update worker details (for editing)
  const updateWorkerDetails = useMutation({
    mutationFn: ({
      workerId,
      updates,
    }: {
      workerId: string;
      updates: Partial<IWorker>;
    }) => axios.put("/api/workers", { id: workerId, updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      console.error("Failed to update worker details", err);
      alert("Failed to update worker details");
    },
  });

  // 5. Compute button states (check-in disabled if not checked out, etc.)
  useEffect(() => {
    const newButtonState = new Map<
      string,
      { checkInDisabled: boolean; checkOutDisabled: boolean }
    >();

    workers.forEach((worker) => {
      const lastLog = worker.logs[worker.logs.length - 1];

      newButtonState.set(worker._id as string, {
        checkInDisabled: !!(lastLog && !lastLog.leaveTime),
        checkOutDisabled: !lastLog || lastLog.leaveTime !== undefined,
      });
    });

    setButtonState((prevButtonState) => {
      const prevEntries = Array.from(prevButtonState.entries());
      const newEntries = Array.from(newButtonState.entries());

      if (
        prevEntries.length !== newEntries.length ||
        prevEntries.some(([key, value], index) => {
          const [newKey, newValue] = newEntries[index];
          return (
            key !== newKey ||
            value.checkInDisabled !== newValue.checkInDisabled ||
            value.checkOutDisabled !== newValue.checkOutDisabled
          );
        })
      ) {
        return new Map(newEntries);
      }
      return prevButtonState;
    });
  }, [workers]);

  // 6. Handlers
  const handleDelete = (workerId: string) => {
    if (confirm("Tem certeza que quer deletar esse funcionário?")) {
      deleteWorker.mutate(workerId);
    }
  };

  const handleEdit = (workerId: string) => {
    const worker = workers.find((w) => w._id === workerId);
    if (worker) {
      setSelectedWorker(worker);
      setIsEditModalOpen(true);
    }
  };

  const handleSave = (updatedWorker: {
    _id: string;
    name: string;
    cpf: string;
    nascimento: string;
    admissao: string;
    salario: string;
    numero: string;
    email: string;
    address: string;
    contract: string;
    role: string;
  }) => {
    // Convert the simplified worker to IWorker format for the mutation
    const workerToUpdate: Partial<IWorker> = {
      ...updatedWorker,
      nascimento: new Date(updatedWorker.nascimento),
      admissao: new Date(updatedWorker.admissao),
    };

    updateWorkerDetails.mutate({
      workerId: updatedWorker._id,
      updates: workerToUpdate,
    });
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedWorker(null);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCheckIn = (workerId: string) => {
    updateWorker.mutate({ workerId, action: "entrada" });
  };

  const handleCheckOut = (workerId: string) => {
    updateWorker.mutate({ workerId, action: "saida" });
  };

  const handleFaltou = (workerId: string) => {
    updateWorker.mutate({ workerId, action: "faltou" });
  };

  // 7. Render
  return (
    <>
      <div className="w-full mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-black">Controle de Ponto</h2>
            <p className="text-gray-600">
              Gerenciamento de entradas e saídas dos funcionários
            </p>
          </div>
          <ButtonGlitchBrightness
            text="Adicionar novo Funcionário"
            onClick={() => setIsAddModalOpen(true)}
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 mr-9"
          />
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-4 text-left">Nome</th>
              <th className="py-2 px-4 text-left">Cargo</th>
              <th className="py-2 px-4 text-left">Departamento</th>
              <th className="py-2 px-4 text-left">E-mail</th>
              <th className="py-2 px-4 text-left">Salário</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <motion.div
                      className="w-12 h-12 mb-3 border-4 border-gray-200 rounded-full"
                      style={{ borderTopColor: "#22d3ee" }} // cyan-400 color
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
                <td colSpan={7} className="py-4 text-center text-red-500">
                  Error: {(error as Error).message}
                </td>
              </tr>
            ) : workers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-600">
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {workers.map((worker) => (
                  <WorkerCard
                    key={worker._id as string}
                    worker={worker}
                    buttonState={buttonState}
                    onCheckIn={handleCheckIn}
                    onFaltou={handleFaltou}
                    onCheckOut={handleCheckOut}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && selectedWorker && (
        <EditWorkerModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          worker={{
            ...selectedWorker,
            _id: selectedWorker._id as string,
            nascimento: selectedWorker.nascimento.toISOString().split("T")[0],
            admissao: selectedWorker.admissao.toISOString().split("T")[0],
          }}
          onSave={handleSave}
        />
      )}

      <AddWorkerModal isOpen={isAddModalOpen} onClose={handleCloseAddModal} />
    </>
  );
};

export default WorkersPage;
