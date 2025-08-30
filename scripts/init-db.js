const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function initializeDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Creating tables...');
    await client.query(schema);
    
    // Read and execute seed data
    const seedPath = path.join(__dirname, '../database/seed-data.sql');
    const seedData = fs.readFileSync(seedPath, 'utf8');
    
    console.log('Inserting seed data...');
    await client.query(seedData);
    
    console.log('Database initialized successfully!');
    client.release();
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

initializeDatabase();