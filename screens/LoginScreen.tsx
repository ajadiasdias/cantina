
import React, { useState } from 'react';
import { useAuth } from '../App';
import { IconMap } from '../constants';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email);
      if (!success) {
        setError('Credenciais inválidas. Use os dados de teste abaixo.');
      }
    } catch (err) {
      setError('Erro ao tentar conectar ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const UtensilsIcon = IconMap['restaurant'];

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-red-500 p-4 rounded-full mb-4 shadow-lg">
            <UtensilsIcon size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Cantina D'Itália</h1>
          <p className="text-gray-500 font-medium">Sistema de Gestão de Tarefas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'ENTRAR'
            )}
          </button>
        </form>

        <div className="mt-8 bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
          <h3 className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest mb-1">Dica de Acesso</h3>
          <p className="text-xs text-yellow-800">Use <strong>admin@cantina.com</strong> para o gestor.</p>
        </div>
      </div>
    </div>
  );
}
