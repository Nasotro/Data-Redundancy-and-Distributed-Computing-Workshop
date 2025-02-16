const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

// Enable CORS for all origins
app.use(cors());

// The URL of the E-Commerce API
let SERVER_URL = 'localhost:5000';

// Simulate a DNS change or fallback mechanism
app.get('/getServer', (req, res) => {
    // Check if the primary server is down
    const isPrimaryServerDown = false; // Simulate the primary server being down
    if (isPrimaryServerDown) {
        SERVER_URL = 'backup-server:5001'; // Fallback to a backup server
    }
    res.json({ code: 200, server: SERVER_URL });
});

app.listen(PORT, () => {
    console.log(`The DNS Registry is running on http://localhost:${PORT}`);
});
