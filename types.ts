
export enum UserRole {
  GESTOR = 'gestor',
  OPERADOR = 'operador'
}

export enum TaskType {
  ABERTURA = 'abertura',
  GERAL = 'geral',
  FECHAMENTO = 'fechamento'
}

export type DayOfWeek = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  setorId?: string;
  fotoUrl?: string;
  createdAt: string;
}

export interface Sector {
  id: string;
  nome: string;
  descricao?: string;
  cor: string; // Hex color
  icone: string; // Lucide icon name
  ordem: number;
  createdAt: string;
}

export interface Task {
  id: string;
  setorId: string;
  tipo: TaskType;
  titulo: string;
  descricao?: string;
  ordem: number;
  diasSemana: DayOfWeek[];
  obrigatoria: boolean;
  requerFoto: boolean;
  tempoEstimado?: number; // in minutes
}

export interface ChecklistItem {
  id: string;
  setorId: string;
  tipo: TaskType;
  data: string; // ISO string (start of day)
  tarefaId: string;
  concluida: boolean;
  usuarioId: string | null;
  fotoUrl: string | null;
  observacao: string | null;
  concluidaEm: string | null;
  createdAt: string;
}
