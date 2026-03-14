const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

/*
POSTGRES CONNECTION
Railway automaticky nastaví DATABASE_URL
*/
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/*
ROOT ROUTE
*/
app.get("/", (req, res) => {
  res.send("Atom Foundry Audit Server Running 🚀");
});

/*
AUDIT PAGE
*/
app.get("/audit/:slug", async (req, res) => {

  const slug = req.params.slug;

  console.log("Audit requested:", slug);

  try {

    const result = await pool.query(
      "SELECT * FROM store_reports WHERE report_slug = $1",
      [slug]
    );

    if (result.rows.length === 0) {
      return res.send("Audit not found");
    }

    const report = result.rows[0];

    res.send(`
      <html>
      <body style="font-family:Arial;background:#0f172a;color:white;padding:40px">

      <h1>Conversion Audit</h1>

      <p><b>Store:</b> ${report.store_domain}</p>

      <h2>Conversion Score</h2>
      <h1>${report.conversion_score} / 100</h1>

      <h2>Conversion Gap</h2>
      <p>${report.conversion_gap_percent}% potential revenue lost</p>

      <h2>Main Revenue Leak</h2>
      <p>${report.main_leak}</p>

      <h2>Risk Level</h2>
      <p>${report.risk_level}</p>

      </body>
      </html>
    `);

  } catch (error) {

    console.error("Database error:", error);

    res.status(500).send("Database error");

  }

});

/*
SERVER START
Railway vyžaduje process.env.PORT
*/
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
