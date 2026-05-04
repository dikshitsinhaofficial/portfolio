const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'contacts.json');

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from the current directory so index.html, css/, js/ load
app.use(express.static(__dirname));

// Ensure the JSON file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Endpoint to handle form submission
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const newContact = {
        id: Date.now(),
        name,
        email,
        message,
        date: new Date().toISOString()
    };

    // Read existing data
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Failed to read data.' });
        }

        let contacts = [];
        try {
            if (data) {
                contacts = JSON.parse(data);
            }
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
        }

        // Add new contact
        contacts.push(newContact);

        // Write back to file
        fs.writeFile(DATA_FILE, JSON.stringify(contacts, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to file:', writeErr);
                return res.status(500).json({ error: 'Failed to save data.' });
            }

            res.status(201).json({ message: 'Message sent successfully!' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
