const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Mock data for demonstration when no DB is connected
const mockData = {
  sales: [
    {
      id: 1,
      revenue: 1250.5,
      region: "North",
      order_date: "2024-01-01",
      product_name: "Premium Widget",
      quantity: 25,
      category: "Electronics",
    },
    {
      id: 2,
      revenue: 840.0,
      region: "South",
      order_date: "2024-01-05",
      product_name: "Standard Gadget",
      quantity: 42,
      category: "Gadgets",
    },
    {
      id: 3,
      revenue: 2100.0,
      region: "East",
      order_date: "2024-01-10",
      product_name: "Premium Widget",
      quantity: 30,
      category: "Electronics",
    },
    {
      id: 4,
      revenue: 450.75,
      region: "West",
      order_date: "2024-01-15",
      product_name: "Basic Tool",
      quantity: 15,
      category: "Tools",
    },
    {
      id: 5,
      revenue: 1800.0,
      region: "North",
      order_date: "2024-02-01",
      product_name: "Standard Gadget",
      quantity: 60,
      category: "Gadgets",
    },
    {
      id: 6,
      revenue: 950.25,
      region: "South",
      order_date: "2024-02-10",
      product_name: "Basic Tool",
      quantity: 35,
      category: "Tools",
    },
    {
      id: 7,
      revenue: 3200.0,
      region: "East",
      order_date: "2024-02-20",
      product_name: "Premium Widget",
      quantity: 45,
      category: "Electronics",
    },
    {
      id: 8,
      revenue: 1100.5,
      region: "West",
      order_date: "2024-03-05",
      product_name: "Standard Gadget",
      quantity: 50,
      category: "Gadgets",
    },
    {
      id: 9,
      revenue: 2500.0,
      region: "North",
      order_date: "2024-03-15",
      product_name: "Premium Widget",
      quantity: 35,
      category: "Electronics",
    },
    {
      id: 10,
      revenue: 600.0,
      region: "South",
      order_date: "2024-03-25",
      product_name: "Basic Tool",
      quantity: 20,
      category: "Tools",
    },
    {
      id: 11,
      revenue: 1400.0,
      region: "East",
      order_date: "2024-04-01",
      product_name: "Premium Widget",
      quantity: 20,
      category: "Electronics",
    },
    {
      id: 12,
      revenue: 1900.0,
      region: "West",
      order_date: "2024-04-10",
      product_name: "Standard Gadget",
      quantity: 55,
      category: "Gadgets",
    },
    {
      id: 13,
      revenue: 2800.0,
      region: "North",
      order_date: "2024-04-20",
      product_name: "Premium Widget",
      quantity: 40,
      category: "Electronics",
    },
    {
      id: 14,
      revenue: 750.0,
      region: "South",
      order_date: "2024-05-01",
      product_name: "Basic Tool",
      quantity: 25,
      category: "Tools",
    },
    {
      id: 15,
      revenue: 2200.0,
      region: "East",
      order_date: "2024-05-15",
      product_name: "Standard Gadget",
      quantity: 48,
      category: "Gadgets",
    },
  ],
};

exports.executeQuery = async (sql) => {
  try {
    // If DB connection fails, return mock data for demonstration
    const res = await pool.query(sql);
    return res.rows;
  } catch (err) {
    console.warn(
      "Database connection failed, returning mock data for demo:",
      err.message,
    );

    const lowerSQL = sql.toLowerCase();

    // Improved mock logic for more variety
    if (lowerSQL.includes("select * from sales")) {
      return mockData.sales;
    }

    if (lowerSQL.includes("sum(revenue)")) {
      if (lowerSQL.includes("group by region")) {
        const regions = [...new Set(mockData.sales.map((s) => s.region))];
        return regions.map((r) => ({
          region: r,
          revenue: mockData.sales
            .filter((s) => s.region === r)
            .reduce((sum, s) => sum + s.revenue, 0),
        }));
      }
      const totalRevenue = mockData.sales.reduce(
        (sum, row) => sum + row.revenue,
        0,
      );
      return [{ sum: totalRevenue }];
    }

    if (
      lowerSQL.includes("group by product_name") ||
      lowerSQL.includes("count")
    ) {
      const products = [...new Set(mockData.sales.map((s) => s.product_name))];
      return products.map((p) => ({
        product_name: p,
        count: mockData.sales.filter((s) => s.product_name === p).length,
        revenue: mockData.sales
          .filter((s) => s.product_name === p)
          .reduce((sum, s) => sum + s.revenue, 0),
      }));
    }

    return mockData.sales.slice(0, 5);
  }
};
