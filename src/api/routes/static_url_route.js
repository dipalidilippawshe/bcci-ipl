const { Router } = require("express")
const Config = require("../controllers/static_url_controller")

const router = new Router()

router.get("/", Config.getConfigdata)
router.get("/getbrighcoveturl",Config.brightCoveKey)
router.get("/registerbrightcovekey",Config.publicKeyRegistration)

module.exports = router

