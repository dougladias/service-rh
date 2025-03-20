import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/api/mongoose';
import Prestadores from '@/models/Prestadores';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await db;

  switch (req.method) {
    case 'GET':
      try {
        const prestadores = await Prestadores.find({});
        res.status(200).json(prestadores);
      } catch (error) {
        console.error('Failed to fetch prestadores:', error);
        res.status(500).json({ message: 'Failed to fetch prestadores'});
      }
      break;
    case 'POST':
      try {
        const prestador = new Prestadores(req.body);
        await prestador.save();
        res.status(201).json(prestador);
      } catch (error) {
        console.error('Failed to add prestador:', error);
        res.status(500).json({ message: 'Erro ao adicionar prestador'});
      }
      break;
    case 'DELETE':
      try {
        const { id } = req.body;
        await Prestadores.findByIdAndDelete(id);
        res.status(200).json({ message: 'Prestador de serviços deletado.' });
      } catch (error) {
        console.error('Failed to delete prestador:', error);
        res.status(500).json({ message: 'Failed to delete prestador'});
      }
      break;
    case 'PUT':
      try {
        const { id, action } = req.body;
        const prestador = await Prestadores.findById(id);
        if (!prestador) {
          return res.status(404).json({ message: 'Prestador not found' });
        }
        if (action === 'entrada') {
          prestador.logs.push({ entryTime: new Date() });
        } else if (action === 'saida') {
          const lastLog = prestador.logs[prestador.logs.length - 1];
          if (lastLog && !lastLog.leaveTime) {
            lastLog.leaveTime = new Date();
          }
        }
        await prestador.save();
        res.status(200).json(prestador);
      } catch (error) {
        console.error('Failed to update prestador:', error);
        res.status(500).json({ message: 'Failed to update prestador'});
      }
      break;
    default:
      res.status(405).end();
  }
}