
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { db } from '../services/dbService';
import { ChecklistItem, Sector, Task, TaskType } from '../types';
import { IconMap } from '../constants';

export default function ChecklistScreen() {
  const { sectorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sector, setSector] = useState<Sector | null>(null);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<TaskType>(TaskType.ABERTURA);
  const [showPhotoDialog, setShowPhotoDialog] = useState<ChecklistItem | null>(null);
  const [obs, setObs] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!sectorId) return;
      setIsLoading(true);
      
      const allSectors = await db.getSectors();
      const found = allSectors.find(s => s.id === sectorId);
      
      if (!found) {
        navigate('/');
        return;
      }
      
      setSector(found);
      const allTasks = await db.getTasks();
      setTasks(allTasks.filter(t => t.setorId === sectorId));
      
      const dailyItems = await db.generateDailyChecklist(sectorId);
      setChecklists(dailyItems);
      setIsLoading(false);
    };
    loadData();
  }, [sectorId]);

  const toggleItem = async (item: ChecklistItem) => {
    if (item.concluida) {
      if (confirm('Deseja desmarcar esta tarefa?')) {
        const updated = { ...item, concluida: false, concluidaEm: null, usuarioId: null, fotoUrl: null, observacao: null };
        await db.saveChecklist(updated);
        setChecklists(prev => prev.map(c => c.id === item.id ? updated : c));
      }
      return;
    }

    const task = tasks.find(t => t.id === item.tarefaId);
    if (task?.requerFoto) {
      setShowPhotoDialog(item);
      return;
    }

    const updated = { ...item, concluida: true, concluidaEm: new Date().toISOString(), usuarioId: user?.id || '' };
    await db.saveChecklist(updated);
    setChecklists(prev => prev.map(c => c.id === item.id ? updated : c));
  };

  const handlePhotoSave = async () => {
    if (!showPhotoDialog) return;
    const updated = { 
      ...showPhotoDialog, 
      concluida: true, 
      concluidaEm: new Date().toISOString(), 
      usuarioId: user?.id || '',
      observacao: obs,
      fotoUrl: 'https://picsum.photos/400/300'
    };
    await db.saveChecklist(updated);
    setChecklists(prev => prev.map(c => c.id === showPhotoDialog.id ? updated : c));
    setShowPhotoDialog(null);
    setObs('');
  };

  const filteredItems = checklists
    .filter(c => c.tipo === activeTab)
    .map(c => ({ item: c, task: tasks.find(t => t.id === c.tarefaId) }))
    .sort((a, b) => (a.task?.ordem || 0) - (b.task?.ordem || 0));

  const BackIcon = IconMap['back'];
  const CameraIcon = IconMap['camera'];
  const ClockIcon = IconMap['clock'];
  const AlertIcon = IconMap['alert'];

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!sector) return null;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 text-white p-4" style={{ backgroundColor: `#${sector.cor}` }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-black/10 rounded-lg">
            <BackIcon size={24} />
          </button>
          <h1 className="text-xl font-bold">{sector.nome}</h1>
        </div>
      </header>

      <div className="flex border-b sticky top-[64px] bg-white z-10">
        {[TaskType.ABERTURA, TaskType.GERAL, TaskType.FECHAMENTO].map(type => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all border-b-4 ${
              activeTab === type ? 'text-gray-900 border-gray-900' : 'text-gray-400 border-transparent'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <main className="p-4 space-y-3 pb-24">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Nenhuma tarefa para este período hoje.</div>
        ) : (
          filteredItems.map(({ item, task }) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                item.concluida 
                  ? 'bg-green-50 border-green-200 opacity-80' 
                  : 'bg-white border-gray-100 shadow-sm hover:border-red-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                item.concluida ? 'bg-green-500 border-green-500' : 'border-gray-200'
              }`}>
                {item.concluida && <div className="w-4 h-2 border-b-2 border-l-2 border-white -rotate-45 mb-1" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold leading-tight ${item.concluida ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                  {task?.titulo}
                </h3>
                {task?.descricao && <p className="text-xs text-gray-500 mt-1">{task.descricao}</p>}
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {task?.obrigatoria && (
                    <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <AlertIcon size={12} /> OBRIGATÓRIA
                    </span>
                  )}
                  {task?.requerFoto && (
                    <span className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <CameraIcon size={12} /> REQUER FOTO
                    </span>
                  )}
                  {task?.tempoEstimado && (
                    <span className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <ClockIcon size={12} /> {task.tempoEstimado} MIN
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {showPhotoDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 overflow-hidden">
            <h2 className="text-xl font-bold mb-4">Adicionar Evidência</h2>
            <div className="bg-gray-100 aspect-video rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 mb-4 cursor-pointer hover:bg-gray-200">
              <CameraIcon size={48} className="text-gray-400 mb-2" />
              <p className="text-xs text-gray-500 font-medium">Clique para tirar foto</p>
            </div>
            <textarea
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
              rows={3}
              placeholder="Observações (opcional)"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button 
                onClick={() => setShowPhotoDialog(null)}
                className="py-3 rounded-xl font-bold text-gray-500 bg-gray-100"
              >
                CANCELAR
              </button>
              <button 
                onClick={handlePhotoSave}
                className="py-3 rounded-xl font-bold text-white bg-red-500 shadow-lg shadow-red-200"
              >
                SALVAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
