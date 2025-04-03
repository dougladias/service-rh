// pages/api/materiais/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import { ObjectId } from 'mongodb';
import { Material, MaterialInput, toAppMaterial, MaterialDocument } from '@/interfaces/material';

type ResponseData = {
  error?: string;
  message?: string;
} | Material;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { id } = req.query;
  
  // Validar o ID
  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  const db = await connectToDatabase();
  
  // Manipula requisições PUT (atualizar material)
  if (req.method === 'PUT') {
    try {
      const materialInput = req.body as MaterialInput;
      
      // Valida campos obrigatórios
      if (!materialInput.nome || !materialInput.categoria || !materialInput.unidade) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
      }
      
      // Prepara o material atualizado
      const updatedMaterial = {
        categoria: materialInput.categoria,
        nome: materialInput.nome,
        quantidade: Number(materialInput.quantidade) || 0,
        unidade: materialInput.unidade,
        preco: Number(materialInput.preco) || 0,
        fornecedor: materialInput.fornecedor || "",
      };
      
      // Atualiza o material no banco
      const result = await db.collection('materiais').updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedMaterial }
      );
      
      // Verifica se o material foi encontrado
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }
      
      // Retorna o material atualizado
      res.status(200).json({ ...updatedMaterial, id, dataCriacao: new Date().toISOString() });
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
      res.status(500).json({ error: 'Falha ao atualizar material' });
    }
  }
  
  // Manipula requisições DELETE (excluir material)
  else if (req.method === 'DELETE') {
    try {
      // Exclui o material do banco
      const result = await db.collection('materiais').deleteOne(
        { _id: new ObjectId(id) }
      );
      
      // Verifica se o material foi encontrado
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }
      
      // Retorna sucesso
      res.status(200).json({ message: 'Material excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      res.status(500).json({ error: 'Falha ao excluir material' });
    }
  }
  
  // Manipula requisições GET (obter material específico)
  else if (req.method === 'GET') {
    try {
      // Busca o material pelo ID
      const materialDoc = await db.collection('materiais').findOne(
        { _id: new ObjectId(id) }
      );
      
      // Verifica se o material foi encontrado
      if (!materialDoc) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }
      
      // Retorna o material
      res.status(200).json(toAppMaterial(materialDoc as MaterialDocument));
    } catch (error) {
      console.error('Erro ao buscar material:', error);
      res.status(500).json({ error: 'Falha ao buscar material' });
    }
  }
  
  // Retorna erro para métodos não suportados
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}