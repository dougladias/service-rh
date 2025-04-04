'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from './button';

interface Compromisso {
  id: string;
  titulo: string;
  data: string;
  hora: string;
  tipo: string;
  concluido: boolean;
}

interface AgendaCalendarProps {
  compromissos: Compromisso[];
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
}

export const AgendaCalendar: React.FC<AgendaCalendarProps> = ({
  compromissos,
  onDateSelect,
  selectedDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Navegar para mês anterior
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Navegar para próximo mês
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Gerar array de dias para o mês atual
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const dateFormat = "d";
  const rows = [];
  
  // Dias da semana
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Formatar a data no formato YYYY-MM-DD
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Verificar se um dia tem compromissos
  const getDayCompromissos = (date: Date) => {
    return compromissos.filter(comp => {
      try {
        return isSameDay(parseISO(comp.data), date);
      } catch {
        return false;
      }
    });
  };
  
  // Gerar dias do calendário
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  let days_array = [];
  
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const formattedDate = format(day, dateFormat);
    const dayStr = formatDateToString(day);
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isToday = isSameDay(day, new Date());
    const isSelected = selectedDate === dayStr;
    const dayCompromissos = getDayCompromissos(day);
    const hasConcluido = dayCompromissos.some(comp => comp.concluido);
    const hasAtrasado = dayCompromissos.some(comp => !comp.concluido && new Date(`${comp.data}T${comp.hora}`) < new Date());
    const hasCompromisso = dayCompromissos.length > 0;
    
    days_array.push(
      <div
        key={day.toString()}
        className={`relative py-2 px-3 text-center cursor-pointer transition-colors duration-200 ${
          !isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 
          isToday ? 'font-bold' : 'text-gray-900 dark:text-gray-300'
        } ${
          isSelected ? 'bg-blue-100 dark:bg-blue-900/30 rounded-md' : 
          hasCompromisso && isCurrentMonth ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 
          isCurrentMonth ? 'hover:bg-gray-50 dark:hover:bg-gray-900/20' : ''
        }`}
        onClick={() => onDateSelect && onDateSelect(dayStr)}
      >
        <span className="text-sm">{formattedDate}</span>
        
        {hasCompromisso && isCurrentMonth && (
          <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 flex items-center space-x-1">
            {hasAtrasado && (
              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            )}
            {!hasAtrasado && !hasConcluido && (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            )}
            {hasConcluido && (
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
            )}
          </div>
        )}
      </div>
    );
    
    if ((i + 1) % 7 === 0) {
      rows.push(
        <div key={`row-${i}`} className="grid grid-cols-7 gap-1">
          {days_array}
        </div>
      );
      days_array = [];
    }
  }
  
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentMonth(new Date())}
          >
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-1">
        {diasSemana.map((dia) => (
          <div key={dia} className="py-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
            {dia}
          </div>
        ))}
      </div>
      
      <div className="space-y-1">
        {rows}
      </div>
    </motion.div>
  );
};