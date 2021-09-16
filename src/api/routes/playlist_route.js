const playlistCtrl = require('../controllers/playlist_controller');
const { Router } = require('express');
const router = new Router();

//playlist routes
router.get('/app/detail/:id', playlistCtrl.apiAppGetPlaylistById);
router.get('/web/detail/:id', playlistCtrl.apiWebGetPlaylistById);


module.exports = router;