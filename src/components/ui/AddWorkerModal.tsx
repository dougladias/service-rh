// components/ui/AddWorkerModal.tsx
"use client";

import React, { useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ButtonGlitchBrightness } from "./ButtonGlitch";

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddWorkerModal: React.FC<AddWorkerModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  // State for all required fields
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [admissao, setAdmissao] = useState("");
  const [salario, setSalario] = useState("");
  const [ajuda, setAjuda] = useState("");
  const [numero, setNumero] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [contract, setContract] = useState("");
  const [role, setRole] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addWorker = useMutation({
    mutationFn: (newWorker: {
      name: string;
      cpf: string;
      nascimento: string;
      admissao: string;
      salario: string;
      ajuda: string;
      numero: string;
      email: string;
      address: string;
      contract: string;
      role: string;
    }) => axios.post("/api/workers", newWorker),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      setName("");
      setCpf("");
      setNascimento("");
      setAdmissao("");
      setSalario("");
      setAjuda("");
      setNumero("");
      setEmail("");
      setAddress("");
      setContract("");
      setRole("");
      setSuccessMessage("Funcionário adicionado com sucesso!");
      setTimeout(() => {
        setSuccessMessage("");
        onClose(); // Close the modal after success
      }, 2000); // Close after 2 seconds to show the success message
    },
    onError: (error) => {
      console.error("Failed to add worker", error);
      alert("Failed to add worker");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      name.trim() &&
      cpf.trim() &&
      nascimento.trim() &&
      admissao.trim() &&
      salario.trim() &&
      ajuda.trim() &&
      numero.trim() &&
      email.trim() &&
      address.trim() &&
      contract.trim() &&
      role.trim()
    ) {
      setIsLoading(true);
      addWorker.mutate({
        name,
        cpf,
        nascimento,
        admissao,
        salario,
        ajuda,
        numero,
        email,
        address,
        contract,
        role,
      });
    } else {
      alert("Please fill in all fields");
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Registrar um Funcionário</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            ✕
          </button>
        </div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-green-500"
          >
            {successMessage}
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center">
            Carregando...
          </div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4 items-left place-content-center justify-left flex flex-col"
            initial="hidden"
            animate="visible"
            variants={formVariants}
          >
            <motion.div variants={inputVariants}>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Nome:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="text-white border rounded border-gray-500 pl-2"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                required
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-300">
                CPF:
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                className="text-white border rounded border-gray-500 pl-2"
                value={cpf}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCpf(e.target.value)}
                required
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="nascimento" className="block text-sm font-medium text-gray-300">
                Nascimento:
              </label>
              <input
                type="date"
                id="nascimento"
                name="nascimento"
                className="text-white border rounded border-gray-500 pl-2"
                value={nascimento}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNascimento(e.target.value)}
                required
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="admissao" className="block text-sm font-medium text-gray-300">
                Admissão:
              </label>
              <input
                type="date"
                id="admissao"
                name="admissao"
                className="text-white border rounded border-gray-500 pl-2"
                value={admissao}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdmissao(e.target.value)}
                required
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="salario" className="block text-sm font-medium text-gray-300">
                Salário:
              </label>
              <input
                type="text"
                id="salario"
                name="salario"
                className="text-white border rounded border-gray-500 pl-2"
                value={salario}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSalario(e.target.value)}
                required
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="ajuda" className="block text-sm font-medium text-gray-300">
                Ajuda de Custo:
              </label>
              <input
                type="text"
                id="ajuda"
                name="ajuda"
                className="text-white border rounded border-gray-500 pl-2"
                value={ajuda}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAjuda(e.target.value)}
                required
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="numero" className="block text-sm font-medium text-gray-300">
                Número:
              </label>
              <input
                type="text"
                id="numero"
                name="numero"
                className="text-white border rounded border-gray-500 pl-2"
                value={numero}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNumero(e.target.value)}
                required
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="text-white border rounded border-gray-500 pl-2"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300">
                Endereço:
              </label>
              <input
                type="text"
                id="address"
                name="address"
                className="text-white border rounded border-gray-500 pl-2"
                value={address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                required
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="contract" className="block text-sm font-medium text-gray-300">
                Tipo de contrato (CNPJ ou CLT):
              </label>
              <input
                type="text"
                id="contract"
                name="contract"
                className="text-white border rounded border-gray-500 pl-2"
                value={contract}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContract(e.target.value)}
                required
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300">
                Cargo:
              </label>
              <input
                type="text"
                id="role"
                name="role"
                className="text-white border rounded border-gray-500 pl-2"
                value={role}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRole(e.target.value)}
                required
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <ButtonGlitchBrightness
                text={addWorker.isPending ? "Adicionando..." : "Adicionar Funcionário"}
                type="submit"
                disabled={addWorker.isPending}
                className="w-full flex text-center items-center justify-center"
              />
            </motion.div>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default AddWorkerModal;