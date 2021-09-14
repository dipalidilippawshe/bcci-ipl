const { Router } = require("express")
const pagesCtrl = require("../controllers/pages_controller")

const router = new Router()

// associate put, delete, and get(id)
router.get("/app/home", pagesCtrl.appHomepage);
router.get("/web/home", pagesCtrl.webHomepage);


module.exports = router;
