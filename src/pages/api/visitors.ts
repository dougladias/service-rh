import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/api/mongoose";
import Visitors from "@/models/Visitors";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await db;

  switch (req.method) {
    case "GET":
      try {
        const visitors = await Visitors.find({});
        res.status(200).json(visitors);
      } catch (error) {
        console.error("Failed to fetch visitors:", error);
        res.status(500).json({ message: "Failed to fetch visitors" });
      }
      break;
    case "POST":
      try {
        const visitor = new Visitors(req.body);
        await visitor.save();
        res.status(201).json(visitor);
      } catch (error) {
        console.error("Failed to add visitor:", error);
        res.status(500).json({ message: "Failed to add visitor" });
      }
      break;
    case "DELETE":
      try {
        const { id } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID inválido" });
        }
        await Visitors.findByIdAndDelete(id);
        res.status(200).json({ message: "Visitor deleted" });
      } catch (error) {
        console.error("Failed to delete visitor:", error);
        res.status(500).json({ message: "Failed to delete visitor" });
      }
      break;
    case "PUT":
      try {
        const { id, action, update } = req.body;

        // Verificar se o ID é válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID inválido" });
        }

        const visitor = await Visitors.findById(id);

        if (!visitor) {
          return res.status(404).json({ message: "Visitor not found" });
        }

        // Atualizar informações do visitante se houver update
        if (update) {
          Object.assign(visitor, update);
        }

        // Processar ações de entrada/saída
        if (action === "entrada") {
          visitor.logs.push({ entryTime: new Date() });
        } else if (action === "saida") {
          // Verificar se existem logs
          if (!visitor.logs || visitor.logs.length === 0) {
            return res
              .status(400)
              .json({
                message: "Não há registros de entrada para este visitante",
              });
          }

          const lastLog = visitor.logs[visitor.logs.length - 1];

          // Verificar se o último log já tem saída registrada
          if (lastLog.leaveTime) {
            return res
              .status(400)
              .json({
                message: "A saída já foi registrada para este visitante",
              });
          }

          lastLog.leaveTime = new Date();
        }

        await visitor.save();
        res.status(200).json(visitor);
      } catch (error) {
        console.error("Failed to update visitor:", error);
        // Log mais detalhado para depuração
        if (error instanceof Error) {
          console.error("Error details:", error.message);
        }
        res.status(500).json({ message: "Failed to update visitor" });
      }
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
      break;
  }
}
