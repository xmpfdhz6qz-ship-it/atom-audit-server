console.log("🚀 BUILD VERSION 5");

const express = require("express");
const { Pool } = require("pg");

const app = express();

const BASE_URL = "https://atomfoundry.dev";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="google-site-verification" content="kkcofV0qcSDCAwmNaTc4k2mT-NvSE9iXUFwwBC2zZcc" />
        <title>Atom Foundry</title>
      </head>
      <body>
        <h1>Atom Foundry</h1>
        <p>BUILD VERSION 5</p>
      </body>
    </html>
  `);
});

/* =========================
   FULL REPORT
========================= */
app.get("/full-report/:token", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM audits WHERE token=$1",
      [req.params.token]
    );

    if (!result.rows.length) return res.send("Audit not found");

    const audit = result.rows[0];

    let r = audit.report_json;
    if (typeof r === "string") r = JSON.parse(r);

    const leaks = r.leaks || [];

    res.send(`
      <html>
        <body>
          <h1>Full Audit</h1>
          ${leaks.map(l => `<p>${l.title}</p>`).join("")}
        </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

/* =========================
   STORE PAGE (FIXED 🔥)
========================= */
app.get('/store/:domain', async (req, res) => {
  try {
    // ✅ NORMALIZACE INPUTU
    const domain = req.params.domain
      .toLowerCase()
      .replace('https://', '')
      .replace('http://', '')
      .replace('www.', '')
      .replace(/\/$/, '');

    console.log("DOMAIN:", domain);

    // 🔥 DEBUG
    const debug = await pool.query(
      `SELECT normalized_store FROM store_scans LIMIT 5`
    );
    console.log("SAMPLE:", debug.rows);

    // 🔥 FIX: LIKE místo =
    const scanResult = await pool.query(
      `SELECT * FROM store_scans 
       WHERE LOWER(normalized_store) LIKE $1
       ORDER BY scan_date DESC 
       LIMIT 1`,
      [`%${domain}%`]
    );

    console.log("FOUND:", scanResult.rows);

    // ❗ fallback jen když nic není
    if (!scanResult.rows.length) {
      return res.send(`
        <html>
          <body>
            <h1>${domain}</h1>
            <p>No data yet</p>
          </body>
        </html>
      `);
    }

    const scan = scanResult.rows[0];

    res.send(`
      <html>
        <head>
          <title>${domain} Conversion Score</title>
        </head>
        <body>

          <h1>${domain}</h1>

          <h2>Main Problem</h2>
          <p>${scan.main_leak}</p>

          <h2>Quick Fix</h2>
          <p>${scan.quick_fix}</p>

          <h2>Loss</h2>
          <p>${scan.monthly_loss}</p>

        </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

/* =========================
   SITEMAP
========================= */
app.get('/sitemap.xml', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT store_domain FROM stores LIMIT 1000'
    );

    const urls = result.rows.map(row =>
      `<url><loc>${BASE_URL}/store/${row.store_domain}</loc></url>`
    ).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.set('Content-Type', 'text/xml');
    res.send(xml);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

/* =========================
   START
========================= */
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
