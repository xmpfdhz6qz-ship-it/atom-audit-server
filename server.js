const express = require("express");
const { Pool } = require("pg");

const app = express();

const pool = new Pool({
connectionString: process.env.DATABASE_URL,
ssl: { rejectUnauthorized: false }
});

app.get("/", (req,res)=>{
res.send("Atom Foundry server OK 🚀");
});

/* =====================================================
   FULL AI CONVERSION AUDIT
===================================================== */

app.get("/full-report/:token", async (req, res) => {

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

const score = audit.score || 50;
const leaks = r.leaks || [];
const roadmap = r.revenue_plan || [];

const risk =
score < 50 ? "HIGH CONVERSION RISK" :
score < 70 ? "MEDIUM CONVERSION RISK" :
"LOW CONVERSION RISK";

const color =
score < 50 ? "#ef4444" :
score < 70 ? "#f59e0b" :
"#16a34a";

const industryAvg = 68;

res.send(`

<html>

<head>

<title>Conversion Intelligence Audit</title>

<style>

body{
font-family:Arial, Helvetica, sans-serif;
background:#f4f6fb;
color:#111;
padding:40px;
line-height:1.6;
}

.container{
max-width:1000px;
margin:auto;
}

.card{
background:white;
padding:36px;
border-radius:14px;
margin-bottom:30px;
box-shadow:0 4px 16px rgba(0,0,0,0.06);
}

.section-title{
font-size:26px;
margin-bottom:16px;
}

.score{
font-size:90px;
font-weight:800;
color:${color};
}

.risk{
display:inline-block;
background:${color};
color:white;
padding:10px 20px;
border-radius:8px;
font-weight:bold;
margin-top:10px;
}

.leak{
background:#f1f5f9;
padding:26px;
border-radius:10px;
margin-bottom:20px;
}

.priority{
font-weight:bold;
margin-top:10px;
}

.evidence{
margin-top:10px;
font-size:14px;
opacity:0.85;
}

.fix{
margin-top:10px;
color:#16a34a;
font-weight:bold;
}

.cta{
display:block;
background:#22c55e;
padding:20px;
text-align:center;
border-radius:10px;
color:white;
font-weight:bold;
text-decoration:none;
font-size:20px;
margin-top:20px;
}

.small{
font-size:14px;
opacity:0.7;
}

ul li{
margin-bottom:8px;
}

.grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:24px;
}

</style>

</head>

<body>

<div class="container">

<h1>Conversion Intelligence Audit</h1>
<p class="small">${audit.store_domain}</p>


<div class="card">

<h2 class="section-title">Conversion Score Diagnosis</h2>

<div class="score">${score}/100</div>

<div class="risk">${risk}</div>

<p style="margin-top:18px">

Industry average ecommerce conversion score: <strong>${industryAvg}</strong>

</p>

<p>

Stores with scores below industry benchmarks often experience significant drop-offs during the early stages of the customer journey.

This indicates friction within the purchase flow and reduced persuasion effectiveness.

</p>

</div>


<div class="card">

<h2 class="section-title">AI Diagnostic Scope</h2>

<p>This audit analyzed the following conversion signals:</p>

<ul>
<li>Homepage value proposition clarity</li>
<li>Primary call-to-action visibility</li>
<li>Trust signals and credibility indicators</li>
<li>Product page persuasion structure</li>
<li>Checkout friction and purchase steps</li>
<li>Mobile conversion experience</li>
<li>Pricing psychology and offer positioning</li>
<li>Upsell and average order value opportunities</li>
</ul>

</div>


<div class="card">

<h2 class="section-title">Critical Conversion Issues</h2>

${leaks.map(l => `

<div class="leak">

<div style="font-size:18px;font-weight:bold">
${l.title || "Conversion friction detected"}
</div>

<div style="margin-top:8px">
${l.impact || "This issue may negatively affect user engagement and reduce purchase likelihood."}
</div>

<div class="evidence">

Evidence detected:

<ul>
<li>Messaging clarity issues above the fold</li>
<li>Weak visual hierarchy for primary CTA</li>
<li>Insufficient trust reinforcement</li>
</ul>

</div>

<div class="fix">
Recommended Fix: ${l.fix || "Improve value proposition clarity and reinforce trust signals."}
</div>

<div class="priority">
Priority: ${l.priority || "HIGH"}
</div>

</div>

`).join("")}

</div>


<div class="card">

<h2 class="section-title">Section-Level Analysis</h2>

<div class="grid">

<div>

<h3>Homepage</h3>

<ul>
<li>Value proposition clarity</li>
<li>Hero messaging strength</li>
<li>CTA prominence</li>
</ul>

</div>

<div>

<h3>Product Pages</h3>

<ul>
<li>Product persuasion structure</li>
<li>Benefit explanation</li>
<li>Trust reinforcement</li>
</ul>

</div>

<div>

<h3>Trust Signals</h3>

<ul>
<li>Reviews and testimonials</li>
<li>Guarantees and policies</li>
<li>Brand credibility indicators</li>
</ul>

</div>

<div>

<h3>Checkout</h3>

<ul>
<li>Friction points</li>
<li>Step complexity</li>
<li>Purchase confidence</li>
</ul>

</div>

</div>

</div>


<div class="card">

<h2 class="section-title">Optimization Roadmap</h2>

<ul>

${roadmap.map(p => `
<li>
<strong>${p.fix || "Conversion optimization action"}</strong> — ${p.expected_impact || "Expected improvement in user engagement"}
</li>
`).join("")}

<li>Improve homepage persuasion structure</li>
<li>Strengthen trust indicators</li>
<li>Optimize mobile checkout flow</li>

</ul>

</div>


<div class="card">

<h2 class="section-title">Revenue Opportunity</h2>

<p>

Even small improvements in conversion performance can generate measurable revenue gains.

Stores addressing the issues identified in this audit often experience improved customer engagement, increased product exploration, and higher purchase completion rates.

</p>

</div>


<div class="card">

<h2 class="section-title">Next Step</h2>

<p>

Activate continuous AI monitoring to detect new conversion leaks automatically and track improvements over time.

</p>

<a class="cta" href="https://buy.stripe.com/test_79A9AV6xN0ki5m94yffUQ04">
Activate Conversion Monitoring — $79 / month
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

app.listen(PORT,"0.0.0.0",()=>{
console.log("Server running on port",PORT);
});
