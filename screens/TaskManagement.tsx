
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/dbService';
import { Task, TaskType, DayOfWeek, Sector } from '../types';
import { IconMap } from '../constants';

export default function TaskManagement() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    setTasks(db.getTasks());
    setSectors(db.getSectors());
  }, []);

  const saveTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dias: DayOfWeek[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].filter(d => formData.get(`dia_${d}`) === 'on') as DayOfWeek[];
    
    const task: Task = {
      id: editingTask?.id || crypto.randomUUID(),
      setorId: formData.get('setorId') as string,
      tipo: formData.get('tipo') as TaskType,
      titulo: formData.get('titulo') as string,
      descricao: formData.get('descricao') as string,
      ordem: parseInt(formData.get('ordem') as string) || 0,
      obrigatoria: formData.get('obrigatoria') === 'on',
      requerFoto: formData.get('requerFoto') === 'on',
      tempoEstimado: parseInt(formData.get('tempoEstimado') as string) || undefined,
      diasSemana: dias
    };

    db.saveTask(task);
    setTasks(db.getTasks());
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const BackIcon = IconMap['back'];
  const PlusIcon = IconMap['plus'];
  const TrashIcon = IconMap['trash'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 text-gray-400 hover:text-red-500 rounded-full">
            <BackIcon size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Gerenciar Tarefas</h1>
        </div>
        <button 
          onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
          className="bg-red-500 text-white p-2 rounded-xl shadow-lg"
        >
          <PlusIcon size={24} />
        </button>
      </header>

      <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-4">
        {tasks.map((t) => {
          const sector = sectors.find(s => s.id === t.setorId);
          return (
            <div key={t.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase">
                    {sector?.nome}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    t.tipo === TaskType.ABERTURA ? 'bg-blue-100 text-blue-600' : 
                    t.tipo === TaskType.FECHAMENTO ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {t.tipo}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{t.titulo}</h3>
                <p className="text-sm text-gray-400">{t.diasSemana.join(', ')}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingTask(t); setIsModalOpen(true); }}
                  className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 hover:text-blue-500"
                >
                  Editar
                </button>
                <button 
                  onClick={() => { db.deleteTask(t.id); setTasks(db.getTasks()); }}
                  className="bg-gray-100 text-gray-500 p-2 rounded-xl hover:bg-red-50 hover:text-red-500"
                >
                  <TrashIcon size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={saveTask} className="bg-white rounded-3xl w-full max-w-2xl p-6 space-y-4 my-8">
            <h2 className="text-xl font-bold">{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <input name="titulo" placeholder="Título da Tarefa" required defaultValue={editingTask?.titulo} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                <textarea name="descricao" placeholder="Descrição/Instruções" defaultValue={editingTask?.descricao} className="w-full p-3 rounded-xl border border-gray-200 outline-none" rows={3} />
                
                <div className="grid grid-cols-2 gap-3">
                  <select name="setorId" required defaultValue={editingTask?.setorId || ''} className="p-3 rounded-xl border border-gray-200 outline-none text-sm">
                    <option value="" disabled>Selecione o Setor</option>
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                  <select name="tipo" required defaultValue={editingTask?.tipo || TaskType.GERAL} className="p-3 rounded-xl border border-gray-200 outline-none text-sm">
                    <option value={TaskType.ABERTURA}>Abertura</option>
                    <option value={TaskType.GERAL}>Geral</option>
                    <option value={TaskType.FECHAMENTO}>Fechamento</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase">Dias da Semana</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].map(d => (
                      <label key={d} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" name={`dia_${d}`} defaultChecked={editingTask?.diasSemana.includes(d as DayOfWeek)} className="w-4 h-4 rounded text-red-500" />
                        <span className="text-xs font-bold text-gray-600 uppercase">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="flex items-center justify-between p-3 bg-red-50 rounded-xl cursor-pointer">
                    <span className="text-sm font-bold text-red-700">Obrigatória?</span>
                    <input type="checkbox" name="obrigatoria" defaultChecked={editingTask?.obrigatoria} className="w-5 h-5" />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-blue-50 rounded-xl cursor-pointer">
                    <span className="text-sm font-bold text-blue-700">Requer Foto?</span>
                    <input type="checkbox" name="requerFoto" defaultChecked={editingTask?.requerFoto} className="w-5 h-5" />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input name="ordem" type="number" placeholder="Ordem" defaultValue={editingTask?.ordem} className="p-3 rounded-xl border border-gray-200 outline-none text-sm" />
                  <input name="tempoEstimado" type="number" placeholder="Minutos" defaultValue={editingTask?.tempoEstimado} className="p-3 rounded-xl border border-gray-200 outline-none text-sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button type="button" onClick={() => setIsModalOpen(false)} className="py-3 rounded-xl font-bold text-gray-500 bg-gray-100">CANCELAR</button>
              <button type="submit" className="py-3 rounded-xl font-bold text-white bg-red-500">SALVAR TAREFA</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
