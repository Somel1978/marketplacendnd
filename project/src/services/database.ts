import { Pool, PoolClient } from 'pg';
import type { DbConfig } from '../config/database';
import type { Item } from '../types/Item';

let pool: Pool | null = null;

export async function initializeDatabase(config: DbConfig): Promise<void> {
  try {
    if (pool) {
      await pool.end();
    }

    pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test connection
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${config.table} (
        id SERIAL PRIMARY KEY,
        type VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        price NUMERIC NOT NULL,
        base_item VARCHAR(255) NOT NULL,
        rarity VARCHAR(50) NOT NULL,
        attunement VARCHAR(50),
        requirements TEXT,
        weight NUMERIC NOT NULL,
        source VARCHAR(50) NOT NULL
      )
    `);
    client.release();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    pool = null;
    throw error;
  }
}

export async function getClient(): Promise<PoolClient | null> {
  try {
    return pool ? await pool.connect() : null;
  } catch (error) {
    console.error('Failed to get database client:', error);
    return null;
  }
}

export async function testConnection(config: DbConfig): Promise<void> {
  const testPool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await testPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    await testPool.end();
  } catch (error) {
    await testPool.end();
    throw error;
  }
}

export async function getAllItems(config: DbConfig): Promise<Item[]> {
  if (!pool) {
    await initializeDatabase(config);
  }

  const client = await getClient();
  if (!client) return [];

  try {
    const result = await client.query<Item>(`
      SELECT 
        id,
        type,
        name,
        price as price,
        base_item as "baseItem",
        rarity,
        attunement,
        requirements,
        weight as weight,
        source
      FROM ${config.table}
    `);
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return [];
  } finally {
    client.release();
  }
}

// Similar updates for createItem, updateItem, and deleteItem functions
// Each would take the config as a parameter and ensure the pool is initialized