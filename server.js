const express = require("express");
const { Pool } = require("pg");

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get("/", (req, res) => {
  res.send("Atom Foundry server OK 🚀");
});

app.get("/report/:token", async (req, res) => {

  const token = req.params.token;

  try {

    const result = await pool.query(
      "SELECT * FROM audits WHERE token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      return res.send("Audit not found");
    }

    const audit = result.rows[0];
    const r = audit.report_json;

    const score = r.conversion_score;
    const gap = 100 - score;

    res.send(`

<html>

<head>

<title>Store Conversion Audit</title>

<style>

body{
font-family:Arial;
background:#0f172a;
color:white;
padding:40px;
line-height:1.6;
}

.container{
max-width:760px;
margin:auto;
}

.card{
background:#1e293b;
padding:28px;
border-radius:12px;
margin-bottom:24px;
}

.score{
font-size:64px;
font-weight:800;
color:#22c55e;
}

.cta{
display:block;
background:#f97316;
padding:18px;
text-align:center;
border-radius:10px;
font-weight:bold;
text-decoration:none;
color:white;
font-size:20px;
margin-top:20px;
}

.center{
text-align:center;
}

</style>

</head>

<body>

<div class="container">

<h1>Store Conversion Audit</h1>

<p>${audit.store_domain}</p>

<div class="card center">

<h2>Conversion Score</h2>

<div class="score">
${score} / 100
</div>

<p>
Your store may be losing up to <strong>${gap}%</strong> of potential buyers.
</p>

<a class="cta" href="https://buy.stripe.com/test_8x2bJ1ceBaYK6qd94yfUQ03">
Get Your Store Deep Conversion Audit — $399
</a>

</div>

<div class="card">

<h2>Main Conversion Problem</h2>

<p>${r.main_leak}</p>

</div>

<div class="card">

<h2>Quick Fix</h2>

<p>${r.quick_fix}</p>

</div>

<div class="card">

<h2>Priority Fix</h2>

<p>${r.priority_fix}</p>

</div>

<div class="card">

<h2>Evidence</h2>

<ul>
${(r.evidence || []).map(e => `<li>${e}</li>`).join("")}
</ul>

</div>

<div class="card">

<h2>Risk Level</h2>

<p>${r.risk_level}</p>

</div>

<div class="card center">

<h2>Want a Complete AI Analysis of Your Store?</h2>

<a class="cta" href="https://buy.stripe.com/test_8x2bJ1ceBaYK6qd94yfUQ03">
Get Your Store Deep Conversion Audit — $399
</a>

</div>

</div>

</body>

</html>

`);

  } catch (err) {

    console.error(err);
    res.status(500).send("Database error");

  }

});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
