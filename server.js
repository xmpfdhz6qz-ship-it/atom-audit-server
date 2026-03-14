const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get("/", (req, res) => {
  res.send("Atom Foundry Audit Server Running 🚀");
});

app.get("/audit/:token", async (req, res) => {

  const token = req.params.token;

  try {

    const result = await pool.query(
      "SELECT * FROM store_scans WHERE token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      return res.send("Audit not found");
    }

    const scan = result.rows[0];

    res.send(`
    <html>
    <body style="font-family:Arial;background:#0f172a;color:white;padding:40px">

    <h1>Conversion Audit</h1>

    <p>Store: ${scan.store_url}</p>

    <h2>Conversion Score</h2>
    <h1>${scan.score} / 100</h1>

    <h2>Main Revenue Leak</h2>
    <p>${scan.main_leak}</p>

    <h2>Quick Fix</h2>
    <p>${scan.quick_fix}</p>

    <h2>Estimated Monthly Revenue Loss</h2>
    <p>$${scan.monthly_loss}</p>

    </body>
    </html>
    `);

  } catch (error) {

    console.error(error);
    res.send("Database error");

  }

});

const PORT = 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
