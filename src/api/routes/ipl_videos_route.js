const { Router } = require("express")
const IplVideosCtrl = require("../controllers/ipl_videos_controller")

const router = new Router()

router.get("/app/", IplVideosCtrl.apiAppGetIplVideos)
router.get("/app/:type", IplVideosCtrl.getAppIplVideos)
router.post("/app/playurl", IplVideosCtrl.apiAppGetPlayUrlById)
router.get("/app/detail/:ID", IplVideosCtrl.apiAppGetVideoById)
//router.get("/app/promos/list", IplVideosCtrl.apiAppGetPromos)
//router.get("/app/promos/detail/:ID", IplVideosCtrl.apiAppGetPromoById)

router.get("/web/", IplVideosCtrl.apiWebGetIplVideos)
router.get("/web/:type", IplVideosCtrl.getWebIplVideos)
router.post("/web/playurl", IplVideosCtrl.apiWebGetPlayUrlById)
router.get("/web/detail/:ID", IplVideosCtrl.apiWebGetVideoById)
//router.get("/web/promos/list", IplVideosCtrl.apiWebGetPromos)
//router.get("/web/promos/detail/:ID", IplVideosCtrl.apiWebGetPromoById)

module.exports = router
