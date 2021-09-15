const { Router } = require("express")
const iplMatchCtrl = require("../controllers/matches_controller")

const router = new Router()
router.get("/app/:type", iplMatchCtrl.apiAppGetMatch)
router.get("/app/detail/:ID", iplMatchCtrl.apiAppGetMatchById)

router.get("/web/:type", iplMatchCtrl.apiWebGetMatch)
router.get("/web/detail/:ID", iplMatchCtrl.apiWebGetMatchById)

module.exports = router
