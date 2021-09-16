const { Router } = require("express")
const BiosCtrl = require("../controllers/bios_controller")

const router = new Router()

router.get("/app/detail/:ID", BiosCtrl.apiAppGetBioById)

router.get("/web/detail/:ID", BiosCtrl.apiWebGetBioById)



module.exports = router
