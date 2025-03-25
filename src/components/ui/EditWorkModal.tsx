'use client'

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ButtonGlitchBrightness } from "./ButtonGlitch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface EditWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: {
    _id: string;
    name: string;
    cpf: string;
    nascimento: string;
    admissao: string;
    salario: string;
    // Campo mapeado para o modelo (ajuda)
    ajuda: string;
    numero: string;
    email: string;
    address: string;
    contract: string;
    role: string;
  } | null;
  onSave: (updatedWorker: {
    _id: string;
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
  }) => void;
}

const EditWorkerModal: React.FC<EditWorkerModalProps> = ({
  isOpen,
  onClose,
  worker,
  onSave,
}) => {
  // Estado para os campos do formulário, usando "ajuda" (conforme o modelo)
  const [formData, setFormData] = useState<{
    _id: string;
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
  }>({
    _id: "",
    name: "",
    cpf: "",
    nascimento: "",
    admissao: "",
    salario: "",
    ajuda: "",
    numero: "",
    email: "",
    address: "",
    contract: "CLT", // Valor padrão
    role: "",
  });

const [didInitialize, setDidInitialize] = useState(false);

useEffect(() => {
  // Carrega os dados somente na abertura do modal e não a cada renderização
  if (worker && isOpen && !didInitialize) {
    setFormData({
      _id: worker._id || "",
      name: worker.name || "",
      cpf: worker.cpf || "",
      nascimento: worker.nascimento || "",
      admissao: worker.admissao || "",
      salario: worker.salario || "",
      ajuda: worker.ajuda || "",
      numero: worker.numero || "",
      email: worker.email || "",
      address: worker.address || "",
      contract: worker.contract || "CLT",
      role: worker.role || ""
    });
    setDidInitialize(true);
  }
  
  // Resetar o flag quando o modal é fechado
  if (!isOpen) {
    setDidInitialize(false);
  }
}, [worker, isOpen, didInitialize]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleContractChange = useCallback((value: string) => {
    console.log("Contrato selecionado:", value);
    if (value) {
      setFormData((prev) => {
        // Só atualiza se o valor for diferente do atual
        if (prev.contract !== value) {
          return { ...prev, contract: value };
        }
        return prev;
      });
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();    
    onSave(formData);
    onClose();
  }, [formData, onSave, onClose]);

  if (!isOpen || !worker) return null;

  const formVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  const contractTypes = [
    { value: "CLT", label: "CLT" },
    { value: "PJ", label: "PJ" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Alterado: removida a classe bg-gray-800 e definida cor em hex */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#1F2937" }} // Equivalente a bg-gray-800
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Editar Funcionário</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            ✕
          </button>
        </div>
        
        {/* Alterado: removida a classe bg-gray-700 e definida cor em hex */}
        <div className="mb-4 p-2 rounded" style={{ backgroundColor: "#374151" }}>
          <p className="text-sm text-gray-300">
            <span className="font-bold">Debug:</span> Tipo de contrato atual: {formData.contract}
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4 text-white"
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
              className="border rounded border-gray-500 pl-2 w-full"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              className="border rounded border-gray-500 pl-2 w-full"
              value={formData.cpf}
              onChange={handleChange}
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
              className="border rounded border-gray-500 pl-2 w-full"
              value={formData.nascimento}
              onChange={handleChange}
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
              className="border rounded border-gray-500 pl-2 w-full"
              value={formData.admissao}
              onChange={handleChange}
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
              className="border rounded border-gray-500 pl-2 w-full"
              value={formData.salario}
              onChange={handleChange}
              required
            />
          </motion.div>
          {/* Campo de Ajuda de Custo (mapeado para "ajuda") */}
          <motion.div variants={inputVariants}>
            <label htmlFor="ajuda" className="block text-sm font-medium text-gray-300">
              Ajuda de Custo:
            </label>
            <input
              type="number"
              id="ajuda"
              name="ajuda"
              className="border rounded border-gray-500 pl-2 w-full"
              value={formData.ajuda}
              onChange={handleChange}
              step="0.01"
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
              className="border rounded border-gray-500 pl-2 w-full"
              value={formData.numero}
              onChange={handleChange}
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
              className="border rounded border-gray-500 pl-2 w-full"
              value={formData.email}
              onChange={handleChange}
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
              className="border rounded border-gray-500 pl-2 w-full"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </motion.div>
          <motion.div variants={inputVariants}>
            <label htmlFor="contract" className="block text-sm font-medium text-gray-300">
              Tipo de contrato:
            </label>
            <Select
              value={formData.contract}
              onValueChange={(value) => {
                console.log("Contrato selecionado:", value);
                handleContractChange(value);
              }}
            >
              <SelectTrigger id="contract" className="bg-transparent text-white border-gray-500">
                <SelectValue placeholder="Selecione o tipo de contrato" />
              </SelectTrigger>
              <SelectContent>
                {contractTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
          <motion.div variants={inputVariants}>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300">
              Cargo:
            </label>
            <input
              type="text"
              id="role"
              name="role"
              className="border rounded border-gray-500 pl-2 w-full"
              value={formData.role}
              onChange={handleChange}
              required
            />
          </motion.div>
          <div className="flex justify-end space-x-2">
            <motion.div variants={inputVariants}>
              <ButtonGlitchBrightness
                text="Cancelar"
                type="button"
                onClick={onClose}
                className="bg-red-500/80 hover:bg-red-600 dark:bg-red-500/80 dark:hover:bg-red-600"
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <ButtonGlitchBrightness
                text="Salvar"
                type="submit"
                className="bg-cyan-500/80 hover:bg-cyan-600 dark:bg-cyan-500/80 dark:hover:bg-cyan-600"
              />
            </motion.div>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default EditWorkerModal;
