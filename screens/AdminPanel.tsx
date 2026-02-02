
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconMap } from '../constants';

export default function AdminPanel() {
  const navigate = useNavigate();
  const BackIcon = IconMap['back'];

  const adminModules = [
    { title: 'Usuários', icon: 'users', count: 'Gerenciar equipe', path: '/admin/users', color: 'bg-blue-500' },
    { title: 'Setores', icon: 'restaurant', count: 'Estrutura física', path: '/admin/sectors', color: 'bg-red-500' },
    { title: 'Tarefas', icon: 'checklist', count: 'Checklists diários', path: '/admin/tasks', color: 'bg-orange-500' },
    { title: 'Relatórios', icon: 'reports', count: 'Desempenho', path: '/admin/reports', color: 'bg-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 text-gray-400 hover:text-red-500 rounded-full">
          <BackIcon size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Painel Administrativo</h1>
      </header>

      <main className="p-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminModules.map((module) => {
          const Icon = IconMap[module.icon] || IconMap['restaurant'];
          return (
            <Link
              key={module.path}
              to={module.path}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-6 group"
            >
              <div className={`${module.color} p-5 rounded-2xl text-white shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
                <Icon size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{module.title}</h2>
                <p className="text-sm text-gray-500 font-medium">{module.count}</p>
              </div>
            </Link>
          );
        })}
      </main>
    </div>
  );
}
