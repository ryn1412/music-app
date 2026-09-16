// routes/albums.js
const express = require('express');
const router = express.Router();
const albumsController = require('../controllers/albumsController');

router.get('/', albumsController.getAllAlbums);
router.get('/:id', albumsController.getAlbumById);
router.post('/', albumsController.createAlbum);
router.put('/:id', albumsController.updateAlbum);
router.patch('/:id', albumsController.updateAlbum);
router.delete('/:id', albumsController.deleteAlbum);

module.exports = router;
