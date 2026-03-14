const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Atom Foundry Audit Server Running 🚀");
});

app.get("/audit/:token", (req, res) => {

  const token = req.params.token;

  res.send(`
  <html>
  <body style="font-family:Arial;background:#0f172a;color:white;padding:40px">

  <h1>Conversion Audit</h1>

  <p>Audit token: ${token}</p>

  <h2>Conversion Score</h2>
  <h1>64 / 100</h1>

  <h2>Main Revenue Leak</h2>
  <p>Weak hero section messaging</p>

  <h2>Quick Fix</h2>
  <p>Add clear value proposition above the fold</p>

  <h2>Estimated Monthly Revenue Loss</h2>
  <p>$18,400</p>

  </body>
  </html>
  `);

});

const PORT = 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
