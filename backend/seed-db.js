require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const schemaSQL = `
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  price DECIMAL(10, 2)
);

CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  revenue DECIMAL(10, 2) NOT NULL,
  region VARCHAR(50),
  order_date DATE,
  product_name VARCHAR(100),
  quantity INTEGER
);

INSERT INTO products (name, category, price) VALUES
('Widget A', 'Electronics', 50.00),
('Widget B', 'Clothing', 30.00),
('Widget C', 'Electronics', 100.00),
('Widget D', 'Home', 25.00);

INSERT INTO sales (revenue, region, order_date, product_name, quantity) VALUES
(500.00, 'North', '2024-01-01', 'Widget A', 10),
(300.00, 'South', '2024-01-02', 'Widget B', 10),
(1000.00, 'North', '2024-01-03', 'Widget C', 10),
(250.00, 'West', '2024-01-04', 'Widget D', 10),
(450.00, 'East', '2024-01-05', 'Widget A', 9),
(600.00, 'North', '2024-02-01', 'Widget B', 20),
(800.00, 'South', '2024-02-15', 'Widget C', 8),
(300.00, 'West', '2024-03-01', 'Widget D', 12);
`;

async function seedDatabase() {
  console.log('--- Seeding Database ---');
  try {
    await pool.query(schemaSQL);
    console.log('✅ SUCCESS: Database tables created and seeded with sample data!');
  } catch (err) {
    console.error('❌ ERROR: Seeding failed!');
    console.error(err.message);
  } finally {
    await pool.end();
  }
}

seedDatabase();
