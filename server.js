 // Express import করা হয়েছে
const express = require("express");

// SQLite database
const Database = require("better-sqlite3");

// Path ব্যবহার করার জন্য
const path = require("path");

// Express app তৈরি
const app = express();

// Port
const PORT = process.env.PORT || 3000; 

// SQLite database তৈরি/খোলা
const db = new Database("portfolio.db");

// ===============================
// Middleware
// ===============================

// JSON data পড়ার জন্য
app.use(express.json());

// Form data পড়ার জন্য
app.use(express.urlencoded({ extended: true }));

// public folder থেকে HTML, CSS, JS serve করবে
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// Database Table
// ===============================

// Contact message রাখার table
db.prepare(`
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

// Project table
db.prepare(`
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        technologies TEXT NOT NULL,
        image TEXT,
        github TEXT,
        demo TEXT
    )
`).run();

// ===============================
// Default Projects
// ===============================

// Database-এ project না থাকলে কিছু sample project যোগ হবে
const projectCount = db
    .prepare("SELECT COUNT(*) AS count FROM projects")
    .get();

if (projectCount.count === 0) {

    const insertProject = db.prepare(`
        INSERT INTO projects
        (title, description, technologies, image, github, demo)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertProject.run(
        "Personal Portfolio",
        "HTML, CSS ও JavaScript দিয়ে তৈরি একটি আধুনিক responsive portfolio website।",
        "HTML, CSS, JavaScript",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
        "https://github.com/",
        "#"
    );

    insertProject.run(
        "E-Commerce Website",
        "একটি responsive online shopping website interface।",
        "HTML, CSS, JavaScript",
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
        "https://github.com/",
        "#"
    );

    insertProject.run(
        "Student Management System",
        "Node.js ও SQLite ব্যবহার করে তৈরি student management project।",
        "Node.js, Express.js, SQLite",
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
        "https://github.com/",
        "#"
    );
}

// ===============================
// Validation Function
// ===============================

function validateContact(data) {

    const { name, email, subject, message } = data;

    if (!name || !email || !subject || !message) {
        return "সবগুলো ঘর পূরণ করুন।";
    }

    // Email validation
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return "সঠিক Email Address দিন।";
    }

    if (name.length < 2) {
        return "নাম কমপক্ষে ২ অক্ষরের হতে হবে।";
    }

    if (message.length < 10) {
        return "Message কমপক্ষে ১০ অক্ষরের হতে হবে।";
    }

    return null;
}

// ===============================
// Contact API
// ===============================

app.post("/api/contact", (req, res) => {

    try {

        const { name, email, subject, message } = req.body;

        // Validation
        const error = validateContact(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error
            });
        }

        // Database-এ message save
        const statement = db.prepare(`
            INSERT INTO contacts
            (name, email, subject, message)
            VALUES (?, ?, ?, ?)
        `);

        statement.run(
            name.trim(),
            email.trim(),
            subject.trim(),
            message.trim()
        );

        res.status(201).json({
            success: true,
            message: "আপনার মেসেজ সফলভাবে পাঠানো হয়েছে।"
        });

    } catch (error) {

        console.error("Contact Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error হয়েছে। পরে আবার চেষ্টা করুন।"
        });
    }
});

// ===============================
// Projects API
// ===============================

app.get("/api/projects", (req, res) => {

    try {

        const projects = db
            .prepare("SELECT * FROM projects ORDER BY id DESC")
            .all();

        res.json({
            success: true,
            projects: projects
        });

    } catch (error) {

        console.error("Project Error:", error);

        res.status(500).json({
            success: false,
            message: "Project load করা যায়নি।"
        });
    }
});

// ===============================
// Single Project API
// ===============================

app.get("/api/projects/:id", (req, res) => {

    try {

        const project = db
            .prepare("SELECT * FROM projects WHERE id = ?")
            .get(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project পাওয়া যায়নি।"
            });
        }

        res.json({
            success: true,
            project: project
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error হয়েছে।"
        });
    }
});

// ===============================
// 404 API Handler
// ===============================

app.use("/api", (req, res) => {

    res.status(404).json({
        success: false,
        message: "API endpoint পাওয়া যায়নি।"
    });
});

// ===============================
// Main Page
// ===============================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

// ===============================
// Server Start
// ===============================

app.listen(PORT, () => {

    console.log(`
=================================
Portfolio Server Started
=================================

Website:
http://localhost:${PORT}

API:
http://localhost:${PORT}/api/projects

Server বন্ধ করতে:
Ctrl + C
`);
});
