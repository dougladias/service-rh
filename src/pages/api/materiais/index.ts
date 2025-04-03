// pages/api/materiais/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import { Material, MaterialInput, MaterialDocument, toAppMaterial } from '@/interfaces/material';

type ResponseData = {
  error?: string;
  message?: string;
} | Material | Material[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Obtém a conexão com o banco de dados
  const db = await connectToDatabase();
  
  // Manipula requisições GET (listar materiais)
  if (req.method === 'GET') {
    try {
      // Recupera os materiais da coleção "materiais" no MongoDB
      const materiaisDoc = await db.collection('materiais').find({}).toArray();
      
      // Converte documentos do MongoDB para o formato da aplicação    
    const materiais: Material[] = materiaisDoc.map((doc) => toAppMaterial(doc as MaterialDocument));
      
      // Retorna os materiais com código 200 (sucesso)
      res.status(200).json(materiais);
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
      res.status(500).json({ error: 'Falha ao buscar materiais' });
    }
  }
  
  // Manipula requisições POST (criar novo material)
  else if (req.method === 'POST') {
    try {
      // Extrai os dados do corpo da requisição
      const materialInput = req.body as MaterialInput;
      
      // Valida campos obrigatórios
      if (!materialInput.nome || !materialInput.categoria || !materialInput.unidade) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
      }
      
      // Prepara o material para inserção
      const materialToAdd = {
        ...materialInput,
        quantidade: Number(materialInput.quantidade) || 0,
        preco: Number(materialInput.preco) || 0,
        dataCriacao: new Date().toISOString(),
        fornecedor: materialInput.fornecedor || "",
      };
      
      // Insere o material na coleção
      const result = await db.collection('materiais').insertOne(materialToAdd);
      
      // Retorna o material criado com seu ID
      res.status(201).json({ 
        ...materialToAdd, 
        id: result.insertedId.toString() 
      });
    } catch (error) {
      console.error('Erro ao adicionar material:', error);
      res.status(500).json({ error: 'Falha ao adicionar material' });
    }
  }
  
  // Retorna erro para métodos não suportados
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}