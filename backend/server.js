// server.js
// This is the starting point of the backend. It sets up Express,
// connects the routes, and starts listening for requests.

const express = require('express');
const cors = require('cors');
const db = require('./db');

const artistsRouter = require('./routes/artists');
const albumsRouter = require('./routes/albums');
const songsRouter = require('./routes/songs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create the database tables
db.initDb();

// A simple route just to check the server is alive
app.get('/', function (req, res) {
  res.json({ message: 'Music Library API is running' });
});

// Connect each resource to its routes
app.use('/artists', artistsRouter);
app.use('/albums', albumsRouter);
app.use('/songs', songsRouter);

// If nothing above matched, send back a 404
app.use(function (req, res) {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, function () {
  console.log('Music Library API listening on http://localhost:' + PORT);
});
