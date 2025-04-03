"use client";

import React, { useState, useEffect } from "react";

// Interface para o tipo Material
interface Material {
  id?: string;
  categoria: string;
  nome: string;
  quantidade: number;
  unidade: string;
  preco: number;
}

// Lista de materiais simulada
const mockMateriais: Material[] = [
  // Materiais de Limpeza
  { id: "1", categoria: "Material de Limpeza", nome: "Detergente Neutro", quantidade: 24, unidade: "Litro", preco: 120.00 },
  { id: "2", categoria: "Material de Limpeza", nome: "Papel Higiênico", quantidade: 50, unidade: "Fardo", preco: 450.00 },
  { id: "3", categoria: "Material de Limpeza", nome: "Desinfetante", quantidade: 15, unidade: "Litro", preco: 85.50 },
  { id: "4", categoria: "Material de Limpeza", nome: "Álcool 70%", quantidade: 30, unidade: "Litro", preco: 180.00 },
  { id: "5", categoria: "Material de Limpeza", nome: "Pano de Chão", quantidade: 20, unidade: "Unidade", preco: 100.00 },
  { id: "6", categoria: "Material de Limpeza", nome: "Sabão em Pó", quantidade: 10, unidade: "Kg", preco: 120.00 },
  { id: "7", categoria: "Material de Limpeza", nome: "Água Sanitária", quantidade: 20, unidade: "Litro", preco: 90.00 },
  { id: "8", categoria: "Material de Limpeza", nome: "Luvas Descartáveis", quantidade: 5, unidade: "Caixa", preco: 125.00 },
  { id: "9", categoria: "Material de Limpeza", nome: "Rodo", quantidade: 8, unidade: "Unidade", preco: 96.00 },
  { id: "10", categoria: "Material de Limpeza", nome: "Vassoura", quantidade: 8, unidade: "Unidade", preco: 88.00 },
  
  // Materiais de Escritório
  { id: "11", categoria: "Material de Escritório", nome: "Papel A4", quantidade: 30, unidade: "Resma", preco: 750.00 },
  { id: "12", categoria: "Material de Escritório", nome: "Caneta Esferográfica", quantidade: 100, unidade: "Unidade", preco: 150.00 },
  { id: "13", categoria: "Material de Escritório", nome: "Grampeador", quantidade: 10, unidade: "Unidade", preco: 200.00 },
  { id: "14", categoria: "Material de Escritório", nome: "Clips", quantidade: 20, unidade: "Caixa", preco: 60.00 },
  { id: "15", categoria: "Material de Escritório", nome: "Post-it", quantidade: 15, unidade: "Pacote", preco: 90.00 },
  { id: "16", categoria: "Material de Escritório", nome: "Grampo", quantidade: 10, unidade: "Caixa", preco: 50.00 },
  { id: "17", categoria: "Material de Escritório", nome: "Marca Texto", quantidade: 30, unidade: "Unidade", preco: 90.00 },
  { id: "18", categoria: "Material de Escritório", nome: "Arquivo Morto", quantidade: 40, unidade: "Unidade", preco: 160.00 },
  { id: "19", categoria: "Material de Escritório", nome: "Pasta Catálogo", quantidade: 15, unidade: "Unidade", preco: 225.00 },
  { id: "20", categoria: "Material de Escritório", nome: "Envelope Pardo", quantidade: 100, unidade: "Unidade", preco: 50.00 },
];
  
  export default function MaterialsPage() {
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
    });
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Simulando carregamento de dados
    useEffect(() => {
      setTimeout(() => {
        setMateriais(mockMateriais);
        setLoading(false);
      }, 1000);
    }, []);
  
    // Funções simuladas de CRUD
    const handleAddMaterial = () => {
      if (!newMaterial.nome || !newMaterial.unidade) {
        setError("Preencha todos os campos obrigatórios");
        return;
      }
  
      const newId = (materiais.length + 1).toString();
      const materialToAdd = { ...newMaterial, id: newId };
  
      setMateriais([...materiais, materialToAdd]);
      setNewMaterial({
        categoria: "Material de Escritório",
        nome: "",
        quantidade: 0,
        unidade: "",
        preco: 0,
      });
      setShowAddForm(false);
      setError(null);
    };
  
    const handleEditMaterial = (material: Material) => {
      setEditingMaterial(material);
      setNewMaterial(material);
      setShowAddForm(true);
    };
  
    const handleUpdateMaterial = () => {
      if (!editingMaterial) return;
  
      const updatedMateriais = materiais.map((mat) =>
        mat.id === editingMaterial.id ? newMaterial : mat
      );
  
      setMateriais(updatedMateriais);
      setEditingMaterial(null);
      setNewMaterial({
        categoria: "Material de Escritório",
        nome: "",
        quantidade: 0,
        unidade: "",
        preco: 0,
      });
      setShowAddForm(false);
    };
  
    const handleDeleteMaterial = (id: string) => {
      const filteredMateriais = materiais.filter((mat) => mat.id !== id);
      setMateriais(filteredMateriais);
    };
    
    // Categorias disponíveis
    const categorias = [
      "Todos",
      "Material de Limpeza",
      "Material de Escritório"
    ];
  
    // Filtrar materiais
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
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestão de Materiais</h1>
  
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-900">Total de Itens</h3>
          <p className="text-2xl font-bold text-blue-700">{totalItems}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg font-medium text-green-900">Valor Total</h3>
          <p className="text-2xl font-bold text-green-700">
            R$ {valorTotalInventario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h3 className="text-lg font-medium text-amber-900">Categorias</h3>
          <p className="text-2xl font-bold text-amber-700">{categorias.length - 1}</p>
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar material..."
              className="pl-10 pr-4 py-2 border rounded-md w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-gray-500">📋</span>
            <select
              className="border rounded-md p-2 w-full"
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
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <span className="mr-2">➕</span>
          {editingMaterial ? "Editar Material" : "Adicionar Material"}
        </button>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Formulário de Adição/Edição */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
          <h2 className="text-xl font-semibold mb-4">
            {editingMaterial ? "Editar Material" : "Adicionar Novo Material"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <select
                className="w-full border rounded-md p-2"
                value={newMaterial.categoria}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, categoria: e.target.value })
                }
              >
                <option value="Material de Limpeza">Material de Limpeza</option>
                <option value="Material de Escritório">Material de Escritório</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
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
              <label className="block text-sm font-medium mb-1">Quantidade</label>
              <input
                type="number"
                className="w-full border rounded-md p-2"
                value={newMaterial.quantidade}
                onChange={(e) =>
                  setNewMaterial({
                    ...newMaterial,
                    quantidade: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Quantidade"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unidade</label>
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
              <label className="block text-sm font-medium mb-1">Preço Total</label>
              <input
                type="number"
                className="w-full border rounded-md p-2"
                value={newMaterial.preco}
                onChange={(e) =>
                  setNewMaterial({
                    ...newMaterial,
                    preco: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Preço total"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
              onClick={() => {
                setShowAddForm(false);
                setEditingMaterial(null);
                setNewMaterial({
                  categoria: "Material de Escritório",
                  nome: "",
                  quantidade: 0,
                  unidade: "",
                  preco: 0,
                });
              }}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={editingMaterial ? handleUpdateMaterial : handleAddMaterial}
            >
              {editingMaterial ? "Atualizar" : "Adicionar"}
            </button>
          </div>
        </div>
      )}

      {/* Tabela de materiais */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMateriais.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Nenhum material encontrado
                  </td>
                </tr>
              ) : (
                filteredMateriais.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium">{material.categoria}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{material.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {material.quantidade} {material.unidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      R$ {material.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            className="text-blue-600 hover:text-blue-900 mx-1"
                            onClick={() => handleEditMaterial(material)}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 mx-1"
                            onClick={() => handleDeleteMaterial(material.id!)}
                          >
                            🗑️ Excluir
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }
