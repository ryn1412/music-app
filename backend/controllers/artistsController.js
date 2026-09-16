// controllers/artistsController.js
// Handles all the logic for the /artists routes.

const { db } = require('../db');

// GET /artists - send back every artist
function getAllArtists(req, res) {
  try {
    var artists = db.prepare('SELECT * FROM artists ORDER BY artist_id').all();
    res.status(200).json(artists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /artists/:id - send back one artist
function getArtistById(req, res) {
  try {
    var artist = db.prepare('SELECT * FROM artists WHERE artist_id = ?').get(req.params.id);

    if (!artist) {
      res.status(404).json({ error: 'Artist not found' });
      return;
    }

    res.status(200).json(artist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /artists - create a new artist
function createArtist(req, res) {
  try {
    var name = req.body.artist_name;
    var genre = req.body.genre;
    var listeners = req.body.monthly_listeners;

    if (!name) {
      res.status(400).json({ error: 'artist_name is required' });
      return;
    }
    if (!listeners) {
      listeners = 0;
    }

    var insertResult = db
      .prepare('INSERT INTO artists (artist_name, genre, monthly_listeners) VALUES (?, ?, ?)')
      .run(name, genre, listeners);

    var newArtist = db
      .prepare('SELECT * FROM artists WHERE artist_id = ?')
      .get(insertResult.lastInsertRowid);

    res.status(201).json(newArtist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /artists/:id - update an artist that already exists
function updateArtist(req, res) {
  try {
    var existingArtist = db.prepare('SELECT * FROM artists WHERE artist_id = ?').get(req.params.id);

    if (!existingArtist) {
      res.status(404).json({ error: 'Artist not found' });
      return;
    }

    // If the request didn't send a field, keep the old value.
    var name = req.body.artist_name ? req.body.artist_name : existingArtist.artist_name;
    var genre = req.body.genre ? req.body.genre : existingArtist.genre;
    var listeners = req.body.monthly_listeners ? req.body.monthly_listeners : existingArtist.monthly_listeners;

    db.prepare('UPDATE artists SET artist_name = ?, genre = ?, monthly_listeners = ? WHERE artist_id = ?')
      .run(name, genre, listeners, req.params.id);

    var updatedArtist = db.prepare('SELECT * FROM artists WHERE artist_id = ?').get(req.params.id);
    res.status(200).json(updatedArtist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /artists/:id - delete an artist
// Because of ON DELETE CASCADE in model.sql, this also removes
// that artist's albums, and those albums' songs.
function deleteArtist(req, res) {
  try {
    var existingArtist = db.prepare('SELECT * FROM artists WHERE artist_id = ?').get(req.params.id);

    if (!existingArtist) {
      res.status(404).json({ error: 'Artist not found' });
      return;
    }

    db.prepare('DELETE FROM artists WHERE artist_id = ?').run(req.params.id);
    res.status(200).json({ message: 'Artist deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllArtists: getAllArtists,
  getArtistById: getArtistById,
  createArtist: createArtist,
  updateArtist: updateArtist,
  deleteArtist: deleteArtist
};
