
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/dbService';
import { Sector } from '../types';
import { IconMap } from '../constants';

export default function SectorManagement() {
  const navigate = useNavigate();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);

  useEffect(() => {
    setSectors(db.getSectors());
  }, []);

  const saveSector = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const sector: Sector = {
      id: editingSector?.id || crypto.randomUUID(),
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string,
      cor: formData.get('cor') as string,
      icone: formData.get('icone') as string,
      ordem: parseInt(formData.get('ordem') as string) || sectors.length + 1,
      createdAt: editingSector?.createdAt || new Date().toISOString(),
    };
    db.saveSector(sector);
    setSectors(db.getSectors());
    setIsModalOpen(false);
    setEditingSector(null);
  };

  const deleteSector = (id: string) => {
    if (confirm('Tem certeza? Isso pode afetar tarefas e usuários vinculados.')) {
      db.deleteSector(id);
      setSectors(db.getSectors());
    }
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
          <h1 className="text-xl font-bold text-gray-800">Gerenciar Setores</h1>
        </div>
        <button 
          onClick={() => { setEditingSector(null); setIsModalOpen(true); }}
          className="bg-red-500 text-white p-2 rounded-xl shadow-lg shadow-red-100"
        >
          <PlusIcon size={24} />
        </button>
      </header>

      <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
        {sectors.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: `#${s.cor}` }}>
                {React.createElement(IconMap[s.icone] || IconMap['restaurant'], { size: 24 })}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{s.nome}</h3>
                <p className="text-xs text-gray-400">Ordem: {s.ordem}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { setEditingSector(s); setIsModalOpen(true); }}
                className="p-2 text-gray-400 hover:text-blue-500"
              >
                Editar
              </button>
              <button onClick={() => deleteSector(s.id)} className="p-2 text-gray-400 hover:text-red-500">
                <TrashIcon size={20} />
              </button>
            </div>
          </div>
        ))}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={saveSector} className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold">{editingSector ? 'Editar Setor' : 'Novo Setor'}</h2>
            
            <div className="space-y-3">
              <input name="nome" placeholder="Nome do Setor" required defaultValue={editingSector?.nome} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
              <input name="descricao" placeholder="Descrição" defaultValue={editingSector?.descricao} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 ml-1">COR (HEX)</label>
                  <input name="cor" placeholder="FF6B6B" required defaultValue={editingSector?.cor} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 ml-1">ÍCONE</label>
                  <select name="icone" defaultValue={editingSector?.icone || 'restaurant'} className="w-full p-3 rounded-xl border border-gray-200 outline-none">
                    <option value="restaurant">Utensílios</option>
                    <option value="local_pizza">Pizza</option>
                    <option value="table_restaurant">Salão</option>
                    <option value="coffee">Café</option>
                    <option value="cake">Sobremesa</option>
                  </select>
                </div>
              </div>
              <input name="ordem" type="number" placeholder="Ordem de Exibição" defaultValue={editingSector?.ordem} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button type="button" onClick={() => setIsModalOpen(false)} className="py-3 rounded-xl font-bold text-gray-500 bg-gray-100">CANCELAR</button>
              <button type="submit" className="py-3 rounded-xl font-bold text-white bg-red-500">SALVAR</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
