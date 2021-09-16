const { Router } = require("express")
const playlistCtrl = require("../controllers/playlist_controller")

const router = new Router()

router.get("/app/:type", playlistCtrl.getAppPlaylistbyType)

router.get("/web/:type", playlistCtrl.getWebPlaylistbyType)

module.exports = router
