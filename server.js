const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Atom Foundry server OK 🚀");
});

app.get("/audit/:slug", (req, res) => {
  res.send("Audit slug: " + req.params.slug);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
