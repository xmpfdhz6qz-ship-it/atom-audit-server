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

    let r = audit.report_json;

    if (typeof r === "string") {
      r = JSON.parse(r);
    }

    const score = r.conversion_score || 50;
    const gap = 100 - score;

    const mainLeak =
      r.main_leak ||
      (r.leaks && r.leaks[0] ? r.leaks[0].problem : "Conversion friction detected");

    const quickFix =
      r.quick_fix ||
      (r.leaks && r.leaks[0] ? r.leaks[0].fix : "Improve value proposition and trust signals");

    const priorityFix =
      r.priority_fix || quickFix;

    const riskLevel =
      r.risk_level || "medium";

    const evidence =
      r.evidence || [];

    res.send(`

<html>

<head>

<title>AI Store Conversion Audit</title>

<style>

body{
font-family:Arial, Helvetica, sans-serif;
background:#0f172a;
color:white;
padding:40px;
line-height:1.6;
}

.container{
max-width:820px;
margin:auto;
}

.card{
background:#1e293b;
padding:28px;
border-radius:14px;
margin-bottom:26px;
}

.score{
font-size:72px;
font-weight:800;
color:#22c55e;
}

.center{
text-align:center;
}

.cta{
display:block;
background:#f97316;
padding:20px;
text-align:center;
border-radius:12px;
font-weight:bold;
text-decoration:none;
color:white;
font-size:22px;
margin-top:22px;
}

.cta:hover{
opacity:0.9;
}

.subtitle{
opacity:0.85;
margin-top:8px;
}

ul li{
margin-bottom:8px;
}

</style>

</head>

<body>

<div class="container">

<h1>AI Store Conversion Audit</h1>

<p class="subtitle">${audit.store_domain || "Ecommerce Store"}</p>


<div class="card center">

<h2>Conversion Score</h2>

<div class="score">
${score} / 100
</div>

<p>
Your store may be losing up to <strong>${gap}%</strong> of potential buyers before checkout.
</p>

<a class="cta" href="https://buy.stripe.com/test_8x2bJ1ceBaYK6qd94yfUQ03">
Get Your Store Deep Conversion Audit — $399
</a>

</div>


<div class="card">

<h2>Main Conversion Problem</h2>

<p>${mainLeak}</p>

</div>


<div class="card">

<h2>Quick Fix</h2>

<p>${quickFix}</p>

</div>


<div class="card">

<h2>Priority Fix</h2>

<p>${priorityFix}</p>

</div>


<div class="card">

<h2>Evidence</h2>

<ul>
${evidence.map(e => `<li>${e}</li>`).join("") || "<li>No additional signals detected.</li>"}
</ul>

</div>


<div class="card">

<h2>Risk Level</h2>

<p>${riskLevel}</p>

</div>


<div class="card center">

<h2>Want a Complete AI Analysis of Your Store?</h2>

<p class="subtitle">
The full audit reveals all conversion leaks affecting your store and explains exactly how to fix them.
</p>

<a class="cta" href="https://buy.stripe.com/test_8x2bJ1ceBaYK6qd94yfUQ03">
Unlock Full AI Conversion Audit — $399
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
