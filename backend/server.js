const express = require("express");
const multer = require("multer");
const router = express.Router();  //does this exist?
const db = require("./database");
const cors = require('cors');
const path = require("path");



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());  
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use(router);

//all fields are collected
router.post("/submit-claim", upload.single('proof'), (req, res) => {
    const { name, email, policy, damage, estimatedValue } = req.body;
    const file = req.file ? req.file.filename : null;

    //debug
    console.log("Received form data:", { name, email, policy, damage, estimatedValue });
    console.log("File received:", file); 

    if (!name || !email || !policy || !damage || !estimatedValue) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const filePath = file ? file.path : null;

    db.run(
        `INSERT INTO claims (name, email, policy, damage, estimatedValue, file) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, policy, damage, estimatedValue, file],  // File column contains the filename only
        function (err) {
            if (err) {
                console.log("Database Error: ", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: "Claim submitted successfully", id: this.lastID });
        }
    );
    
});



router.get("/claims", (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: "Email is required to track claims" });
    }

    db.all(
        `SELECT id, name, email, policy, damage, estimatedValue, file, createdAt 
         FROM claims 
         WHERE email = ? 
         ORDER BY createdAt DESC`, 
        [email], 
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            if (rows.length === 0) {
                return res.json({ message: "No claims found for this email." });
            }
            res.json(rows);
        }
    );
});


app.listen(5001, () => {
    console.log("Server running on port 5001");
});

