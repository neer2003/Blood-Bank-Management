const express = require("express");
const fs = require("fs");
const cors = require("cors");
const { start } = require("repl");

const app = express();
app.use(express.json());
app.use(cors());

const filename = "donors.txt";

// Read donors from file
function loadDonors() {
    if (!fs.existsSync(filename)) return [];

    let data = fs.readFileSync(filename, "utf8").trim();
    if (!data) return [];

    let donors = [];

    let lines = data.split("\n");

    lines.forEach(line => {
        if (!line.trim()) return;

        // split by ANY spaces
        let parts = line.trim().split(/\s+/);

        // Your format = exactly 5 parts
        if (parts.length < 5) return;

        let id = parseInt(parts[0]);

        const [name, age] = parts[1].split("|");

        const gender = parts[2];
        const bloodGroup = parts[3];
        const contact = parts[4];

        donors.push({
            id,
            name,
            age,
            gender,
            bloodGroup,
            contact
        });
    });

    return donors;
}

// Save donors to file
function saveDonors(donors) {
    let out = "";
    donors.forEach(d => {
        out += `${d.id} ${d.name}|${d.age} ${d.gender} ${d.bloodGroup} ${d.contact}\n`;
    });
    fs.writeFileSync(filename, out);
}

// -------- API Endpoints ----------

// Get all donors
app.get("/donors", (req, res) => {
    res.json(loadDonors());
});

// Add donor
app.post("/donors", (req, res) => {
    let donors = loadDonors();
    let newId = donors.length ? donors[donors.length - 1].id + 1 : 1;

    let newDonor = {
        id: newId,
        name: req.body.name,
        age: req.body.age,
        gender: req.body.gender,
        bloodGroup: req.body.bloodGroup,
        contact: req.body.contact
    };

    donors.push(newDonor);
    saveDonors(donors);

    res.json({ message: "Donor added", donor: newDonor });
});

// Search by blood group
app.get("/search", (req, res) => {
    let bg = req.query.bloodGroup;
    let donors = loadDonors();

    let result = donors.filter(d => d.bloodGroup === bg);
    res.json(result);
});

// Delete donor
app.delete("/donors/:id", (req, res) => {
    let id = parseInt(req.params.id);
    let donors = loadDonors();

    let filtered = donors.filter(d => d.id !== id);
    saveDonors(filtered);

    res.json({ message: "Donor deleted" });
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
