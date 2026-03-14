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

app.get("/audit/:slug", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM store_scans ORDER BY scan_date DESC LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.send("Audit not found");
    }

    const r = result.rows[0];

    const conversionGap = 100 - r.score;

    res.send(`

<html>

<head>

<title>Conversion Audit – ${r.store_url}</title>

<style>

body{
font-family:Arial, Helvetica, sans-serif;
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

.subtitle{
opacity:0.8;
margin-bottom:14px;
}

ul li{
margin-bottom:8px;
}

</style>

</head>

<body>

<div class="container">

<h1>Store Conversion Audit</h1>

<p>${r.normalized_store}</p>


<div class="card">

<h2>Conversion Score</h2>

<div class="score">
${r.score} / 100
</div>

<p>
Stores scoring below 60 often lose a large share of potential buyers before checkout.
</p>

</div>


<div class="card">

<h2>Conversion Gap</h2>

<p>
Your store may be losing up to <strong>${conversionGap}%</strong> of potential customers before they reach checkout.
</p>

</div>


<div class="card">

<h2>Main Conversion Problem</h2>

<p>
${r.main_leak}
</p>

</div>


<div class="card">

<h2>Visitor Risk</h2>

<p>
Visitors may hesitate to buy due to: <strong>${r.visitor_risk}</strong>
</p>

</div>


<div class="card">

<h2>Quick Fix</h2>

<p>
${r.quick_fix}
</p>

</div>


<div class="card">

<h2>Fix These Issues Before They Cost You Sales</h2>

<p class="subtitle">
Our AI detected multiple conversion leaks affecting your store performance.
The full audit reveals all issues and explains exactly how to fix them.
</p>

<a class="cta" href="https://buy.stripe.com/test_8x2bJ1ceBaYK6qd94yfUQ03">
Reveal All Conversion Leaks — $399 Audit
</a>

</div>


<div class="card">

<h2>Priority Fix</h2>

<p>
${r.priority_fix}
</p>

</div>


<div class="card">

<h2>Estimated Revenue Impact</h2>

<p>
Stores with similar scores often lose <strong>30–50% of potential revenue</strong> due to conversion friction.
</p>

<p>
Even small improvements in conversion rate can dramatically increase revenue.
</p>

</div>


<div class="card">

<h2>Why this matters</h2>

<p>
Visitors decide within seconds whether they trust an ecommerce store.
Missing trust signals, unclear pricing, or confusing messaging often causes visitors to leave before exploring products.
</p>

</div>


<div class="card">

<h2>Full AI Conversion Audit</h2>

<p>
The full audit reveals all conversion leaks detected during the analysis and explains exactly how to fix them.
</p>

<ul>

<li>Homepage conversion breakdown</li>
<li>Product page persuasion issues</li>
<li>Checkout friction detection</li>
<li>Trust and credibility signals</li>
<li>Mobile conversion blockers</li>
<li>Revenue optimization opportunities</li>

</ul>

<p class="subtitle">
Reveal all hidden conversion leaks affecting your store.
</p>

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

app.get("/report/:slug", async (req, res) => {

  const slug = req.params.slug;

  try {

    const result = await pool.query(
      "SELECT * FROM store_reports WHERE report_slug = $1",
      [slug]
    );

    if (result.rows.length === 0) {
      return res.send("Audit not found");
    }

    const r = result.rows[0];

    const conversionGap = 100 - r.conversion_score;

    res.send(`

<html>

<head>

<title>Full Conversion Audit – ${r.store_domain}</title>

<style>

body{
font-family:Arial, Helvetica, sans-serif;
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

</style>

</head>

<body>

<div class="container">

<h1>Full AI Conversion Audit</h1>

<p>${r.store_domain}</p>


<div class="card">

<h2>Conversion Score</h2>

<div class="score">
${r.conversion_score} / 100
</div>

<p>
Your store may be losing up to <strong>${conversionGap}%</strong> of potential buyers.
</p>

</div>


<div class="card">

<h2>Main Conversion Leak</h2>

<p>
${r.main_leak}
</p>

</div>


<div class="card">

<h2>Quick Fix</h2>

<p>
${r.quick_fix}
</p>

</div>


<div class="card">

<h2>Priority Fix</h2>

<p>
${r.priority_fix}
</p>

</div>


<div class="card">

<h2>AI Action Plan</h2>

<p>
Fix the priority issue first, then improve trust signals,
pricing clarity and product page persuasion.
</p>

</div>


<div class="card">

<h2>Conversion Monitoring</h2>

<p>
Start continuous monitoring of your store and receive alerts
when new conversion issues appear.
</p>

<a style="display:block;background:#22c55e;padding:18px;text-align:center;border-radius:10px;font-weight:bold;text-decoration:none;color:white;font-size:18px;margin-top:20px;" href="#">
Start Conversion Monitoring — $79/month
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
