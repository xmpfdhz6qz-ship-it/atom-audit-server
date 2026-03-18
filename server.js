console.log("🚀 BUILD VERSION 3");
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
      </body>
    </html>
  `);
});

/* =========================
   FULL REPORT
========================= */
app.get("/full-report/:token", async (req, res) => {
  const token = req.params.token;

  try {
    const result = await pool.query(
      "SELECT * FROM audits WHERE token=$1",
      [token]
    );

    if (result.rows.length === 0) {
      return res.send("Audit not found");
    }

    const audit = result.rows[0];

    let r = audit.report_json;
    if (typeof r === "string") {
      r = JSON.parse(r);
    }

    const score = audit.score || 50;
    const leaks = r.leaks || [];

    const risk =
      score < 50 ? "HIGH CONVERSION RISK" :
      score < 70 ? "MEDIUM CONVERSION RISK" :
      "LOW CONVERSION RISK";

    res.send(`
      <html>
        <head>
          <title>Conversion Intelligence Audit</title>
        </head>
        <body>
          <h1>Full Audit</h1>
          <h2>Score: ${score}/100</h2>
          <p>${risk}</p>
          ${leaks.map(l => `<p>${l.title} (${l.priority})</p>`).join("")}
        </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

/* =========================
   STORE PAGE (SEO)
========================= */
app.get('/store/:domain', async (req, res) => {
  try {
    const domain = req.params.domain.toLowerCase();
console.log("DOMAIN:", domain);

// 🔥 DEBUG - CO JE V DB
const debug = await pool.query(
  `SELECT normalized_store FROM store_scans LIMIT 10`
);

console.log("ALL SCANS SAMPLE:", debug.rows);
    
    const storeResult = await pool.query(
      'SELECT * FROM stores WHERE store_domain = $1',
      [domain]
    );

    const scanResult = await pool.query(
      `SELECT * FROM store_scans 
       WHERE normalized_store = $1 
       ORDER BY scan_date DESC 
       LIMIT 1`,
      [domain]
    );

    if (!storeResult.rows.length || !scanResult.rows.length) {
      return res.send(`
        <html>
          <head>
            <title>${domain} Store Analysis</title>
            <link rel="canonical" href="${BASE_URL}/store/${domain}" />
          </head>
          <body>
            <h1>${domain} Conversion Analysis</h1>
            <p>This store may be losing revenue due to conversion issues.</p>
            <a href="/">Run Free AI Scan</a>
          </body>
        </html>
      `);
    }

    const store = storeResult.rows[0];
    const scan = scanResult.rows[0];

    res.send(`
      <html>
        <head>
          <link rel="canonical" href="${BASE_URL}/store/${domain}" />
          <title>${domain} Conversion Score</title>
          <meta name="description" content="We analyzed ${domain} and found ${scan.monthly_loss} in lost revenue.">
        </head>
        <body>
          <h1>${domain} Score: ${store.score}/100</h1>

          <h2>Main Problem</h2>
          <p>${scan.main_leak}</p>

          <h2>Quick Fix</h2>
          <p>${scan.quick_fix}</p>

          <h2>Estimated Loss</h2>
          <p>${scan.monthly_loss}</p>

          <a href="/">Run Free Scan</a>
        </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

/* =========================
   SITEMAP (FIXED)
========================= */
app.get('/sitemap.xml', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT store_domain FROM stores LIMIT 1000'
    );

  const urls = result.rows.map(row => {
  return `<url><loc>${BASE_URL}/store/${row.store_domain}</loc></url>`;
}).join('');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

res.set('Content-Type', 'text/xml');
res.send(xml);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating sitemap');
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
