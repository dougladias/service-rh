// components/ui/EditWorkerModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ButtonGlitchBrightness } from "./ButtonGlitch";

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
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    cpf: "",
    nascimento: "",
    admissao: "",
    salario: "",
    numero: "",
    email: "",
    address: "",
    contract: "",
    role: "",
  });

  useEffect(() => {
    if (worker) {
      setFormData(worker); // Update formData when worker changes
    }
  }, [worker]);

  if (!isOpen || !worker) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData); // Pass updated worker data to the parent
    onClose(); // Close the modal
  };

  const formVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Editar Funcionário</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            ✕
          </button>
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
              value={formData.salario}
              onChange={handleChange}
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
              value={formData.address}
              onChange={handleChange}
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
              value={formData.contract}
              onChange={handleChange}
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