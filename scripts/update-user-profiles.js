const { Pool } = require('pg');
require('dotenv').config();

async function updateUserProfiles() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Creating user_profiles table...');
    
    // Create user profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
        zip_code VARCHAR(10),
        city VARCHAR(100),
        state VARCHAR(50),
        interests TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id)
    `);
    
    // Add columns to existing tables if they don't exist
    try {
      await client.query(`
        ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_profile_id UUID REFERENCES user_profiles(id)
      `);
    } catch (error) {
      console.log('Column user_profile_id already exists in documents table');
    }
    
    try {
      await client.query(`
        ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS user_profile_id UUID REFERENCES user_profiles(id)
      `);
    } catch (error) {
      console.log('Column user_profile_id already exists in chat_conversations table');
    }
    
    console.log('User profiles schema updated successfully!');
    client.release();
  } catch (error) {
    console.error('Error updating user profiles schema:', error);
  } finally {
    await pool.end();
  }
}

updateUserProfiles();