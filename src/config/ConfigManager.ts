import type { SimulationConfig } from '../simulation/Simulation';

const STORAGE_KEY = 'slime-ca-configs';

export interface SavedConfigEntry {
  id: string;
  name: string;
  createdAt: string;
  config: SimulationConfig;
}

export class ConfigManager {
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static getAll(): SavedConfigEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static save(config: SimulationConfig): SavedConfigEntry {
    const entries = this.getAll();
    const entry: SavedConfigEntry = {
      id: this.generateId(),
      name: config.name,
      createdAt: config.createdAt,
      config,
    };
    entries.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return entry;
  }

  static delete(id: string): void {
    const entries = this.getAll().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  static get(id: string): SavedConfigEntry | undefined {
    return this.getAll().find(e => e.id === id);
  }

  static rename(id: string, newName: string): void {
    const entries = this.getAll();
    const entry = entries.find(e => e.id === id);
    if (entry) {
      entry.name = newName;
      entry.config.name = newName;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }
}
