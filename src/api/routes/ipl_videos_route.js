const { Router } = require("express")
const IplVideosCtrl = require("../controllers/ipl_videos_controller")

const router = new Router()

router.get("/app/", IplVideosCtrl.apiAppGetIplVideos)
router.get("/app/:type", IplVideosCtrl.getAppIplVideos)
router.post("/app/playurl", IplVideosCtrl.apiAppGetPlayUrlById) // not in use
router.get("/app/detail/:ID", IplVideosCtrl.apiAppGetVideoById)
router.post("/app/ipl_playtracking",IplVideosCtrl.apiAppPlayTracking)
router.get("/app/midpage/:slug",IplVideosCtrl.apiAppGetMidpage)

router.get("/web/", IplVideosCtrl.apiWebGetIplVideos)
router.get("/web/:type", IplVideosCtrl.getWebIplVideos)
router.post("/web/playurl", IplVideosCtrl.apiWebGetPlayUrlById)
router.get("/web/detail/:ID", IplVideosCtrl.apiWebGetVideoById)
router.get("/web/midpage/:slug",IplVideosCtrl.apiAppGetMidpage)

module.exports = router
