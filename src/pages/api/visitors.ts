import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/api/mongoose';
import Visitors from '@/models/Visitors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await db;

  switch (req.method) {
    case 'GET':
      try {
        const visitors = await Visitors.find({});
        res.status(200).json(visitors);
      } catch (error) {
        console.error('Failed to fetch visitors:', error);
        res.status(500).json({ message: 'Failed to fetch visitors'});
      }
      break;
    case 'POST':
      try {
        const visitor = new Visitors(req.body);
        await visitor.save();
        res.status(201).json(visitor);
      } catch (error) {
        console.error('Failed to add visitor:', error);
        res.status(500).json({ message: 'Failed to add visitor'});
      }
      break;
    case 'DELETE':
      try {
        const { id } = req.body;
        await Visitors.findByIdAndDelete(id);
        res.status(200).json({ message: 'Visitor deleted' });
      } catch (error) {
        console.error('Failed to delete visitor:', error);
        res.status(500).json({ message: 'Failed to delete visitor'});
      }
      break;
    case 'PUT':
      try {
        const { id, action } = req.body;
        const visitor = await Visitors.findById(id);
        if (!visitor) {
          return res.status(404).json({ message: 'Visitor not found' });
        }
        if (action === 'entrada') {
          visitor.logs.push({ entryTime: new Date() });
        } else if (action === 'saida') {
          const lastLog = visitor.logs[visitor.logs.length - 1];
          if (lastLog && !lastLog.leaveTime) {
            lastLog.leaveTime = new Date();
          }
        }
        await visitor.save();
        res.status(200).json(visitor);
      } catch (error) {
        console.error('Failed to update visitor:', error);
        res.status(500).json({ message: 'Failed to update visitor'});
      }
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}