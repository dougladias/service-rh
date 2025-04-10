'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Check, Clock, AlertTriangle, AlertCircle, Trash2, Edit, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function TodoPage() {
  // Estado para controlar se o componente está no cliente
  const [isClient, setIsClient] = useState(false);

  // Efeito para definir isClient como true quando estiver no navegador
  useEffect(() => {
    setIsClient(true);
  }, []);
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

  // Carregar tarefas do localStorage na inicialização - usando isClient para evitar erros com SSR
  useEffect(() => {
    // Só executa quando isClient for true (componente montado no navegador)
    if (isClient) {
      const savedTodos = localStorage.getItem('todos');
      console.log('Carregando do localStorage:', savedTodos);

      if (savedTodos) {
        try {
          const parsedTodos = JSON.parse(savedTodos);
          setTodos(parsedTodos);
          console.log('Tarefas carregadas com sucesso:', parsedTodos.length, 'tarefas');
        } catch (error) {
          console.error('Erro ao carregar tarefas do localStorage:', error);
          setTodos([]);
        }
      }
    }
  }, [isClient]); // Dependência de isClient garante que só executa no cliente

  // Salvar tarefas no localStorage sempre que forem atualizadas
  useEffect(() => {
    // Só salva quando isClient for true e não for a primeira renderização
    if (isClient && todos.length > 0) {
      console.log('Salvando no localStorage:', todos.length, 'tarefas');
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, isClient]); // Adiciona isClient como dependência

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
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);

    // Atualizar o localStorage após a exclusão
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
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
        return <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold tracking-tight dark:text-gray-200">Lista de Tarefas</h1>
      </motion.div>

      {/* Formulário para adicionar nova tarefa */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6 rounded-lg shadow"
      >
        <h2 className="text-lg font-medium mb-4 dark:text-gray-200">Adicionar nova tarefa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição da tarefa
            </label>
            <input
              type="text"
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Digite a tarefa..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridade
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data de vencimento
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex items-center justify-center rounded-md bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Tarefa
          </motion.button>
        </form>
      </motion.div>

      {/* Lista de tarefas */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-black dark:text-gray-200">Suas tarefas</h2>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-md ${filter === 'all'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-black dark:text-gray-300'
                  }`}
              >
                Todas
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 text-sm rounded-md ${filter === 'pending'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-black dark:text-gray-300'
                  }`}
              >
                Pendentes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 text-sm rounded-md ${filter === 'completed'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-black dark:text-gray-300'
                  }`}
              >
                Concluídas
              </motion.button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTodos.length === 0 ? (
              <motion.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 text-center text-gray-500 dark:text-gray-400"
              >
                Nenhuma tarefa encontrada
              </motion.li>
            ) : (
              filteredTodos.map((todo, index) => {
                const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
                const isEditing = editMode && editId === todo.id;

                if (isEditing) {
                  return (
                    <motion.li
                      key={todo.id}
                      initial={{ backgroundColor: "rgba(239, 246, 255, 0)" }}
                      animate={{ backgroundColor: "rgba(239, 246, 255, 0.5)" }}
                      className="p-4 bg-blue-50 dark:bg-blue-900/20"
                    >
                      <div className="space-y-3 dark:bg-gray-800 rounded-xl p-3">
                        <input
                          type="text"
                          value={editTask}
                          onChange={(e) => setEditTask(e.target.value)}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                          placeholder="Descrição da tarefa"
                          required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as Priority)}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
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
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={cancelEdit}
                            className="flex items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            <X className="mr-1 h-4 w-4" />
                            Cancelar
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={saveEdit}
                            className="flex items-center justify-center rounded-md bg-blue-600 dark:bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <Save className="mr-1 h-4 w-4" />
                            Salvar
                          </motion.button>
                        </div>
                      </div>
                    </motion.li>
                  );
                }

                return (
                  <motion.li
                    key={todo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.05 }
                    }}
                    whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.5)" }}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleStatus(todo.id)}
                          className={`flex-shrink-0 h-5 w-5 rounded-full border ${todo.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 dark:border-gray-600'
                            } flex items-center justify-center`}
                        >
                          {todo.completed && <Check className="h-3 w-3 text-white" />}
                        </motion.button>

                        <div>
                          <p className={`text-sm font-medium ${todo.completed
                              ? 'text-gray-400 line-through dark:text-gray-500'
                              : 'text-gray-900 dark:text-gray-300'
                            }`}>
                            {todo.title}
                          </p>

                          <div className="mt-1 flex items-center space-x-2 text-xs">
                            <span className="inline-flex items-center">
                              {getPriorityIcon(todo.priority)}
                              <span className="ml-1 text-gray-500 dark:text-gray-400 capitalize">{todo.priority}</span>
                            </span>

                            {todo.dueDate && (
                              <span className={`inline-flex items-center ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
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
                        <motion.button
                          whileHover={{ scale: 1.1, color: "rgb(59, 130, 246)" }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => startEdit(todo)}
                          className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, color: "rgb(239, 68, 68)" }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteTodo(todo.id)}
                          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.li>
                );
              })
            )}
          </ul>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}