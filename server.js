const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");

const app  = express();
const PORT = 3000;

// Path to the local contacts JSON file (inside backend/)
const CONTACTS_FILE = path.join(__dirname, "backend", "contacts.json");

// Ensure the contacts file exists with an empty array if it doesn't
if (!fs.existsSync(CONTACTS_FILE)) {
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify([], null, 2), "utf-8");
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// POST /api/contact — Save message to backend/contacts.json
app.post("/api/contact", (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Read existing contacts
    let contacts = [];
    try {
      const raw = fs.readFileSync(CONTACTS_FILE, "utf-8");
      contacts  = JSON.parse(raw);
    } catch (_) {
      contacts = [];
    }

    // Append new contact entry
    const newContact = {
      id:      Date.now(),
      name:    name.trim(),
      email:   email.trim().toLowerCase(),
      message: message.trim(),
      date:    new Date().toISOString(),
    };
    contacts.push(newContact);

    // Write back to file
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2), "utf-8");

    console.log(`✅ New contact saved: ${name} <${email}>`);

    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Error saving contact:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📁 Contacts will be saved to: ${CONTACTS_FILE}`);
});