
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog'

export default function ConfiguracoesPage() {
  const [companyName, setCompanyName] = useState('RH Control')
  const [theme, setTheme] = useState('light')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [language, setLanguage] = useState('pt-BR')

  const handleSaveSettings = () => {
    // Lógica para salvar configurações
    console.log('Configurações salvas:', {
      companyName,
      theme,
      notificationsEnabled,
      language
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-gray-600">Personalize seu sistema de RH</p>
      </div>

      {/* Configurações Gerais */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold">Configurações Gerais</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>Nome da Empresa</Label>
            <Input 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Digite o nome da empresa"
            />
          </div>

          <div>
            <Label>Idioma</Label>
            <Select 
              value={language}
              onValueChange={setLanguage}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>Tema</Label>
            <Select 
              value={theme}
              onValueChange={setTheme}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
            <Label>Notificações Habilitadas</Label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings}>
            Salvar Configurações
          </Button>
        </div>
      </div>

      {/* Configurações de Segurança */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold">Configurações de Segurança</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>Nova Senha</Label>
            <Input 
              type="password"
              placeholder="Digite uma nova senha"
            />
          </div>

          <div>
            <Label>Confirmar Nova Senha</Label>
            <Input 
              type="password"
              placeholder="Confirme a nova senha"
            />
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              Redefinir Configurações Padrão
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá redefinir todas as configurações para os valores padrão. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction>Continuar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}