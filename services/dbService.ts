
import { User, Sector, Task, ChecklistItem, UserRole, TaskType, DayOfWeek } from '../types';
import { INITIAL_SECTORS, INITIAL_USERS } from '../constants';

class DatabaseService {
  private getStorage<T>(key: string, initial: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initial;
  }

  private setStorage<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // USERS
  async getUsers(): Promise<User[]> {
    // Simula latência de rede
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.getStorage<User[]>('cantina_users', INITIAL_USERS as User[]);
  }

  async saveUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) users[index] = user;
    else users.push(user);
    this.setStorage('cantina_users', users);
  }

  async deleteUser(id: string): Promise<void> {
    const users = (await this.getUsers()).filter(u => u.id !== id);
    this.setStorage('cantina_users', users);
  }

  // SECTORS
  async getSectors(): Promise<Sector[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.getStorage<Sector[]>('cantina_sectors', INITIAL_SECTORS as Sector[])
      .sort((a, b) => a.ordem - b.ordem);
  }

  async saveSector(sector: Sector): Promise<void> {
    const sectors = await this.getSectors();
    const index = sectors.findIndex(s => s.id === sector.id);
    if (index > -1) sectors[index] = sector;
    else sectors.push(sector);
    this.setStorage('cantina_sectors', sectors);
  }

  async deleteSector(id: string): Promise<void> {
    const sectors = (await this.getSectors()).filter(s => s.id !== id);
    this.setStorage('cantina_sectors', sectors);
  }

  // TASKS
  async getTasks(): Promise<Task[]> {
    return this.getStorage<Task[]>('cantina_tasks', []);
  }

  async saveTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index > -1) tasks[index] = task;
    else tasks.push(task);
    this.setStorage('cantina_tasks', tasks);
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = (await this.getTasks()).filter(t => t.id !== id);
    this.setStorage('cantina_tasks', tasks);
  }

  // CHECKLISTS
  async getChecklists(): Promise<ChecklistItem[]> {
    return this.getStorage<ChecklistItem[]>('cantina_checklists', []);
  }

  async saveChecklist(item: ChecklistItem): Promise<void> {
    const checklists = await this.getChecklists();
    const index = checklists.findIndex(c => c.id === item.id);
    if (index > -1) checklists[index] = item;
    else checklists.push(item);
    this.setStorage('cantina_checklists', checklists);
  }

  async generateDailyChecklist(setorId: string): Promise<ChecklistItem[]> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const allChecklists = await this.getChecklists();
    const existing = allChecklists.filter(c => c.setorId === setorId && c.data === startOfToday);
    
    if (existing.length > 0) return existing;

    const weekdayMap: Record<number, DayOfWeek> = {
      0: 'dom', 1: 'seg', 2: 'ter', 3: 'qua', 4: 'qui', 5: 'sex', 6: 'sab'
    };
    const todayStr = weekdayMap[now.getDay()];
    
    const tasksForSector = (await this.getTasks()).filter(t => 
      t.setorId === setorId && t.diasSemana.includes(todayStr)
    );

    const newItems: ChecklistItem[] = tasksForSector.map(t => ({
      id: crypto.randomUUID(),
      setorId: setorId,
      tarefaId: t.id,
      tipo: t.tipo,
      data: startOfToday,
      concluida: false,
      usuarioId: null,
      fotoUrl: null,
      observacao: null,
      concluidaEm: null,
      createdAt: now.toISOString()
    }));

    const updatedChecklists = [...allChecklists, ...newItems];
    this.setStorage('cantina_checklists', updatedChecklists);
    return newItems;
  }
}

export const db = new DatabaseService();
