// routes/songs.js
const express = require('express');
const router = express.Router();
const songsController = require('../controllers/songsController');

router.get('/', songsController.getAllSongs);
router.get('/:id', songsController.getSongById);
router.post('/', songsController.createSong);
router.put('/:id', songsController.updateSong);
router.patch('/:id', songsController.updateSong);
router.delete('/:id', songsController.deleteSong);

module.exports = router;
