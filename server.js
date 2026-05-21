require("dotenv").config({ path: "./backend/.env" });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

// Contact Model
const Contact = mongoose.model("Contact", contactSchema);

// API Route
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: "All fields are required.",
      });
    }

    // Save to MongoDB
    const newContact = new Contact({
      name,
      email,
      message,
    });

    await newContact.save();

    res.status(201).json({
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});