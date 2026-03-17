console.log("🚀 BUILD VERSION 2");
const express = require("express");
const { Pool } = require("pg");

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* =========================
   ROOT (HOMEPAGE) — GOOGLE VERIFY
========================= */
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="google-site-verification" content="kkcofV0qcSDCAwmNaTc4k2mT-NvSE9iXUFWwBC2zZcc" />
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

    const color =
      score < 50 ? "#ef4444" :
      score < 70 ? "#f59e0b" :
      "#16a34a";

    const industryAvg = 68;

    const breakdown = [
      { label: "Homepage clarity", score: Math.max(30, score - 5) },
      { label: "CTA visibility", score: Math.max(35, score) },
      { label: "Trust signals", score: Math.max(40, score + 5) },
      { label: "Product persuasion", score: Math.max(35, score) },
      { label: "Checkout experience", score: Math.max(40, score + 5) },
      { label: "Mobile UX", score: Math.max(30, score - 3) }
    ];

    function impactFromPriority(priority) {
      if (priority === "HIGH") return "High impact on conversion rate";
      if (priority === "MEDIUM") return "Moderate impact";
      return "Low impact";
    }

    function effortEstimate(title) {
      const t = title.toLowerCase();
      if (t.includes("cta")) return "Low";
      if (t.includes("trust")) return "Low";
      if (t.includes("checkout")) return "Medium";
      return "Medium";
    }

    const matrix = leaks.map(l => ({
      issue: l.title,
      impact: impactFromPriority(l.priority),
      effort: effortEstimate(l.title),
      priority: l.priority
    }));

    const biggestLeak =
      leaks.length > 0
        ? leaks[0].title
        : "Weak value proposition";

    const revenueImpact =
      score < 50
        ? "30–60% revenue potential"
        : score < 70
        ? "15–30% growth potential"
        : "5–15% optimization potential";

    res.send(`
      <html>
        <head>
          <title>Conversion Intelligence Audit</title>
        </head>
        <body>

          <h1>Full Audit</h1>
          <h2>Score: ${score}/100</h2>
          <p>${risk}</p>

          <h2>Biggest Leak</h2>
          <p>${biggestLeak}</p>

          <h2>Issues</h2>
          ${leaks.map(l => `<p>${l.title} (${l.priority})</p>`).join("")}

          <h2>Revenue Impact</h2>
          <p>${revenueImpact}</p>

        </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});


/* =========================
   STORE PAGE (SEO PAGE)
========================= */
app.get('/store/:domain', async (req, res) => {
  try {
    const domain = req.params.domain.toLowerCase();

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

    /* fallback */
    if (!storeResult.rows.length || !scanResult.rows.length) {
      return res.send(`
        <html>
          <head>
            <meta name="google-site-verification" content="kkcofV0qcSDCAwmNaTc4k2mT-NvSE9iXUFwwBC2zZcc" />
            <title>${domain} Store Analysis</title>
          </head>
          <body>
            <h1>We haven't analyzed this store yet</h1>
            <p>Run a free AI scan</p>
            <a href="/">Run Free Scan</a>
          </body>
        </html>
      `);
    }

    const store = storeResult.rows[0];
    const scan = scanResult.rows[0];

    res.send(`
      <html>
        <head>
          <meta name="google-site-verification" content="kkcofV0qcSDCAwmNaTc4k2mT-NvSE9iXUFwwBC2zZcc" />
          <link rel="canonical" href="https://atom-audit-server-production.up.railway.app/store/${domain}" />
          <title>${domain} Conversion Score</title>
          <meta name="description" content="We analyzed ${domain} and found ${scan.monthly_loss} in lost revenue.">
        </head>
        <body>
          <h1>${domain} Score: ${store.score}/100</h1>

          <h2>Main Problem</h2>
          <p>${scan.main_leak}</p>

          <h2>Quick Fix</h2>
          <p>${scan.quick_fix}</p>

          <h2>Loss</h2>
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
   SITEMAP
========================= */
app.get('/sitemap.xml', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT store_domain FROM stores LIMIT 1000'
    );

    const urls = result.rows.map(row => {
      return `<url><loc>https://atom-audit-server-production.up.railway.app/store/${row.store_domain}</loc></url>`;
    }).join('');

    const xml = `
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls}
      </urlset>
    `;

    res.header('Content-Type', 'application/xml');
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
