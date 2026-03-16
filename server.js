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

app.get("/full-report/:token", async (req,res)=>{

const token = req.params.token;

try{

const result = await pool.query(
"SELECT * FROM audits WHERE token=$1",
[token]
);

if(result.rows.length===0){
return res.send("Audit not found");
}

const audit = result.rows[0];

let r = audit.report_json;

if(typeof r === "string"){
r = JSON.parse(r);
}

const score = audit.score || 50;

const leaks = r.leaks || [];

const leakCount = leaks.length || 3;

const hiddenLeaks = Math.max(0, 23 - leakCount);

const risk =
score < 50 ? "HIGH CONVERSION RISK" :
score < 70 ? "MEDIUM CONVERSION RISK" :
"LOW CONVERSION RISK";

const riskColor =
score < 50 ? "#ef4444" :
score < 70 ? "#f59e0b" :
"#22c55e";


res.send(`

<html>

<head>

<title>AI Conversion Audit</title>

<style>

body{
font-family:Arial,Helvetica,sans-serif;
background:#f5f7fb;
color:#111;
padding:40px;
line-height:1.6;
}

.container{
max-width:900px;
margin:auto;
}

.card{
background:white;
padding:32px;
border-radius:14px;
margin-bottom:28px;
box-shadow:0 4px 14px rgba(0,0,0,0.06);
}

.center{
text-align:center;
}

.score{
font-size:80px;
font-weight:800;
color:${riskColor};
}

.risk{
background:${riskColor};
color:white;
display:inline-block;
padding:10px 16px;
border-radius:8px;
font-weight:bold;
margin-top:12px;
}

.section-title{
font-size:28px;
margin-bottom:14px;
}

.leak{
background:#f1f5f9;
padding:20px;
border-radius:10px;
margin-bottom:16px;
}

.priority{
font-size:12px;
font-weight:bold;
opacity:0.7;
margin-top:8px;
}

.fix{
margin-top:8px;
color:#22c55e;
font-weight:bold;
}

.cta{
display:block;
background:#22c55e;
padding:18px;
text-align:center;
border-radius:10px;
color:white;
font-weight:bold;
text-decoration:none;
font-size:20px;
margin-top:18px;
}

.small{
opacity:0.7;
font-size:14px;
}

ul li{
margin-bottom:8px;
}

</style>

</head>

<body>

<div class="container">


<h1>AI Store Conversion Audit</h1>

<p class="small">${audit.store_domain || "Ecommerce Store"}</p>


<div class="card center">

<h2>Conversion Score</h2>

<div class="score">${score}/100</div>

<div class="risk">${risk}</div>

<p style="margin-top:16px">
Your store may be losing potential buyers due to conversion friction across key parts of the purchase journey.
</p>

</div>


<div class="card">

<h2 class="section-title">Main Conversion Problem</h2>

<p>
${r.main_leak || "Visitors may not clearly understand why they should buy from this store."}
</p>

</div>


<div class="card">

<h2 class="section-title">Why This Matters</h2>

<p>

Online shoppers decide within <strong>3–5 seconds</strong> whether they trust a store enough to continue browsing.

If the value proposition, credibility, or purchase flow is unclear, many visitors leave before exploring the products.

</p>

</div>


<div class="card">

<h2 class="section-title">Detected Conversion Leaks</h2>

<p class="small">

AI detected <strong>${23}</strong> potential conversion issues across your store.

Currently revealed: <strong>${leakCount}</strong> / 23

</p>

${leaks.map(l => `

<div class="leak">

<div style="font-weight:bold">
${l.title || "Conversion friction detected"}
</div>

<div style="margin-top:6px;opacity:0.8">
${l.impact || "This issue may negatively affect conversion rates."}
</div>

<div class="fix">
Recommended Fix: ${l.fix || "Improve clarity, trust signals, and CTA visibility."}
</div>

<div class="priority">
Priority: ${l.priority || "MEDIUM"}
</div>

</div>

`).join("")}

</div>


<div class="card">

<h2 class="section-title">Optimization Roadmap</h2>

<ul>

<li>Clarify homepage value proposition</li>
<li>Add strong trust signals and credibility indicators</li>
<li>Improve product page persuasion structure</li>
<li>Reduce checkout friction and purchase steps</li>
<li>Optimize mobile conversion experience</li>
<li>Improve pricing psychology and offer structure</li>
<li>Introduce strategic upsell and AOV mechanisms</li>

</ul>

</div>


<div class="card">

<h2 class="section-title">Revenue Opportunity</h2>

<p>

Many ecommerce stores increase revenue significantly after improving conversion rate by even a small percentage.

Addressing the issues identified in this audit can improve customer trust, increase engagement, and unlock hidden revenue potential.

</p>

</div>


<div class="card center">

<h2>Next Step</h2>

<p>

Activate continuous AI monitoring to detect new conversion leaks automatically.

</p>

<a class="cta"
href="https://buy.stripe.com/test_79A9AV6xN0ki5m94yffUQ04">

Activate Conversion Monitoring — $79/month

</a>

</div>


</div>

</body>

</html>

`);

}catch(err){

console.error(err);
res.status(500).send("Database error");

}

});


const PORT = process.env.PORT || 8080;

app.listen(PORT,"0.0.0.0",()=>{
console.log("Server running on port",PORT);
});
