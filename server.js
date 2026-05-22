const express = require("express");
const cors = require("cors");
const path = require("path");
const contactHandler = require("./api/contact");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Use the exact same handler that Vercel uses
app.post("/api/contact", contactHandler);

// Only listen if we are running this file directly (local dev)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📁 Contacts will be saved to: ${path.join(__dirname, "backend", "contacts.json")}`);
  });
}

module.exports = app;