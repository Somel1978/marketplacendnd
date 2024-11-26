import { z } from 'zod';

export const dbConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().positive(),
  database: z.string().min(1),
  table: z.string().min(1),
  user: z.string().min(1),
  password: z.string().min(1),
});

export type DbConfig = z.infer<typeof dbConfigSchema>;

const DEFAULT_CONFIG: DbConfig = {
  host: '127.0.0.1',
  port: 5432,
  database: 'dnditems',
  table: 'dnd',
  user: 'postgres',
  password: 'Psql2024',
};

export function loadDbConfig(): DbConfig {
  try {
    const stored = localStorage.getItem('dbConfig');
    if (!stored) return DEFAULT_CONFIG;
    
    const parsed = JSON.parse(stored);
    return dbConfigSchema.parse(parsed);
  } catch (error) {
    console.warn('Failed to load database config:', error);
    return DEFAULT_CONFIG;
  }
}

export function saveDbConfig(config: DbConfig): void {
  localStorage.setItem('dbConfig', JSON.stringify(config));
}