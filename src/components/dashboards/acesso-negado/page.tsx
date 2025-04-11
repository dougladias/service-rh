"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AcessoNegado() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] p-8 text-center">
      <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Você não possui permissões suficientes para acessar este recurso.
        Por favor, entre em contato com o administrador caso precise deste acesso.
      </p>
      <Button onClick={() => router.push('/dashboard')}>
        Voltar para o Dashboard
      </Button>
    </div>
  );
}