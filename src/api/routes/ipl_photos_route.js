const { Router } = require("express")
const PhotosCtrl = require("../controllers/ipl_photos_controller")

const router = new Router()
router.get("/app/", PhotosCtrl.apiAppGetPhotos)
router.get("/web/", PhotosCtrl.apiWebGetPhotos)

router.get("/app/detail/:ID", PhotosCtrl.apiAppGetPhotoById)
router.get("/web/detail/:ID", PhotosCtrl.apiWebGetPhotoById)

module.exports = router