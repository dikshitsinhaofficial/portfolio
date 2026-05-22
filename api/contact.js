const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  // Add CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // On Vercel, the filesystem is read-only except for /tmp.
    // Locally, we want to save in backend/contacts.json.
    const isVercel = process.env.VERCEL === "1";
    const rootDir = path.join(__dirname, "..");
    
    const CONTACTS_FILE = isVercel
      ? path.join("/tmp", "contacts.json")
      : path.join(rootDir, "backend", "contacts.json");

    if (!fs.existsSync(CONTACTS_FILE)) {
      try {
        fs.writeFileSync(CONTACTS_FILE, JSON.stringify([], null, 2), "utf-8");
      } catch(e) {
        console.error("Could not create contacts file", e);
      }
    }

    let contacts = [];
    try {
      const raw = fs.readFileSync(CONTACTS_FILE, "utf-8");
      contacts = JSON.parse(raw);
    } catch (_) {
      contacts = [];
    }

    const newContact = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      date: new Date().toISOString(),
    };
    contacts.push(newContact);

    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2), "utf-8");

    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
};
