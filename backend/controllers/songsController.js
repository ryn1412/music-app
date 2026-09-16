// controllers/songsController.js
// Handles all the logic for the /songs routes.

const { db } = require('../db');

// GET /songs - send back every song
function getAllSongs(req, res) {
  try {
    var songs = db.prepare('SELECT * FROM songs ORDER BY song_id').all();
    res.status(200).json(songs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /songs/:id - send back one song
function getSongById(req, res) {
  try {
    var song = db.prepare('SELECT * FROM songs WHERE song_id = ?').get(req.params.id);

    if (!song) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }

    res.status(200).json(song);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /songs - create a new song
function createSong(req, res) {
  try {
    var name = req.body.song_name;
    var year = req.body.release_year;
    var albumId = req.body.album_id;

    if (!name) {
      res.status(400).json({ error: 'song_name is required' });
      return;
    }
    if (!albumId) {
      res.status(400).json({ error: 'album_id is required' });
      return;
    }

    // Make sure the album we are pointing to actually exists.
    var album = db.prepare('SELECT * FROM albums WHERE album_id = ?').get(albumId);
    if (!album) {
      res.status(400).json({ error: 'That album_id does not exist' });
      return;
    }

    var insertResult = db
      .prepare('INSERT INTO songs (song_name, release_year, album_id) VALUES (?, ?, ?)')
      .run(name, year, albumId);

    var newSong = db
      .prepare('SELECT * FROM songs WHERE song_id = ?')
      .get(insertResult.lastInsertRowid);

    res.status(201).json(newSong);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /songs/:id - update a song that already exists
function updateSong(req, res) {
  try {
    var existingSong = db.prepare('SELECT * FROM songs WHERE song_id = ?').get(req.params.id);

    if (!existingSong) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }

    var name = req.body.song_name ? req.body.song_name : existingSong.song_name;
    var year = req.body.release_year ? req.body.release_year : existingSong.release_year;
    var albumId = req.body.album_id ? req.body.album_id : existingSong.album_id;

    if (req.body.album_id) {
      var album = db.prepare('SELECT * FROM albums WHERE album_id = ?').get(albumId);
      if (!album) {
        res.status(400).json({ error: 'That album_id does not exist' });
        return;
      }
    }

    db.prepare('UPDATE songs SET song_name = ?, release_year = ?, album_id = ? WHERE song_id = ?')
      .run(name, year, albumId, req.params.id);

    var updatedSong = db.prepare('SELECT * FROM songs WHERE song_id = ?').get(req.params.id);
    res.status(200).json(updatedSong);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /songs/:id - delete a song
function deleteSong(req, res) {
  try {
    var existingSong = db.prepare('SELECT * FROM songs WHERE song_id = ?').get(req.params.id);

    if (!existingSong) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }

    db.prepare('DELETE FROM songs WHERE song_id = ?').run(req.params.id);
    res.status(200).json({ message: 'Song deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllSongs: getAllSongs,
  getSongById: getSongById,
  createSong: createSong,
  updateSong: updateSong,
  deleteSong: deleteSong
};
