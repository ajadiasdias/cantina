
import React from 'react';
import { 
  Utensils, 
  Pizza, 
  TableProperties, 
  Coffee, 
  Wine, 
  Cake, 
  Trash2, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart3,
  Camera,
  Plus,
  ArrowLeft,
  ChevronRight,
  Clock,
  AlertCircle
} from 'lucide-react';

export const IconMap: Record<string, React.ElementType> = {
  restaurant: Utensils,
  local_pizza: Pizza,
  table_restaurant: TableProperties,
  coffee: Coffee,
  local_bar: Wine,
  cake: Cake,
  settings: Settings,
  logout: LogOut,
  dashboard: LayoutDashboard,
  users: Users,
  checklist: CheckSquare,
  reports: BarChart3,
  camera: Camera,
  plus: Plus,
  back: ArrowLeft,
  next: ChevronRight,
  clock: Clock,
  alert: AlertCircle,
  trash: Trash2
};

export const INITIAL_SECTORS = [
  {
    id: "setor_001",
    nome: "Cozinha",
    descricao: "Preparação de pratos principais",
    cor: "FF6B6B",
    icone: "restaurant",
    ordem: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: "setor_002",
    nome: "Pizzaria",
    descricao: "Preparação de pizzas",
    cor: "FFA94D",
    icone: "local_pizza",
    ordem: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: "setor_003",
    nome: "Salão",
    descricao: "Atendimento aos clientes",
    cor: "4ECDC4",
    icone: "table_restaurant",
    ordem: 3,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_USERS = [
  {
    id: "admin_001",
    nome: "Admin Cantina",
    email: "admin@cantina.com",
    role: "gestor",
    createdAt: new Date().toISOString()
  },
  {
    id: "user_001",
    nome: "João Silva",
    email: "joao@cantina.com",
    role: "operador",
    setorId: "setor_001",
    createdAt: new Date().toISOString()
  }
];

export const DIAS_MAP: Record<number, string> = {
  1: "seg",
  2: "ter",
  3: "qua",
  4: "qui",
  5: "sex",
  6: "sab",
  0: "dom"
};
