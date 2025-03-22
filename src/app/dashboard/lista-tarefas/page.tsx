
'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Check, Clock, AlertTriangle, AlertCircle, Trash2, Edit, Save, X } from 'lucide-react';

// Tipos
type Priority = 'baixa' | 'normal' | 'alta' | 'urgente';

interface Todo {
  id: string;
  title: string;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

// Dados mockados para exemplo
const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Preparar folha de pagamento de abril',
    priority: 'alta',
    dueDate: '2025-04-05',
    completed: false,
    createdAt: '2025-03-20T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'Revisar documentação de novos funcionários',
    priority: 'normal',
    dueDate: '2025-03-25',
    completed: false,
    createdAt: '2025-03-20T11:30:00.000Z',
  },
  {
    id: '3',
    title: 'Agendar entrevistas para vaga de marketing',
    priority: 'urgente',
    dueDate: '2025-03-23',
    completed: false,
    createdAt: '2025-03-19T14:00:00.000Z',
  },
  {
    id: '4',
    title: 'Atualizar planilha de benefícios',
    priority: 'baixa',
    dueDate: null,
    completed: true,
    createdAt: '2025-03-18T09:15:00.000Z',
  },
];

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  // Form states
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [dueDate, setDueDate] = useState('');
  
  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState('');
  const [editTask, setEditTask] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('normal');
  const [editDueDate, setEditDueDate] = useState('');

  useEffect(() => {
    // Aqui você carregaria os dados do seu backend
    setTodos(mockTodos);
  }, []);

  // Funções para o formulário de adição
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task.trim()) return;
    
    try {
      // Gerar um ID único para a nova tarefa
      const newId = Math.random().toString(36).substring(2, 9);
      
      const newTask: Todo = {
        id: newId,
        title: task,
        priority,
        dueDate: dueDate || null,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      
      setTodos([newTask, ...todos]);
      
      // Reset form
      setTask('');
      setPriority('normal');
      setDueDate('');
      
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    }
  };

  // Funções para manipulação de tarefas
  const toggleStatus = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEdit = (todo: Todo) => {
    setEditMode(true);
    setEditId(todo.id);
    setEditTask(todo.title);
    setEditPriority(todo.priority);
    setEditDueDate(todo.dueDate || '');
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditId('');
    setEditTask('');
    setEditPriority('normal');
    setEditDueDate('');
  };

  const saveEdit = () => {
    if (!editTask.trim()) return;
    
    setTodos(todos.map(todo => 
      todo.id === editId
        ? { 
            ...todo, 
            title: editTask,
            priority: editPriority,
            dueDate: editDueDate || null
          }
        : todo
    ));
    
    cancelEdit();
  };

  // Helper functions
  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'baixa':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'normal':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'alta':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'urgente':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Lista de Tarefas</h1>
      </div>
      
      {/* Formulário para adicionar nova tarefa */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Adicionar nova tarefa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição da tarefa
            </label>
            <input
              type="text"
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite a tarefa..."
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data de vencimento
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Tarefa
          </button>
        </form>
      </div>
      
      {/* Lista de tarefas */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Suas tarefas</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
              >
                Todas
              </button>
              <button 
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 text-sm rounded-md ${filter === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
              >
                Pendentes
              </button>
              <button 
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 text-sm rounded-md ${filter === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
              >
                Concluídas
              </button>
            </div>
          </div>
        </div>
        
        <ul className="divide-y divide-gray-200">
          {filteredTodos.length === 0 ? (
            <li className="p-4 text-center text-gray-500">Nenhuma tarefa encontrada</li>
          ) : (
            filteredTodos.map((todo) => {
              const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
              const isEditing = editMode && editId === todo.id;
              
              if (isEditing) {
                return (
                  <li key={todo.id} className="p-4 bg-blue-50">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTask}
                        onChange={(e) => setEditTask(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Descrição da tarefa"
                        required
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value as Priority)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="baixa">Baixa</option>
                          <option value="normal">Normal</option>
                          <option value="alta">Alta</option>
                          <option value="urgente">Urgente</option>
                        </select>
                        
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={cancelEdit}
                          className="flex items-center justify-center rounded-md bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          <X className="mr-1 h-4 w-4" />
                          Cancelar
                        </button>
                        <button
                          onClick={saveEdit}
                          className="flex items-center justify-center rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <Save className="mr-1 h-4 w-4" />
                          Salvar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              }
              
              return (
                <li key={todo.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => toggleStatus(todo.id)}
                        className={`flex-shrink-0 h-5 w-5 rounded-full border ${
                          todo.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300'
                        } flex items-center justify-center`}
                      >
                        {todo.completed && <Check className="h-3 w-3 text-white" />}
                      </button>
                      
                      <div>
                        <p className={`text-sm font-medium ${
                          todo.completed ? 'text-gray-400 line-through' : 'text-gray-900'
                        }`}>
                          {todo.title}
                        </p>
                        
                        <div className="mt-1 flex items-center space-x-2 text-xs">
                          <span className="inline-flex items-center">
                            {getPriorityIcon(todo.priority)}
                            <span className="ml-1 text-gray-500 capitalize">{todo.priority}</span>
                          </span>
                          
                          {todo.dueDate && (
                            <span className={`inline-flex items-center ${
                              isOverdue ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              <Clock className="mr-1 h-3 w-3" />
                              {new Date(todo.dueDate).toLocaleDateString('pt-BR')}
                              {isOverdue && ' (Atrasada)'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(todo)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}