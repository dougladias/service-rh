
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Adicione esta função de classe condicional
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

  // Adicione esta função de formatação de moeda
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}
