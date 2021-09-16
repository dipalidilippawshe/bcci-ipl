const { Router } = require("express")
const iplMatchCtrl = require("../controllers/ipl_match_controller")

const router = new Router()
router.get("/app/:type", iplMatchCtrl.apiAppGetMatch)
router.get("/app/detail/:ID", iplMatchCtrl.apiAppGetMatchById)
router.get("/app/franchise/detail/:ID", iplMatchCtrl.apiAppGetFranchiseById)


router.get("/web/:type", iplMatchCtrl.apiWebGetMatch)
router.get("/web/detail/:ID", iplMatchCtrl.apiWebGetMatchById)
router.get("/web/franchise/detail/:ID", iplMatchCtrl.apiWebGetFranchiseById)
module.exports = router