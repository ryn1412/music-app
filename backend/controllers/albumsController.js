// controllers/albumsController.js
// Handles all the logic for the /albums routes.

const { db } = require('../db');

// GET /albums - send back every album
function getAllAlbums(req, res) {
  try {
    var albums = db.prepare('SELECT * FROM albums ORDER BY album_id').all();
    res.status(200).json(albums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /albums/:id - send back one album
function getAlbumById(req, res) {
  try {
    var album = db.prepare('SELECT * FROM albums WHERE album_id = ?').get(req.params.id);

    if (!album) {
      res.status(404).json({ error: 'Album not found' });
      return;
    }

    res.status(200).json(album);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /albums - create a new album
function createAlbum(req, res) {
  try {
    var name = req.body.album_name;
    var year = req.body.release_year;
    var listens = req.body.number_of_listens;
    var artistId = req.body.artist_id;

    if (!name) {
      res.status(400).json({ error: 'album_name is required' });
      return;
    }
    if (!artistId) {
      res.status(400).json({ error: 'artist_id is required' });
      return;
    }
    if (!listens) {
      listens = 0;
    }

    // Make sure the artist we are pointing to actually exists.
    var artist = db.prepare('SELECT * FROM artists WHERE artist_id = ?').get(artistId);
    if (!artist) {
      res.status(400).json({ error: 'That artist_id does not exist' });
      return;
    }

    var insertResult = db
      .prepare('INSERT INTO albums (album_name, release_year, number_of_listens, artist_id) VALUES (?, ?, ?, ?)')
      .run(name, year, listens, artistId);

    var newAlbum = db
      .prepare('SELECT * FROM albums WHERE album_id = ?')
      .get(insertResult.lastInsertRowid);

    res.status(201).json(newAlbum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /albums/:id - update an album that already exists
function updateAlbum(req, res) {
  try {
    var existingAlbum = db.prepare('SELECT * FROM albums WHERE album_id = ?').get(req.params.id);

    if (!existingAlbum) {
      res.status(404).json({ error: 'Album not found' });
      return;
    }

    var name = req.body.album_name ? req.body.album_name : existingAlbum.album_name;
    var year = req.body.release_year ? req.body.release_year : existingAlbum.release_year;
    var listens = req.body.number_of_listens ? req.body.number_of_listens : existingAlbum.number_of_listens;
    var artistId = req.body.artist_id ? req.body.artist_id : existingAlbum.artist_id;

    if (req.body.artist_id) {
      var artist = db.prepare('SELECT * FROM artists WHERE artist_id = ?').get(artistId);
      if (!artist) {
        res.status(400).json({ error: 'That artist_id does not exist' });
        return;
      }
    }

    db.prepare('UPDATE albums SET album_name = ?, release_year = ?, number_of_listens = ?, artist_id = ? WHERE album_id = ?')
      .run(name, year, listens, artistId, req.params.id);

    var updatedAlbum = db.prepare('SELECT * FROM albums WHERE album_id = ?').get(req.params.id);
    res.status(200).json(updatedAlbum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /albums/:id - delete an album
// Because of ON DELETE CASCADE, this also removes that album's songs.
function deleteAlbum(req, res) {
  try {
    var existingAlbum = db.prepare('SELECT * FROM albums WHERE album_id = ?').get(req.params.id);

    if (!existingAlbum) {
      res.status(404).json({ error: 'Album not found' });
      return;
    }

    db.prepare('DELETE FROM albums WHERE album_id = ?').run(req.params.id);
    res.status(200).json({ message: 'Album deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllAlbums: getAllAlbums,
  getAlbumById: getAlbumById,
  createAlbum: createAlbum,
  updateAlbum: updateAlbum,
  deleteAlbum: deleteAlbum
};
