require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testConnection() {
  console.log('--- Database Connection Test ---');
  console.log(`Target: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`User: ${process.env.DB_USER}`);

  try {
    const start = Date.now();
    const res = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    const duration = Date.now() - start;

    console.log('\n✅ SUCCESS: Connected to database!');
    console.log(`Server Time: ${res.rows[0].current_time}`);
    console.log(`Database Name: ${res.rows[0].db_name}`);
    console.log(`Response Time: ${duration}ms`);
    
    // Check if the expected tables exist
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('\nExisting Tables in Public Schema:');
    if (tables.rows.length === 0) {
      console.log(' (No tables found)');
    } else {
      tables.rows.forEach(row => console.log(` - ${row.table_name}`));
    }

  } catch (err) {
    console.error('\n❌ ERROR: Connection failed!');
    console.error(`Message: ${err.message}`);
    console.error('\nPlease check your .env credentials and ensure PostgreSQL is running.');
  } finally {
    await pool.end();
  }
}

testConnection();
