"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArchiveRestore, Edit, FileDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import axios from "axios";

// Interface para o tipo Material
interface Material {
    id?: string;
    categoria: string;
    nome: string;
    quantidade: number;
    unidade: string;
    preco: number;
    dataCriacao: string;
    fornecedor?: string;
}

export default function MaterialsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Recupera parâmetros da URL
    const pageParam = searchParams?.get("page");
    const monthParam = searchParams?.get("month");
    const yearParam = searchParams?.get("year");

    // State declarations
    const [materiais, setMateriais] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMaterial, setNewMaterial] = useState<Material>({
        categoria: "Material de Escritório",
        nome: "",
        quantidade: 0,
        unidade: "",
        preco: 0,
        dataCriacao: new Date().toISOString(),
        fornecedor: "",
    });

    // State para inputs como strings para melhor experiência do usuário
    const [quantidadeInput, setQuantidadeInput] = useState("");
    const [precoInput, setPrecoInput] = useState("");

    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Paginação
    const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam) : 1);
    const itemsPerPage = 10;

    // Filtro de mês e ano
    const currentDate = useMemo(() => new Date(), []);
    const [selectedMonth, setSelectedMonth] = useState(monthParam ? parseInt(monthParam) : currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(yearParam ? parseInt(yearParam) : currentDate.getFullYear());

    // Carregando materiais do banco de dados
    useEffect(() => {
        const fetchMaterials = async () => {
            setLoading(true);

            try {
                // Busca filtrada usando a API
                const response = await axios.get<Material[]>('/api/materiais/filtro', {
                    params: {
                        month: selectedMonth,
                        year: selectedYear,
                        category: selectedCategory !== "Todos" ? selectedCategory : undefined
                    }
                });

                setMateriais(response.data);
            } catch (error) {
                console.error("Erro ao carregar materiais:", error);
                setError("Falha ao carregar os materiais. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, [selectedMonth, selectedYear, selectedCategory]);

    // Atualizar URL quando mudar página ou filtros
    useEffect(() => {
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());

        if (selectedMonth !== currentDate.getMonth() + 1 || selectedYear !== currentDate.getFullYear()) {
            params.set("month", selectedMonth.toString());
            params.set("year", selectedYear.toString());
        }

        router.push(`?${params.toString()}`);
    }, [currentPage, selectedMonth, selectedYear, router, currentDate]);

    // Atualizar inputs quando estiver editando
    useEffect(() => {
        if (editingMaterial) {
            setQuantidadeInput(editingMaterial.quantidade.toString());
            setPrecoInput(editingMaterial.preco.toString());
        } else {
            setQuantidadeInput("");
            setPrecoInput("");
        }
    }, [editingMaterial]);

    // Função para adicionar material via API
    const handleAddMaterial = async () => {
        if (!newMaterial.nome || !newMaterial.unidade) {
            setError("Preencha todos os campos obrigatórios");
            return;
        }

        setLoading(true);

        try {
            // Preparar dados para enviar à API
            const materialToAdd = {
                ...newMaterial,
                quantidade: parseFloat(quantidadeInput) || 0,
                preco: parseFloat(precoInput) || 0
            };

            // Chamada à API para adicionar material
            const response = await axios.post<Material>('/api/materiais', materialToAdd);

            // Adicionar o material retornado ao estado
            setMateriais([...materiais, response.data]);

            // Limpar o formulário
            setNewMaterial({
                categoria: "Material de Escritório",
                nome: "",
                quantidade: 0,
                unidade: "",
                preco: 0,
                dataCriacao: new Date().toISOString(),
                fornecedor: "",
            });
            setQuantidadeInput("");
            setPrecoInput("");
            setShowAddForm(false);
            setError(null);
            setSuccess("Material adicionado com sucesso!");

            // Limpar mensagem de sucesso após 3 segundos
            setTimeout(() => setSuccess(null), 3000);
        } catch (error: unknown) {
            console.error("Erro ao adicionar material:", error);
            setError(error instanceof Error
                ? error.message
                : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Falha ao adicionar o material. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    // Função para editar material 
    const handleEditMaterial = (material: Material) => {
        setEditingMaterial(material);
        setNewMaterial(material);
        setQuantidadeInput(material.quantidade.toString());
        setPrecoInput(material.preco.toString());
        setShowAddForm(true);
    };

    // Função para atualizar material via API
    const handleUpdateMaterial = async () => {
        if (!editingMaterial || !newMaterial.nome || !newMaterial.unidade) {
            setError("Preencha todos os campos obrigatórios");
            return;
        }

        setLoading(true);

        try {
            // Preparar dados para enviar à API
            const updatedMaterial = {
                ...newMaterial,
                quantidade: parseFloat(quantidadeInput) || 0,
                preco: parseFloat(precoInput) || 0
            };

            // Chamada à API para atualizar material
            await axios.put<Material>(`/api/materiais/${editingMaterial.id}`, updatedMaterial);

            // Atualizar a lista local de materiais
            const updatedMateriais = materiais.map((mat) =>
                mat.id === editingMaterial.id ? { ...updatedMaterial, id: editingMaterial.id } : mat
            );

            setMateriais(updatedMateriais);
            setEditingMaterial(null);
            setNewMaterial({
                categoria: "Material de Escritório",
                nome: "",
                quantidade: 0,
                unidade: "",
                preco: 0,
                dataCriacao: new Date().toISOString(),
                fornecedor: "",
            });
            setQuantidadeInput("");
            setPrecoInput("");
            setShowAddForm(false);
            setSuccess("Material atualizado com sucesso!");

        } catch (error: unknown) {
            console.error("Erro ao atualizar material:", error);
            setError(error instanceof Error
                ? error.message
                : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Falha ao atualizar o material. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    // Função para excluir material via API
    const handleDeleteMaterial = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este material?")) {
            return;
        }

        setLoading(true);

        try {
            // Chamada à API para excluir material
            await axios.delete(`/api/materiais/${id}`);

            // Atualizar a lista local de materiais
            const filteredMateriais = materiais.filter((mat) => mat.id !== id);
            setMateriais(filteredMateriais);
            setSuccess("Material excluído com sucesso!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (error: unknown) {
            console.error("Erro ao excluir material:", error);
            setError(error instanceof Error
                ? error.message
                : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Falha ao excluir o material. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    // Categorias disponíveis
    const categorias = [
        "Todos",
        "Material de Limpeza",
        "Material de Escritório",
        "Equipamentos",
        "Produtos de Cozinha"
    ];

    // Obter meses
    const meses = [
        { value: 1, label: "Janeiro" },
        { value: 2, label: "Fevereiro" },
        { value: 3, label: "Março" },
        { value: 4, label: "Abril" },
        { value: 5, label: "Maio" },
        { value: 6, label: "Junho" },
        { value: 7, label: "Julho" },
        { value: 8, label: "Agosto" },
        { value: 9, label: "Setembro" },
        { value: 10, label: "Outubro" },
        { value: 11, label: "Novembro" },
        { value: 12, label: "Dezembro" }
    ];

    // Função para exportar dados
    const exportToCSV = () => {
        if (filteredMateriais.length === 0) {
            setError("Não há dados para exportar");
            return;
        }

        // Criar cabeçalho CSV
        const headers = ["ID", "Categoria", "Nome", "Quantidade", "Unidade", "Preço", "Data de Cadastro", "Fornecedor"];

        // Converter dados para formato CSV
        const csvData = filteredMateriais.map(material => [
            material.id,
            material.categoria,
            material.nome,
            material.quantidade,
            material.unidade,
            material.preco,
            new Date(material.dataCriacao).toLocaleDateString(),
            material.fornecedor || ""
        ]);

        // Juntar tudo em uma string CSV
        const csvContent = [
            headers.join(","),
            ...csvData.map(row => row.join(","))
        ].join("\n");

        // Criar blob e link para download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `materiais_${selectedMonth}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filtrar materiais com base no termo de busca
    const filteredMateriais = materiais.filter((material) => {
        const matchesSearch = material.nome
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "Todos" || material.categoria === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Calcular totais
    const totalItems = filteredMateriais.length;
    const valorTotalInventario = filteredMateriais.reduce(
        (sum, material) => sum + material.preco,
        0
    );

    // Paginação
    const totalPages = Math.ceil(filteredMateriais.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedMateriais = filteredMateriais.slice(startIndex, startIndex + itemsPerPage);

    // Verificar se a página atual existe após filtragem
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [filteredMateriais, currentPage, totalPages]);

    return (
        <div className="p-4 md:p-6 max-w-full w-full mx-auto bg-white dark:bg-gray-900 dark:text-white rounded-2xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Gestão de Materiais</h1>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200">Total de Itens</h3>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalItems}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-medium text-green-900 dark:text-green-200">Valor Total</h3>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        R$ {valorTotalInventario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h3 className="text-lg font-medium text-amber-900 dark:text-amber-200">Categorias</h3>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{categorias.length - 1}</p>
                </div>
            </div>

            {/* Filtros, Pesquisa e Controles */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Buscar material..."
                            className="pl-10 pr-4 py-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    </div>
                    <div className="flex items-center min-w-[180px]">
                        <span className="mr-2 text-gray-500 dark:text-gray-400">📋</span>
                        <select
                            className="border rounded-md p-2 w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categorias.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Filtro de mês e ano */}
                <div className="flex gap-2 flex-wrap justify-end">
                    <div className="flex items-center">
                        <span className="mr-2 text-gray-500">📅</span>
                        <select
                            className="border rounded-md p-2 dark:bg-gray-800"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        >
                            {meses.map((mes) => (
                                <option key={mes.value} value={mes.value}>
                                    {mes.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-2 text-gray-500">📆</span>
                        <select
                            className="border rounded-md p-2 dark:bg-gray-800"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        >
                            {[2023, 2024, 2025, 2026].map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                        onClick={exportToCSV}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                    <Button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                        onClick={() => setShowAddForm(!showAddForm)}>
                        <ArchiveRestore className="mr-2 h-4 w-4" />
                        {editingMaterial ? "Editar" : "Adicionar"}
                    </Button>
                </div>
            </div>

            {/* Mensagens */}
            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                    {error}
                    <button
                        className="float-right"
                        onClick={() => setError(null)}
                    >
                        ✖
                    </button>
                </div>
            )}

            {success && (
                <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
                    {success}
                    <button
                        className="float-right"
                        onClick={() => setSuccess(null)}
                    >
                        ✖
                    </button>
                </div>
            )}

            {/* Formulário de Adição/Edição */}
            {showAddForm && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 border dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">
                        {editingMaterial ? "Editar Material" : "Adicionar Novo Material"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Categoria *</label>
                            <select
                                className="w-full border rounded-md p-2 bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                value={newMaterial.categoria}
                                onChange={(e) =>
                                    setNewMaterial({ ...newMaterial, categoria: e.target.value })
                                }
                            >
                                {categorias.slice(1).map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nome *</label>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2"
                                value={newMaterial.nome}
                                onChange={(e) =>
                                    setNewMaterial({ ...newMaterial, nome: e.target.value })
                                }
                                placeholder="Nome do material"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Quantidade *</label>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2"
                                value={quantidadeInput}
                                onChange={(e) => {
                                    // Permitir apenas números e decimais
                                    const value = e.target.value.replace(/[^0-9.]/g, '');
                                    setQuantidadeInput(value);
                                }}
                                placeholder="Quantidade"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Unidade *</label>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2"
                                value={newMaterial.unidade}
                                onChange={(e) =>
                                    setNewMaterial({ ...newMaterial, unidade: e.target.value })
                                }
                                placeholder="Unidade (ex: KG, Litro, etc.)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Preço Total *</label>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2"
                                value={precoInput}
                                onChange={(e) => {
                                    // Permitir apenas números e decimais
                                    const value = e.target.value.replace(/[^0-9.]/g, '');
                                    setPrecoInput(value);
                                }}
                                placeholder="Preço total"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fornecedor</label>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2"
                                value={newMaterial.fornecedor || ""}
                                onChange={(e) =>
                                    setNewMaterial({
                                        ...newMaterial,
                                        fornecedor: e.target.value,
                                    })
                                }
                                placeholder="Nome do fornecedor"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingMaterial(null);
                                setNewMaterial({
                                    categoria: "Material de Escritório",
                                    nome: "",
                                    quantidade: 0,
                                    unidade: "",
                                    preco: 0,
                                    dataCriacao: new Date().toISOString(),
                                    fornecedor: "",
                                });
                                setQuantidadeInput("");
                                setPrecoInput("");
                            }}
                            type="button"
                        >
                            Cancelar
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900"
                            onClick={editingMaterial ? handleUpdateMaterial : handleAddMaterial}
                            type="button"
                        >
                            {editingMaterial ? "Atualizar" : "Adicionar"}
                        </button>
                    </div>
                </div>
            )}

            {/* Tabela de materiais */}
            {loading && materiais.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Categoria
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nome
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantidade
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valor Total
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data Cadastro
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedMateriais.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-8 text-center text-gray-500"
                                    >
                                        Nenhum material encontrado neste período
                                    </td>
                                </tr>
                            ) : (
                                paginatedMateriais.map((material) => (
                                    <tr key={material.id}>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="font-medium">{material.categoria}</span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {material.nome}
                                            {material.fornecedor && (
                                                <span className="text-xs text-gray-500 block">
                                                    Fornecedor: {material.fornecedor}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {material.quantidade} {material.unidade}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            R$ {material.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {new Date(material.dataCriacao).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 flex space-x-2 py-4 whitespace-nowrap text-right">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleEditMaterial(material)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.1, opacity: 1 }}
                                                whileTap={{ scale: 0.95 }}
                                                initial={{ opacity: 1 }}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    onClick={() => handleDeleteMaterial(material.id!)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </motion.div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-900">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">
                                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredMateriais.length)} de {filteredMateriais.length} itens
                            </div>
                            <div className="flex space-x-1">
                                <button
                                    className={`px-3 py-1 rounded-md ${currentPage === 1
                                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                        }`}
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    Anterior
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        className={`px-3 py-1 rounded-md ${page === currentPage
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                            }`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    className={`px-3 py-1 rounded-md ${currentPage === totalPages
                                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                        }`}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Próximo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}