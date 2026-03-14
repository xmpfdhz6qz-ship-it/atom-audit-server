const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Atom Foundry server OK 🚀");
});

app.get("/audit/:slug", (req, res) => {
  const slug = req.params.slug;

  res.send(`
    <h1>Audit test</h1>
    <p>Slug: ${slug}</p>
  `);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
