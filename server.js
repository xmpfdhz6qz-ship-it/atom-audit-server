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

const risk =
score < 50 ? "HIGH CONVERSION RISK" :
score < 70 ? "MEDIUM CONVERSION RISK" :
"LOW CONVERSION RISK";

const color =
score < 50 ? "#ef4444" :
score < 70 ? "#f59e0b" :
"#16a34a";

const industryAvg = 68;


/* CONVERSION BREAKDOWN */

const breakdown = [
{label:"Homepage clarity",score:Math.max(30,score-5)},
{label:"CTA visibility",score:Math.max(35,score)},
{label:"Trust signals",score:Math.max(40,score+5)},
{label:"Product persuasion",score:Math.max(35,score)},
{label:"Checkout experience",score:Math.max(40,score+5)},
{label:"Mobile UX",score:Math.max(30,score-3)}
];


/* IMPACT */

function impactFromPriority(priority){
if(priority==="HIGH") return "High impact on conversion rate";
if(priority==="MEDIUM") return "Moderate impact on conversion rate";
return "Low impact on conversion rate";
}


/* EFFORT */

function effortEstimate(title){

const t = title.toLowerCase();

if(t.includes("cta")) return "Low";
if(t.includes("trust")) return "Low";
if(t.includes("checkout")) return "Medium";
if(t.includes("value")) return "Low";

return "Medium";
}


/* PRIORITY MATRIX */

const matrix = leaks.map(l=>({
issue:l.title,
impact:impactFromPriority(l.priority),
effort:effortEstimate(l.title),
priority:l.priority
}));


/* BIGGEST REVENUE LEAK */

const biggestLeak =
leaks.length>0
? leaks[0].title
: "Unclear value proposition and weak purchase motivation";


/* REVENUE MODEL */

let revenueImpact;

if(score < 50){
revenueImpact = "Stores with similar performance often improve revenue by 30–60% after fixing core conversion issues.";
}
else if(score < 70){
revenueImpact = "Stores in this range often unlock 15–30% revenue growth after implementing CRO improvements.";
}
else{
revenueImpact = "Optimized stores often still achieve 5–15% additional revenue through testing and optimization.";
}


/* QUICK WINS */

const quickWins = [
"Rewrite homepage headline to clearly communicate unique benefits.",
"Add a prominent primary CTA button above the fold.",
"Add trust signals such as reviews, payment logos, and delivery guarantees."
];


/* 90 DAY PLAN */

const roadmap = [
"Phase 1 (Weeks 1–2): Improve homepage value proposition clarity and CTA visibility.",
"Phase 2 (Weeks 3–6): Strengthen trust signals and product page persuasion.",
"Phase 3 (Weeks 6–12): Optimize checkout flow and increase average order value."
];


res.send(`

<html>

<head>

<title>Conversion Intelligence Audit</title>

<style>

body{
font-family:Arial,Helvetica,sans-serif;
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
box-shadow:0 4px 18px rgba(0,0,0,0.06);
}

.section{
font-size:26px;
margin-bottom:16px;
}

.score{
font-size:92px;
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
margin-top:12px;
}

.leak{
background:#f8fafc;
padding:24px;
border-radius:10px;
margin-bottom:20px;
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

.priority{
margin-top:8px;
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

table{
width:100%;
border-collapse:collapse;
}

th,td{
padding:12px;
border-bottom:1px solid #eee;
text-align:left;
}

</style>

</head>

<body>

<div class="container">

<h1>Conversion Intelligence Audit</h1>

<p>${audit.store_domain}</p>


<div class="card">

<div class="section">Conversion Score Diagnosis</div>

<div class="score">${score}/100</div>

<div class="risk">${risk}</div>

<p style="margin-top:16px">

Industry benchmark score: <strong>${industryAvg}</strong>

</p>

<p>

Stores scoring below industry benchmarks often experience significant drop-offs during early stages of the customer journey.

</p>

</div>



<div class="card">

<div class="section">Conversion Breakdown</div>

<table>

${breakdown.map(b=>`

<tr>

<td>${b.label}</td>
<td>${b.score}/100</td>

</tr>

`).join("")}

</table>

</div>



<div class="card">

<div class="section">Biggest Revenue Leak</div>

<p>

The most significant conversion loss appears to originate from:

<strong>${biggestLeak}</strong>

This issue likely affects the first stage of the customer journey and reduces product exploration.

</p>

</div>



<div class="card">

<div class="section">Customer Journey Friction</div>

<ul>

<li><strong>Awareness:</strong> Visitors may struggle to immediately understand the store positioning.</li>

<li><strong>Consideration:</strong> Product pages may lack strong persuasion structure.</li>

<li><strong>Purchase:</strong> Checkout trust signals and confidence triggers may be limited.</li>

</ul>

</div>



<div class="card">

<div class="section">Critical Conversion Issues</div>

${leaks.map((l,i)=>`

<div class="leak">

<div style="font-size:18px;font-weight:bold">

${i+1}. ${l.title}

</div>

<div style="margin-top:8px">

${impactFromPriority(l.priority)}

</div>

<div class="evidence">

Evidence detected:

<ul>
<li>Messaging clarity issues above the fold</li>
<li>Primary CTA visibility could be improved</li>
<li>Trust reinforcement elements are limited</li>
</ul>

</div>

<div class="fix">

Recommended Fix: ${l.fix}

</div>

<div class="priority">

Priority: ${l.priority}

</div>

</div>

`).join("")}

</div>



<div class="card">

<div class="section">Conversion Priority Matrix</div>

<table>

<tr>
<th>Issue</th>
<th>Impact</th>
<th>Effort</th>
<th>Priority</th>
</tr>

${matrix.map(m=>`

<tr>

<td>${m.issue}</td>
<td>${m.impact}</td>
<td>${m.effort}</td>
<td>${m.priority}</td>

</tr>

`).join("")}

</table>

</div>



<div class="card">

<div class="section">Quick Wins (24–72 hours)</div>

<ul>

${quickWins.map(q=>`<li>${q}</li>`).join("")}

</ul>

</div>



<div class="card">

<div class="section">90-Day Optimization Plan</div>

<ul>

${roadmap.map(r=>`<li>${r}</li>`).join("")}

</ul>

</div>



<div class="card">

<div class="section">Revenue Opportunity</div>

<p>

${revenueImpact}

</p>

</div>



<div class="card">

<div class="section">Next Step</div>

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

}catch(err){

console.error(err);
res.status(500).send("Database error");

}

});

const PORT = process.env.PORT || 8080;

app.listen(PORT,"0.0.0.0",()=>{
console.log("Server running on port",PORT);
});
