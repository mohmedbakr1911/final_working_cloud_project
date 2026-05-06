const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(8080, () => {
    console.log('Frontend Service Live on Port 8080');
});