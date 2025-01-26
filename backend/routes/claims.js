const express = require("express");
const router = express.Router();
const db = require("../database");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const fs = require("fs");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store files in 'uploads/' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); 
    }
});

const upload = multer({ storage: storage });


router.post("/submit-claim", upload.single('proof'), (req, res) => {
    const { name, email, policy, damage, estimatedValue } = req.body;
    const file = req.file ? req.file.filename : null;  

    if (!name || !email || !policy || !damage || !estimatedValue || !file) {
        return res.status(400).json({ error: "All fields are required" });
    }

    db.run(
        `INSERT INTO claims (name, email, policy, damage, estimatedValue, file) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, policy, damage, estimatedValue, file],
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
        `SELECT id, name, email, policy, damage, estimatedValue, createdAt, file 
         FROM claims 
         WHERE email = ? 
         ORDER BY createdAt DESC`,
        [email],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            if (rows.length === 0) {
                return res.json({ message: "No claims found for this email." });
            }

            // Send rows as the response
            res.json(rows);
        }
    );
});

// Generate and download the PDF of a claim
// Generate and download the PDF of a claim
router.get("/download-claim", (req, res) => {
    const { email, claimId } = req.query;

    if (!email || !claimId) {
        return res.status(400).json({ error: "Email and claim ID are required" });
    }

    db.get(`SELECT * FROM claims WHERE id = ? AND email = ?`, [claimId, email], (err, claim) => {
        if (err || !claim) return res.status(404).json({ error: "Claim not found" });

        const doc = new PDFDocument();
        const filePath = `./downloads/claim_${claimId}.pdf`;

        doc.pipe(fs.createWriteStream(filePath)); // Write the PDF to the file system
        doc.text("Wildfire Insurance Claim Report", { align: "center", fontSize: 20 });
        doc.text(`Name: ${claim.name}`);
        doc.text(`Policy Number: ${claim.policy}`);
        doc.text(`Damage: ${claim.damage}`);
        doc.text(`Estimated Loss: $${claim.estimatedValue}`);
        doc.text(`Submitted On: ${claim.createdAt}`);
        
        // If the file exists, add its link to the PDF (correct URL for file)
        if (claim.file) {
            doc.text(`Uploaded File: ${claim.file}`);
            // Correct file URL without duplicating 'uploads/'
            doc.text(`View File: http://localhost:5001/uploads/${claim.file}`);
        }

        doc.end();

        // After the PDF is created, allow it to be downloaded
        res.download(filePath);
    });
});


module.exports = router;
