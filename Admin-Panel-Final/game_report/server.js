const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Initialize `io` during its declaration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = 3000;

// Paths to your files
const resultsFilePath = path.resolve(__dirname, 'results.json'); // results.json is in the same folder as server.js
const htmlFilePath = path.resolve(__dirname, '../../admin-web/game_report.html'); // Navigate up two directories to locate game_report.html

app.use(cors({ origin: '*' }));

// Enable JSON parsing for POST requests
app.use(express.json());

// Serve static files for the frontend
app.use(express.static(path.dirname(htmlFilePath)));

// Serve the HTML file at the root
app.get('/', (req, res) => {
  res.sendFile(htmlFilePath);
});

// API endpoint to fetch quiz results
app.get('/results', (req, res) => {
  try {
    const data = fs.readFileSync(resultsFilePath, 'utf8');
    let results = JSON.parse(data);

    // Sort results by score in descending order
    results.sort((a, b) => b.score - a.score);

    res.status(200).json(results);
  } catch (err) {
    console.error('Error reading results.json:', err.message);
    res.status(500).json({ error: 'Unable to read results file.' });
  }
});

// API endpoint to update quiz results
app.post('/results', (req, res) => {
  try {
    const newResult = req.body;

    if (!newResult.nickname || newResult.score === undefined || typeof newResult.score !== 'number' || !newResult.total) {
      return res.status(400).json({ error: 'Invalid result format. "nickname", "score", and "total" are required.' });
    }

    // Calculate percentages
    const correctPercentage = ((newResult.score / newResult.total) * 100).toFixed(2); 
    const wrongPercentage = (100 - correctPercentage).toFixed(2); // Correct the name here

    // Read current results
    const data = fs.readFileSync(resultsFilePath, 'utf8');
    let results = JSON.parse(data);

    // Add new result
    newResult.timestamp = Date.now(); // Add a timestamp for sorting
    newResult.correctPercentage = correctPercentage;
    newResult.wrongPercentage = wrongPercentage; // Change this
    results.push(newResult);

    // Sort results by score in descending order
    results.sort((a, b) => b.score - a.score);

    // Write back to the file
    fs.writeFileSync(resultsFilePath, JSON.stringify(results, null, 2));

    // Emit updated results to all connected clients
    io.emit('fileUpdated', results);

    res.status(200).json({ message: 'Result added successfully.' });
  } catch (err) {
    console.error('Error updating results.json:', err.message);
    res.status(500).json({ error: 'Unable to update results file.' });
  }
});

// Watch the results.json file for changes
fs.watchFile(resultsFilePath, (curr, prev) => {
  console.log('results.json file changed.');
  try {
    const data = fs.readFileSync(resultsFilePath, 'utf8');
    let results = JSON.parse(data);

    // Sort results by score in descending order
    results.sort((a, b) => b.score - a.score);

    console.log('Broadcasting updated results:', results);
    io.emit('fileUpdated', results); // Broadcast to clients
  } catch (err) {
    console.error('Error parsing JSON:', err.message);
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://172.20.10.2:${PORT}`);
});
