'use client'

import { useState } from 'react'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calculator,
  Save,
  RefreshCcw,
  PlusCircle,
  MinusCircle
} from 'lucide-react'
import Link from 'next/link'

// Dados de exemplo para as configurações
const inssRanges = [
  { id: 1, start: 0, end: 1412.00, rate: 7.5 },
  { id: 2, start: 1412.01, end: 2666.68, rate: 9 },
  { id: 3, start: 2666.69, end: 4000.03, rate: 12 },
  { id: 4, start: 4000.04, end: 7786.02, rate: 14 }
]

const irrfRanges = [
  { id: 1, start: 0, end: 2259.20, rate: 0, deduction: 0 },
  { id: 2, start: 2259.21, end: 2826.65, rate: 7.5, deduction: 169.44 },
  { id: 3, start: 2826.66, end: 3751.05, rate: 15, deduction: 381.44 },
  { id: 4, start: 3751.06, end: 4664.68, rate: 22.5, deduction: 662.77 },
  { id: 5, start: 4664.69, end: Infinity, rate: 27.5, deduction: 896.00 }
]

export default function CalculoSalarioPage() {
  const [activeTab, setActiveTab] = useState("salario")
  const [inssConfig, setInssConfig] = useState(inssRanges)
  const [irrfConfig, setIrrfConfig] = useState(irrfRanges)
  const [hourlyRate, setHourlyRate] = useState(0)
  const [extraHourRate, setExtraHourRate] = useState(50)
  const [nightShiftRate, setNightShiftRate] = useState(20)
  const [fgtsRate, setFgtsRate] = useState(8)
  
  // Calcular valor da hora com base no salário
  const calculateHourlyRate = (monthlySalary: number, hoursPerMonth: number = 220) => {
    return monthlySalary / hoursPerMonth;
  }
  
  // Handler para adicionar nova faixa de INSS
  const addInssRange = () => {
    const lastRange = inssConfig[inssConfig.length - 1];
    const newRange = { 
      id: lastRange.id + 1, 
      start: lastRange.end + 0.01, 
      end: lastRange.end + 1000, 
      rate: lastRange.rate 
    };
    setInssConfig([...inssConfig, newRange]);
  }
  
  // Handler para remover uma faixa de INSS
  const removeInssRange = (id: number) => {
    if (inssConfig.length <= 1) return;
    setInssConfig(inssConfig.filter(range => range.id !== id));
  }
  
  // Handler para adicionar nova faixa de IRRF
  const addIrrfRange = () => {
    const lastRange = irrfConfig[irrfConfig.length - 1];
    const newRange = { 
      id: lastRange.id + 1, 
      start: lastRange.end + 0.01, 
      end: lastRange.end + 1000, 
      rate: lastRange.rate,
      deduction: lastRange.deduction
    };
    setIrrfConfig([...irrfConfig, newRange]);
  }
  
  // Handler para remover uma faixa de IRRF
  const removeIrrfRange = (id: number) => {
    if (irrfConfig.length <= 1) return;
    setIrrfConfig(irrfConfig.filter(range => range.id !== id));
  }
  
  // Handler para salvar todas as configurações
  const saveConfigurations = () => {
    // Aqui você implementaria a lógica para salvar no backend
    alert("Configurações salvas com sucesso!");
  }
  
  // Handler para simular cálculo de salário
  const simulateSalary = () => {
    // Esta seria uma função para simular o cálculo com os valores atuais
    alert("Simulação de cálculo realizada com sucesso!");
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/folha-pagamento">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Cálculo de Salário</h1>
          <p className="text-muted-foreground">Configurações para cálculo automático de salários, horas extras e descontos</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="salario">Salário & Horas</TabsTrigger>
          <TabsTrigger value="inss">INSS</TabsTrigger>
          <TabsTrigger value="irrf">IRRF</TabsTrigger>
          <TabsTrigger value="outros">Outros Descontos</TabsTrigger>
        </TabsList>
        
        {/* Aba de Salário e Horas Extras */}
        <TabsContent value="salario" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Valor/Hora</CardTitle>
              <CardDescription>
                Configure os valores base para cálculos de horas trabalhadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="base-salary" className="text-sm font-medium">
                    Cálculo do valor hora
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Salário base</p>
                      <Input 
                        id="base-salary" 
                        type="number" 
                        min="0"
                        placeholder="Ex: 2000,00" 
                        onChange={(e) => setHourlyRate(calculateHourlyRate(Number(e.target.value)))}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Valor hora</p>
                      <Input 
                        type="text" 
                        readOnly 
                        value={`R$ ${hourlyRate.toFixed(2)}`} 
                        className="bg-muted" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="extra-rate" className="text-sm font-medium">
                      Adicional de Hora Extra (%)
                    </label>
                    <div className="flex items-center">
                      <Input 
                        id="extra-rate" 
                        type="number" 
                        min="0"
                        max="100"
                        value={extraHourRate}
                        onChange={(e) => setExtraHourRate(Number(e.target.value))}
                      />
                      <span className="ml-2">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Exemplo: 50% representa fator de 1.5x</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="night-rate" className="text-sm font-medium">
                      Adicional Noturno (%)
                    </label>
                    <div className="flex items-center">
                      <Input 
                        id="night-rate" 
                        type="number"
                        min="0"
                        max="100" 
                        value={nightShiftRate}
                        onChange={(e) => setNightShiftRate(Number(e.target.value))}
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Jornada de Trabalho Padrão</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Horas por dia</p>
                    <Input type="number" defaultValue="8" min="1" max="24" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Dias por semana</p>
                    <Input type="number" defaultValue="5" min="1" max="7" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Horas por mês</p>
                    <Input type="number" defaultValue="220" readOnly className="bg-muted" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setExtraHourRate(50)}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Restaurar Padrões
              </Button>
              <Button onClick={saveConfigurations}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Simulador de Cálculo</CardTitle>
              <CardDescription>
                Teste os valores configurados para verificar o cálculo automático
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="sim-salary" className="text-sm font-medium">
                    Salário Base
                  </label>
                  <Input id="sim-salary" type="number" placeholder="Ex: 3000,00" />
                </div>
                <div>
                  <label htmlFor="sim-extra" className="text-sm font-medium">
                    Horas Extras
                  </label>
                  <Input id="sim-extra" type="number" placeholder="Ex: 10" />
                </div>
                <div>
                  <label htmlFor="sim-night" className="text-sm font-medium">
                    Horas Noturnas
                  </label>
                  <Input id="sim-night" type="number" placeholder="Ex: 5" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={simulateSalary}>
                <Calculator className="mr-2 h-4 w-4" />
                Simular Cálculo
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Aba de INSS */}
        <TabsContent value="inss" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Alíquotas do INSS</CardTitle>
              <CardDescription>
                Configure as faixas de contribuição para o INSS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faixa</TableHead>
                      <TableHead>Valor Inicial (R$)</TableHead>
                      <TableHead>Valor Final (R$)</TableHead>
                      <TableHead>Alíquota (%)</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inssConfig.map((range, index) => (
                      <TableRow key={range.id}>
                        <TableCell>{index + 1}ª Faixa</TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            value={range.start}
                            onChange={(e) => {
                              const newRanges = [...inssConfig];
                              newRanges[index].start = Number(e.target.value);
                              setInssConfig(newRanges);
                            }}
                            step="0.01"
                            min="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            value={range.end}
                            onChange={(e) => {
                              const newRanges = [...inssConfig];
                              newRanges[index].end = Number(e.target.value);
                              setInssConfig(newRanges);
                            }}
                            step="0.01"
                            min="0"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Input 
                              type="number" 
                              value={range.rate}
                              onChange={(e) => {
                                const newRanges = [...inssConfig];
                                newRanges[index].rate = Number(e.target.value);
                                setInssConfig(newRanges);
                              }}
                              step="0.1"
                              min="0"
                              max="100"
                            />
                            <span className="ml-2">%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeInssRange(range.id)}
                            disabled={inssConfig.length <= 1}
                          >
                            <MinusCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <Button 
                variant="outline" 
                onClick={addInssRange} 
                className="mt-4"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Faixa
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setInssConfig(inssRanges)}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Restaurar Padrões
              </Button>
              <Button onClick={saveConfigurations}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Teto do INSS</CardTitle>
              <CardDescription>
                Valor máximo para desconto de INSS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">R$</span>
                <Input 
                  type="number" 
                  className="max-w-[200px]"
                  defaultValue="7786.02"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Este é o valor máximo de contribuição para o INSS em 2025.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de IRRF */}
        <TabsContent value="irrf" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Alíquotas do IRRF</CardTitle>
              <CardDescription>
                Configure as faixas de contribuição para o Imposto de Renda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faixa</TableHead>
                      <TableHead>Valor Inicial (R$)</TableHead>
                      <TableHead>Valor Final (R$)</TableHead>
                      <TableHead>Alíquota (%)</TableHead>
                      <TableHead>Dedução (R$)</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {irrfConfig.map((range, index) => (
                      <TableRow key={range.id}>
                        <TableCell>
                          {index === 0 ? "Isento" : `${index}ª Faixa`}
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            value={range.start}
                            onChange={(e) => {
                              const newRanges = [...irrfConfig];
                              newRanges[index].start = Number(e.target.value);
                              setIrrfConfig(newRanges);
                            }}
                            step="0.01"
                            min="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            value={range.end !== Infinity ? range.end : ""}
                            placeholder={range.end === Infinity ? "Infinito" : ""}
                            onChange={(e) => {
                              const newRanges = [...irrfConfig];
                              newRanges[index].end = e.target.value === "" ? Infinity : Number(e.target.value);
                              setIrrfConfig(newRanges);
                            }}
                            step="0.01"
                            min="0"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Input 
                              type="number" 
                              value={range.rate}
                              onChange={(e) => {
                                const newRanges = [...irrfConfig];
                                newRanges[index].rate = Number(e.target.value);
                                setIrrfConfig(newRanges);
                              }}
                              step="0.1"
                              min="0"
                              max="100"
                            />
                            <span className="ml-2">%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">R$</span>
                            <Input 
                              type="number" 
                              value={range.deduction}
                              onChange={(e) => {
                                const newRanges = [...irrfConfig];
                                newRanges[index].deduction = Number(e.target.value);
                                setIrrfConfig(newRanges);
                              }}
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeIrrfRange(range.id)}
                            disabled={irrfConfig.length <= 1}
                          >
                            <MinusCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <Button 
                variant="outline" 
                onClick={addIrrfRange} 
                className="mt-4"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Faixa
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIrrfConfig(irrfRanges)}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Restaurar Padrões
              </Button>
              <Button onClick={saveConfigurations}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Dedução por Dependente</CardTitle>
              <CardDescription>
                Valor a ser deduzido da base de cálculo por dependente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">R$</span>
                <Input 
                  type="number" 
                  className="max-w-[200px]"
                  defaultValue="189.59"
                  min="0"
                  step="0.01"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Outros Descontos */}
        <TabsContent value="outros" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>FGTS</CardTitle>
              <CardDescription>
                Configuração do Fundo de Garantia por Tempo de Serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Input 
                  type="number" 
                  className="max-w-[100px]"
                  value={fgtsRate}
                  onChange={(e) => setFgtsRate(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="ml-2">%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                O FGTS é depositado pelo empregador em uma conta vinculada ao trabalhador.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Descontos Adicionais</CardTitle>
              <CardDescription>
                Configure descontos adicionais que podem ser aplicados ao salário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vale Transporte</label>
                <div className="flex items-center">
                  <Input 
                    type="number" 
                    className="max-w-[100px]"
                    defaultValue="6"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span className="ml-2">% do salário bruto</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Limite máximo de desconto do vale transporte é de 6% do salário bruto
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Vale Alimentação/Refeição</label>
                <div className="flex items-center">
                  <Input 
                    type="number" 
                    className="max-w-[120px]"
                    defaultValue="0"
                    min="0"
                    step="0.01"
                  />
                  <span className="ml-2">R$ valor fixo</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Plano de Saúde</label>
                <div className="flex items-center">
                  <Input 
                    type="number" 
                    className="max-w-[120px]"
                    defaultValue="0"
                    min="0"
                    step="0.01"
                  />
                  <span className="ml-2">R$ valor fixo</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveConfigurations}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}