
import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db } from '../services/dbService';
import { Sector, UserRole } from '../types';
import { IconMap } from '../constants';
import { Link } from 'react-router-dom';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState({ completed: 0, total: 0, activeSectors: 0 });

  useEffect(() => {
    refreshData();
  }, [user]);

  const refreshData = async () => {
    setIsSyncing(true);
    let allSectors = await db.getSectors();
    if (user?.role === UserRole.OPERADOR && user.setorId) {
      allSectors = allSectors.filter(s => s.id === user.setorId);
    }
    setSectors(allSectors);

    const checklists = await db.getChecklists();
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const todayChecklists = checklists.filter(c => c.data === startOfToday);
    
    setStats({
      completed: todayChecklists.filter(c => c.concluida).length,
      total: todayChecklists.length,
      activeSectors: allSectors.length
    });
    setIsSyncing(false);
  };

  const SettingsIcon = IconMap['settings'];
  const LogoutIcon = IconMap['logout'];
  const ClockIcon = IconMap['clock'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-red-600 leading-none">Cantina D'Itália</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></span>
              {isSyncing ? 'Sincronizando...' : 'Sistema Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="hidden md:block text-right mr-2">
              <p className="text-xs font-bold text-gray-700">{user?.nome}</p>
              <p className="text-[10px] text-gray-400 uppercase font-bold">{user?.role}</p>
           </div>
          {user?.role === UserRole.GESTOR && (
            <Link to="/admin" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
              <SettingsIcon size={24} />
            </Link>
          )}
          <button onClick={logout} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <LogoutIcon size={24} />
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <section className="gradient-bg rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <p className="text-sm opacity-80 mb-1">Concluídas Hoje</p>
              <h2 className="text-3xl font-bold">{stats.completed}/{stats.total}</h2>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <p className="text-sm opacity-80 mb-1">Taxa de Conclusão</p>
              <h2 className="text-3xl font-bold">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </h2>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <p className="text-sm opacity-80 mb-1">Setores Ativos</p>
              <h2 className="text-3xl font-bold">{stats.activeSectors}</h2>
            </div>
          </div>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/5 rounded-full"></div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Setores Operacionais</h2>
            <button 
              onClick={refreshData} 
              className={`text-red-500 font-bold text-sm hover:underline flex items-center gap-1 ${isSyncing ? 'opacity-50' : ''}`}
            >
              <ClockIcon size={14} /> Atualizar
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sectors.map((sector) => {
              const Icon = IconMap[sector.icone] || IconMap['restaurant'];
              return (
                <Link
                  key={sector.id}
                  to={`/checklist/${sector.id}`}
                  className="group relative h-48 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{ backgroundColor: `#${sector.cor}` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/30" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                    <div className="bg-white/20 p-4 rounded-2xl mb-3 transition-transform group-hover:scale-110">
                      <Icon size={40} />
                    </div>
                    <span className="text-lg font-bold text-center leading-tight">{sector.nome}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
