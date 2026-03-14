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

  const slug = req.params.slug;

  // převod slug → domain
  const store = slug
    .replace("-conversion-score", "")
    .replace(/-/g, ".");

  try {

    const result = await pool.query(
      "SELECT * FROM store_scans WHERE normalized_store = $1 ORDER BY scan_date DESC LIMIT 1",
      [store]
    );

    if (result.rows.length === 0) {
      return res.send("Audit not found");
    }

    const r = result.rows[0];

    const score = r.score ?? 0;
    const mainLeak = r.main_leak ?? "Not detected";
    const quickFix = r.quick_fix ?? "No quick fix identified";
    const priorityFix = r.priority_fix ?? "No priority fix identified";

    res.send(`
<html>

<head>
<title>Conversion Audit – ${r.normalized_store}</title>

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

</style>

</head>

<body>

<div class="container">

<h1>Store Conversion Audit</h1>

<p>${r.normalized_store}</p>


<div class="card">

<h2>Conversion Score</h2>

<div class="score">
${score} / 100
</div>

<p>
Stores scoring below 60 often lose a large share of potential buyers before checkout.
</p>

</div>


<div class="card">

<h2>Main Conversion Problem</h2>

<p>
${mainLeak}
</p>

</div>


<div class="card">

<h2>Quick Fix</h2>

<p>
${quickFix}
</p>

</div>


<div class="card">

<h2>Priority Fix</h2>

<p>
${priorityFix}
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
