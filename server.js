const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Atom Foundry Audit Server Running 🚀");
});

app.get("/audit/:token", (req, res) => {

  const token = req.params.token;

  const score = 64;
  const mainLeak = "Weak hero section messaging";
  const quickFix = "Add a clear value proposition and trust badges above the fold.";
  const priorityFix = "Rewrite hero headline to clearly communicate the store's main benefit.";
  const monthlyLoss = "$18,400";

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
  <title>Store Conversion Audit</title>
  <style>
  body{
  font-family: Arial;
  background:#0f172a;
  color:white;
  padding:40px;
  }

  .container{
  max-width:900px;
  margin:auto;
  }

  .score{
  font-size:64px;
  color:#22c55e;
  }

  .box{
  background:#1e293b;
  padding:25px;
  margin-top:20px;
  border-radius:10px;
  }

  h2{
  margin-bottom:10px;
  }
  </style>
  </head>

  <body>

  <div class="container">

  <h1>Conversion Audit Report</h1>

  <div class="box">
  <h2>Conversion Score</h2>
  <div class="score">${score}/100</div>
  </div>

  <div class="box">
  <h2>Main Revenue Leak</h2>
  <p>${mainLeak}</p>
  </div>

  <div class="box">
  <h2>Quick Fix</h2>
  <p>${quickFix}</p>
  </div>

  <div class="box">
  <h2>Priority Fix</h2>
  <p>${priorityFix}</p>
  </div>

  <div class="box">
  <h2>Estimated Monthly Revenue Loss</h2>
  <p>${monthlyLoss}</p>
  </div>

  </div>

  </body>
  </html>
  `);

});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
