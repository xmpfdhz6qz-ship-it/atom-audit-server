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
<meta name="viewport" content="width=device-width, initial-scale=1">

<style>

body{
margin:0;
background:#f8fafc;
font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
color:#0f172a;
}

.container{
max-width:900px;
margin:auto;
padding:24px;
}

.card{
background:white;
padding:28px;
border-radius:18px;
margin-bottom:24px;
border:1px solid #e2e8f0;
}

.section{
font-size:22px;
font-weight:700;
margin-bottom:14px;
}

.score{
font-size:80px;
font-weight:800;
color:${color};
}

.risk{
display:inline-block;
background:${color};
color:white;
padding:8px 16px;
border-radius:10px;
margin-top:10px;
}

table{
width:100%;
border-collapse:collapse;
}

th,td{
padding:12px;
border-bottom:1px solid #e2e8f0;
text-align:left;
}

/* MOBILE TABLE FIX */

.desktop-table{
width:100%;
border-collapse:collapse;
}

.mobile-cards{
display:none;
}

.matrix-card{
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:14px;
padding:16px;
margin-bottom:14px;
}

.row{
display:flex;
justify-content:space-between;
gap:10px;
margin-bottom:8px;
}

.label{
font-size:12px;
color:#64748b;
text-transform:uppercase;
}

.priority{
font-weight:700;
}

/* RESPONSIVE */

@media (max-width:640px){

.desktop-table{
display:none;
}

.mobile-cards{
display:block;
}

}

</style>

</head>

<body>

<div class="container">

<h1>Full Conversion Intelligence Audit</h1>
<p style="color:#64748b">${audit.store_domain}</p>

<div class="card">

<div class="section">Conversion Score</div>

<div class="score">${score}/100</div>
<div class="risk">${risk}</div>

</div>


<div class="card">

<div class="section">Conversion Priority Matrix</div>

<div class="table-wrapper">

<table class="desktop-table">

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
<td><strong>${m.priority}</strong></td>
</tr>

`).join("")}

</table>


<div class="mobile-cards">

${matrix.map(m=>`

<div class="matrix-card">

<div class="row">
<span class="label">Issue</span>
<span>${m.issue}</span>
</div>

<div class="row">
<span class="label">Impact</span>
<span>${m.impact}</span>
</div>

<div class="row">
<span class="label">Effort</span>
<span>${m.effort}</span>
</div>

<div class="row">
<span class="label">Priority</span>
<span class="priority">${m.priority}</span>
</div>

</div>

`).join("")}

</div>

</div>

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
