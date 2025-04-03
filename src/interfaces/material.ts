// interfaces/material.ts
import { ObjectId } from 'mongodb';

// Interface para o tipo Material
export interface Material {
  id?: string;
  categoria: string;
  nome: string;
  quantidade: number;
  unidade: string;
  preco: number;
  dataCriacao: string;
  fornecedor?: string;
}

// Interface para o documento no MongoDB
export interface MaterialDocument {
  _id?: ObjectId;
  categoria: string;
  nome: string;
  quantidade: number;
  unidade: string;
  preco: number;
  dataCriacao: string;
  fornecedor?: string;
}

// Interface para os dados recebidos do formulário
export interface MaterialInput {
  categoria: string;
  nome: string;
  quantidade: number;
  unidade: string;
  preco: number;
  fornecedor?: string;
}

// Converter documento do MongoDB para Material da aplicação
export function toAppMaterial(doc: MaterialDocument): Material {
  return {
    id: doc._id ? doc._id.toString() : undefined,
    categoria: doc.categoria,
    nome: doc.nome,
    quantidade: doc.quantidade,
    unidade: doc.unidade,
    preco: doc.preco,
    dataCriacao: doc.dataCriacao,
    fornecedor: doc.fornecedor,
  };
}

// Converter Material da aplicação para documento MongoDB
export function toDbMaterial(material: Material): MaterialDocument {
  const dbMaterial: MaterialDocument = {
    categoria: material.categoria,
    nome: material.nome,
    quantidade: material.quantidade,
    unidade: material.unidade,
    preco: material.preco,
    dataCriacao: material.dataCriacao,
    fornecedor: material.fornecedor,
  };

  if (material.id) {
    dbMaterial._id = new ObjectId(material.id);
  }

  return dbMaterial;
}