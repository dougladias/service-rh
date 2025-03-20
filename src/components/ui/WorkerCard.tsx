// components/WorkerCard.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XCircleIcon, PencilIcon } from "@heroicons/react/16/solid";
import { IWorker } from "@/models/Worker";

const itemVariants = {
  hidden: {
    opacity: 0,
    x: Math.random() < 0.5 ? -100 : 100,
    y: Math.random() * 40 - 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
    },
  },
};

type ButtonStateMap = Map<
  string,
  { checkInDisabled: boolean; checkOutDisabled: boolean }
>;

interface WorkerCardProps {
  worker: IWorker;
  buttonState: ButtonStateMap;
  onCheckIn: (id: string) => void;
  onCheckOut: (id: string) => void;
  onFaltou: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  buttonState,
  onCheckIn,
  onCheckOut,
  onFaltou,
  onDelete,
  onEdit,
}) => {
  return (
    <>
      <motion.tr
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="border-t border-l border-r border-gray-300"
        layout
      >
        {/* Nome */}
        <td className="py-2 px-4 text-gray-800 border-r border-gray-200">{worker.name}</td>

        {/* Cargo */}
        <td className="py-2 px-4 text-gray-800 border-r border-gray-200">{worker.role}</td>

        {/* Departamento */}
        <td className="py-2 px-4 text-gray-800 border-r border-gray-200">
          {/* Placeholder since departamento is not in IWorker */}
          -
        </td>

        {/* E-mail */}
        <td className="py-2 px-4 text-gray-800 border-r border-gray-200">
          {/* Placeholder since email is not in IWorker */}
          -
        </td>

        {/* Salário */}
        <td className="py-2 px-4 text-gray-800 border-r border-gray-200">
          {/* Placeholder since salary is not in IWorker */}
          -
        </td>

        {/* Status */}
        <td className="py-2 px-4 border-r border-gray-200">
          <span className="inline-block px-2 py-1 text-sm text-green-800 bg-green-100 rounded-full">
            Ativo
          </span>
        </td>

        {/* Ações */}
        <td className="py-2 px-4 flex gap-2">
          <button
            onClick={() => onEdit(worker._id as string)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(worker._id as string)}
            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </td>
      </motion.tr>

      {/* Additional Row for Check-in/Check-out/Faltou and Logs */}
      <tr className="border border-gray-300">
        <td colSpan={7} className="py-2 px-4 bg-gray-50">
          {/* Check-in / Faltou / Check-out */}
          <div className="flex gap-3 mb-3 items-center justify-start">
            <button
              onClick={() => onCheckIn(worker._id as string)}
              disabled={buttonState.get(worker._id as string)?.checkInDisabled}
              className="px-3 py-1.5 rounded-md bg-green-500 hover:bg-green-700 disabled:bg-green-900 text-white text-sm transition-colors"
            >
              Chegada
            </button>
            <button
              onClick={() => onFaltou(worker._id as string)}
              className="px-3 py-1.5 rounded-md bg-yellow-500 hover:bg-yellow-700 text-white text-sm transition-colors"
            >
              Faltou
            </button>
            <button
              onClick={() => onCheckOut(worker._id as string)}
              disabled={buttonState.get(worker._id as string)?.checkOutDisabled}
              className="px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-700 disabled:bg-red-900 text-white text-sm transition-colors"
            >
              Saída
            </button>
          </div>

          {/* Logs with fixed height and scroll */}
          <div
            className="max-h-[90px] overflow-y-auto space-y-1 text-sm text-gray-600 p-2 border border-gray-200 rounded-md bg-white"
            style={{ scrollbarWidth: "thin" }}
          >
            <AnimatePresence>
              {worker.logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between border border-gray-700 rounded p-2"
                >
                  {log.faltou ? (
                    <span className="text-red-500 text-center w-full">
                      ❌ Faltou:{" "}
                      {log.date
                        ? new Date(log.date).toLocaleDateString("pt-BR")
                        : ""}
                    </span>
                  ) : (
                    <>
                      <span>
                        ✅{" "}
                        {log.entryTime
                          ? new Date(log.entryTime).toLocaleString("pt-BR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : ""}
                      </span>
                      {log.leaveTime && (
                        <span>
                          ➡️ Saiu:{" "}
                          {new Date(log.leaveTime).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </td>
      </tr>
      
      {/* Spacer row */}
      <tr className="h-3 bg-gray-100">
        <td colSpan={7}></td>
      </tr>
    </>
  );
};

export default WorkerCard;