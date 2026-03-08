import pool from './src/config/database.config';

async function checkSchema() {
  try {
    // Check tables
    const tables = await pool.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `);
    console.log('\n=== TABLES ===');
    console.log(tables.rows.map(r => r.tablename).join(', '));

    // Check rooms table structure
    const roomsColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'rooms' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    console.log('\n=== ROOMS TABLE COLUMNS ===');
    roomsColumns.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSchema();
