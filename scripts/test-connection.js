const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query test successful:', result.rows[0]);
    
    client.release();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();