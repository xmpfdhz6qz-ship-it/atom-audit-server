const express = require("express");
const { Pool } = require("pg");

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get("/", (req, res) => {
  res.send("Atom Foundry Audit Server Running 🚀");
});

app.get("/audit/:slug", async (req, res) => {

  const slug = req.params.slug;

  console.log("Requested slug:", slug);

  try {

    const result = await pool.query(
      "SELECT * FROM store_reports WHERE report_slug = $1",
      [slug]
    );

    console.log("DB rows:", result.rows.length);

    if (result.rows.length === 0) {
      return res.send("Audit not found");
    }

    const r = result.rows[0];

    res.send(`
    <html>
    <body style="font-family:Arial;background:#0f172a;color:white;padding:40px">

    <h1>Conversion Audit</h1>

    <p>Store: ${r.store_domain}</p>

    <h2>Conversion Score</h2>
    <h1>${r.conversion_score} / 100</h1>

    <h2>Conversion Gap</h2>
    <p>${r.conversion_gap_percent}% revenue potential lost</p>

    <h2>Main Revenue Leak</h2>
    <p>${r.main_leak}</p>

    <h2>Risk Level</h2>
    <p>${r.risk_level}</p>

    </body>
    </html>
    `);

  } catch (err) {

    console.error("DB ERROR:", err);

    res.status(500).send("Database error");

  }

});

});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
