const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read database URL from .env
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running migration: 007_add_payment_status.sql');
    
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '007_add_payment_status.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
