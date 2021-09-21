const { Router } = require("express")
const pagesCtrl = require("../controllers/menu_controller")

const router = new Router()

// associate put, delete, and get(id)
router.get("/web/menu", pagesCtrl.webMenus);
router.get("/app/menu", pagesCtrl.appMenus);

module.exports = router;
