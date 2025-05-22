const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static("./website")); // Frontend files
app.use("/uploads", express.static("uploads")); // Uploaded files

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// MySQL connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'stitchit',
    port: 8889
});

db.connect((err) => {
    if (err) {
        console.error("Database connection error:", err);
    } else {
        console.log("✅ Connected to stitchit database");
    }
});

// Route to handle form submission (Order)
app.post('/submit', upload.single('file'), (req, res) => {
    const {
        name, email, phone, dob,
        height, weight, chest, waist, hips, arm, leg, shoulder,
        clothingType, fabric, color, design, description
    } = req.body;

    const image = req.file ? req.file.filename : null;

    // Convert to numbers (if they're strings from form input)
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const c = parseFloat(chest);
    const wa = parseFloat(waist);
    const hi = parseFloat(hips);
    const a = parseFloat(arm);
    const l = parseFloat(leg);
    const s = parseFloat(shoulder);

    if (
        isNaN(h) || h <= 10 || h > 250 ||
        isNaN(w) || w <= 2 || w > 300 ||
        isNaN(c) || c <= 10 || c > 200 ||
        isNaN(wa) || wa <= 5 || wa > 200 ||
        isNaN(hi) || hi <= 5 || hi > 200 ||
        isNaN(a) || a <= 1 || a > 100 ||
        isNaN(l) || l <= 5 || l > 150 ||
        isNaN(s) || s <= 10 || s > 100
    ) {
        return res.status(400).send("One or more measurements are invalid.");
    }

    const query = `
        INSERT INTO orders (
            name, email, phone, dob,
            height, weight, chest, waist, hips, arm, leg, shoulder,
            clothing_type, fabric, color, design, description, file_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [
        name, email, phone, dob,
        height, weight, chest, waist, hips, arm, leg, shoulder,
        clothingType, fabric, color, design, description, image
    ], (err, result) => {
        if (err) {
            console.error("MySQL error in /submit:", err);
            res.status(500).send('Database error while submitting order');
        } else {
            res.status(200).send('Order submitted successfully!');
        }
    });
});

// Route to get the latest order
app.get('/latest-order', (req, res) => {
    const query = `SELECT * FROM orders ORDER BY id DESC LIMIT 1`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching latest order:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json(null);
        }
    });
});

// Route to handle contact form
app.post("/contact", (req, res) => {
    const { firstName, lastName, email, phone, message } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
    }

    // Phone validation: digits only and reasonable length (e.g., 8–15)
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: "Phone must contain only digits (8-15 numbers)." });
    }

    const sql = `
        INSERT INTO contacts (first_name, last_name, email, phone, message)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [firstName, lastName, email, phone, message], (err, result) => {
        if (err) {
            console.error("MySQL error in /contact:", err);
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ message: "Contact message saved successfully" });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}/HTML/index.html`);
});
