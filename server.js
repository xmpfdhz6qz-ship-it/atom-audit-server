const express = require("express");
const { Pool } = require("pg");

const app = express();

const pool = new Pool({
connectionString: process.env.DATABASE_URL,
ssl: { rejectUnauthorized: false }
});

app.get("/audit/:token", async (req, res) => {

const token = req.params.token;

const result = await pool.query(
"SELECT * FROM audits WHERE token = $1",
[token]
);

if (!result.rows.length) {
return res.status(404).send("Audit not found");
}

const audit = result.rows[0];
const data = audit.report_json;

res.send(`
<h1>AI Conversion Audit</h1>

<h2>Store</h2>
${audit.store_domain}

<h2>Main Revenue Leak</h2>
<p>${data.main_leak}</p>

<h2>Quick Fix</h2>
<p>${data.quick_fix}</p>

<h2>Top Conversion Issues</h2>

<ul>
${data.leaks.map(l => `
<li>
<strong>${l.title}</strong><br>
Impact: ${l.impact}<br>
Fix: ${l.fix}
</li>
`).join("")}
</ul>
`);
});

app.listen(3000, () => {
console.log("Audit server running");
});
