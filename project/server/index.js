import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

let pool = null;
let currentTable = 'dnd';

const initializeDatabase = async (config) => {
  try {
    // Create new pool
    const newPool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: false,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await newPool.connect();
    try {
      await client.query('SELECT NOW()');
      
      // If we get here, connection is successful
      // Close existing pool if it exists
      if (pool) {
        const oldPool = pool;
        pool = null; // Clear reference before ending
        await oldPool.end().catch(console.error);
      }
      
      // Update current pool and table
      pool = newPool;
      currentTable = config.table;

      // Create or update table schema
      await client.query(`
        CREATE TABLE IF NOT EXISTS "${currentTable}" (
          "Id" SERIAL PRIMARY KEY,
          "Type" VARCHAR(255) NOT NULL,
          "Name" VARCHAR(255) NOT NULL,
          "Price" NUMERIC(10,2) NOT NULL,
          "Base_Item" VARCHAR(255) NOT NULL,
          "Rarity" VARCHAR(50) NOT NULL,
          "Attunement" VARCHAR(50),
          "Requirements" TEXT,
          "Weight" NUMERIC(10,2),
          "Source" VARCHAR(50) NOT NULL,
          "Image" TEXT,
          "Link" TEXT,
          "Created_At" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "Updated_At" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('Database initialized successfully');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    // If initialization fails, clean up the new pool
    if (newPool) {
      try {
        await newPool.end();
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
    }
    throw error;
  }
};

// Middleware to ensure database connection
const ensureDbConnection = async (req, res, next) => {
  if (!pool) {
    return res.status(503).json({ error: 'Database connection not available' });
  }
  next();
};

app.post('/db/test', async (req, res) => {
  try {
    const config = req.body;
    const success = await initializeDatabase(config);
    res.json({ success, message: 'Database connected successfully' });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/items', ensureDbConnection, async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT 
        "Id" as id,
        "Type" as type,
        "Name" as name,
        "Price" as price,
        "Base_Item" as "baseItem",
        "Rarity" as rarity,
        "Attunement" as attunement,
        "Requirements" as requirements,
        "Weight" as weight,
        "Source" as source,
        "Image" as image,
        "Link" as link,
        "Created_At" as "createdAt",
        "Updated_At" as "updatedAt"
      FROM "${currentTable}"
      ORDER BY "Created_At" DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch items:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.post('/items', ensureDbConnection, async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const { type, name, price, baseItem, rarity, attunement, requirements, weight, source, image, link } = req.body;
    
    const result = await client.query(
      `INSERT INTO "${currentTable}" (
        "Type", "Name", "Price", "Base_Item", "Rarity", "Attunement", 
        "Requirements", "Weight", "Source", "Image", "Link"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING 
        "Id" as id,
        "Type" as type,
        "Name" as name,
        "Price" as price,
        "Base_Item" as "baseItem",
        "Rarity" as rarity,
        "Attunement" as attunement,
        "Requirements" as requirements,
        "Weight" as weight,
        "Source" as source,
        "Image" as image,
        "Link" as link,
        "Created_At" as "createdAt",
        "Updated_At" as "updatedAt"`,
      [type, name, price, baseItem, rarity, attunement, requirements, weight, source, image, link]
    );

    if (!result.rows[0]) {
      throw new Error('Failed to create item - no data returned');
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create item:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.put('/items/:id', ensureDbConnection, async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = Object.entries(updates)
      .map(([key, _], index) => {
        const dbKey = key === 'baseItem' ? 'Base_Item' : 
                     key.charAt(0).toUpperCase() + key.slice(1);
        return `"${dbKey}" = $${index + 2}`;
      })
      .join(', ');
    
    const values = Object.values(updates);
    const query = `
      UPDATE "${currentTable}"
      SET ${setClause}, "Updated_At" = CURRENT_TIMESTAMP
      WHERE "Id" = $1
      RETURNING 
        "Id" as id,
        "Type" as type,
        "Name" as name,
        "Price" as price,
        "Base_Item" as "baseItem",
        "Rarity" as rarity,
        "Attunement" as attunement,
        "Requirements" as requirements,
        "Weight" as weight,
        "Source" as source,
        "Image" as image,
        "Link" as link,
        "Created_At" as "createdAt",
        "Updated_At" as "updatedAt"
    `;
    
    const result = await client.query(query, [id, ...values]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update item:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.delete('/items/:id', ensureDbConnection, async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const { id } = req.params;
    const result = await client.query(
      `DELETE FROM "${currentTable}" WHERE "Id" = $1 RETURNING "Id"`, 
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete item:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (pool) {
    console.log('Closing database pool...');
    const oldPool = pool;
    pool = null; // Clear reference before ending
    await oldPool.end().catch(console.error);
  }
  process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});