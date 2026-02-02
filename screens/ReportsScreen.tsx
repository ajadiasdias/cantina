
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { IconMap } from '../constants';
import { db } from '../services/dbService';
import { getReportInsights } from '../services/geminiService';
import { Sector, ChecklistItem } from '../types';

export default function ReportsScreen() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState('Carregando análise do Gemini...');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  // Fix: Initialize state for sectors and checklists to avoid using Promises directly in render
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  
  // Fix: Load data asynchronously on component mount
  useEffect(() => {
    const loadData = async () => {
      const [s, c] = await Promise.all([db.getSectors(), db.getChecklists()]);
      setSectors(s);
      setChecklists(c);
    };
    loadData();
  }, []);
  
  // Fix: Derive sectorData and typeData from state arrays
  const sectorData = sectors.map(s => {
    const total = checklists.filter(c => c.setorId === s.id).length;
    const completed = checklists.filter(c => c.setorId === s.id && c.concluida).length;
    return {
      name: s.nome,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      color: `#${s.cor}`
    };
  });

  const typeData = [
    { name: 'Abertura', value: checklists.filter(c => c.tipo === 'abertura' && c.concluida).length },
    { name: 'Geral', value: checklists.filter(c => c.tipo === 'geral' && c.concluida).length },
    { name: 'Fechamento', value: checklists.filter(c => c.tipo === 'fechamento' && c.concluida).length },
  ];

  // Fix: Fetch insights once data is available in state
  useEffect(() => {
    if (sectors.length > 0 || checklists.length > 0) {
      const fetchInsights = async () => {
        setIsLoadingInsights(true);
        const res = await getReportInsights({ sectorData, typeData, totalTasks: checklists.length });
        setInsights(res);
        setIsLoadingInsights(false);
      };
      fetchInsights();
    }
  }, [sectors.length, checklists.length]);

  const BackIcon = IconMap['back'];
  const COLORS = ['#FF6B6B', '#4ECDC4', '#FFA94D'];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/admin')} className="p-2 text-gray-400 hover:text-red-500 rounded-full">
          <BackIcon size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Relatórios de Desempenho</h1>
      </header>

      <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <section className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-lg">✨</div>
            <h2 className="text-xl font-bold">Insights do Gestor (IA)</h2>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-sm leading-relaxed min-h-[100px] flex items-center">
            {isLoadingInsights ? (
               <div className="animate-pulse flex space-x-4 w-full">
                 <div className="flex-1 space-y-4 py-1">
                   <div className="h-4 bg-white/20 rounded w-3/4"></div>
                   <div className="h-4 bg-white/20 rounded"></div>
                   <div className="h-4 bg-white/20 rounded w-5/6"></div>
                 </div>
               </div>
            ) : insights}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Desempenho por Setor (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="percent" radius={[8, 8, 0, 0]}>
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Tarefas Concluídas por Tipo</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 shrink-0">
                {typeData.map((t, i) => (
                  <div key={t.name} className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    {t.name}: {t.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
