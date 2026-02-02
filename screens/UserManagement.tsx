
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/dbService';
import { User, UserRole, Sector } from '../types';
import { IconMap } from '../constants';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    setUsers(db.getUsers());
    setSectors(db.getSectors());
  }, []);

  const saveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const user: User = {
      id: editingUser?.id || crypto.randomUUID(),
      nome: formData.get('nome') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as UserRole,
      setorId: formData.get('setorId') as string || undefined,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
    };
    db.saveUser(user);
    setUsers(db.getUsers());
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const deleteUser = (id: string) => {
    if (id === localStorage.getItem('current_user_id')) {
      alert("Você não pode excluir a si mesmo!");
      return;
    }
    if (confirm('Deseja realmente excluir este usuário?')) {
      db.deleteUser(id);
      setUsers(db.getUsers());
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
          <h1 className="text-xl font-bold text-gray-800">Gerenciar Usuários</h1>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="bg-red-500 text-white p-2 rounded-xl shadow-lg"
        >
          <PlusIcon size={24} />
        </button>
      </header>

      <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
        {users.map((u) => {
          const sector = sectors.find(s => s.id === u.setorId);
          return (
            <div key={u.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 uppercase">
                  {u.nome.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{u.nome}</h3>
                  <div className="flex gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      u.role === UserRole.GESTOR ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {u.role}
                    </span>
                    {sector && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase">
                        {sector.nome}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingUser(u); setIsModalOpen(true); }}
                  className="p-2 text-gray-400 hover:text-blue-500"
                >
                  Editar
                </button>
                <button onClick={() => deleteUser(u.id)} className="p-2 text-gray-400 hover:text-red-500">
                  <TrashIcon size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={saveUser} className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
            
            <div className="space-y-3">
              <input name="nome" placeholder="Nome Completo" required defaultValue={editingUser?.nome} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
              <input name="email" type="email" placeholder="E-mail" required defaultValue={editingUser?.email} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 ml-1">CARGO</label>
                  <select name="role" defaultValue={editingUser?.role || UserRole.OPERADOR} className="w-full p-3 rounded-xl border border-gray-200 outline-none">
                    <option value={UserRole.GESTOR}>Gestor</option>
                    <option value={UserRole.OPERADOR}>Operador</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 ml-1">SETOR (OPCIONAL)</label>
                  <select name="setorId" defaultValue={editingUser?.setorId || ''} className="w-full p-3 rounded-xl border border-gray-200 outline-none">
                    <option value="">Nenhum</option>
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
              </div>
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
