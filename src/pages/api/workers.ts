// src/pages/api/workers.ts

import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import Worker from "@/models/Worker";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoose.connect(process.env.MONGODB_URI as string);

  switch (req.method) {
    case "GET":
      try {
        const workers = await Worker.find();
        res.status(200).json(workers);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch workers", error });
      }
      break;

    case "POST":
      try {
        const {
          name,
          cpf,
          nascimento,
          admissao,
          salario,
          ajuda,
          numero,
          email,
          address,
          contract, // Agora recebe "CLT" ou "PJ" do select
          role,
        } = req.body;

        // Valide o tipo de contrato explicitamente
        const validContract = contract === "CLT" || contract === "PJ" ? contract : "CLT";

        const worker = new Worker({
          name,
          cpf,
          nascimento,
          admissao,
          salario,
          ajuda,
          numero,
          email,
          address,
          contract: validContract, // Salva o valor validado
          role,
          logs: [],
        });

        await worker.save();
        res.status(201).json(worker);
      } catch (error) {
        console.error("Error creating worker:", error);
        res.status(500).json({ message: "Failed to add worker", error });
      }
      break;

    case "PUT":
      try {
        const { id, action, updates } = req.body;
        
        // Logando para debug
        console.log("PUT request received:", { id, action, updates });
        
        const worker = await Worker.findById(id);
        if (!worker) {
          console.error("Worker not found:", id);
          return res.status(404).json({ message: "Worker not found" });
        }

        if (action === "entrada") {
          worker.logs.push({ entryTime: new Date() });
        } else if (action === "saida") {
          const lastLog = worker.logs[worker.logs.length - 1];
          if (lastLog && !lastLog.leaveTime) {
            lastLog.leaveTime = new Date();
          }
        } else if (action === "faltou") {
          worker.logs.push({ faltou: true, date: new Date() });
        } else if (updates) {
          // Verificamos explicitamente o tipo de contrato
          if (updates.contract) {
            // Garantimos que o contrato seja apenas CLT ou PJ
            const validContract = updates.contract === "CLT" || updates.contract === "PJ" 
              ? updates.contract 
              : "CLT";
            
            worker.contract = validContract;
            console.log("Contract updated to:", validContract);
            
            // Remova o contrato de updates para evitar atualização dupla
            delete updates.contract;
          }
          
          // Atualize os outros campos
          Object.assign(worker, updates);
        }

        // Salve as alterações
        const updatedWorker = await worker.save();
        console.log("Worker updated successfully:", updatedWorker.contract);
        
        res.status(200).json(updatedWorker);
      } catch (error) {
        console.error("Error updating worker:", error);
        res.status(500).json({ message: "Failed to update worker", error });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.body;
        await Worker.findByIdAndDelete(id);
        res.status(200).json({ message: "Funcionário deletado." });
      } catch (error) {
        res.status(500).json({ message: "Failed to delete worker", error });
      }
      break;

    default:
      res.status(405).json({ message: "Method not allowed" });
  }
}