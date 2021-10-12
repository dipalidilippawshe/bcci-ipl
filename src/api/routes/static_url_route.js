const { Router } = require("express")
const Config = require("../controllers/static_url_controller")

const router = new Router()

router.get("/", Config.getConfigdata)



module.exports = router

