import pg from 'pg';
const { Pool } = pg;

let pool = null;

export async function initializePool(config) {
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
      // For development, adjust SSL based on your PostgreSQL setup
      ssl: false
    });

    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    pool = null;
    throw error;
  }
}

export function getPool() {
  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}