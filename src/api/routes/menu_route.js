const { Router } = require("express");
const { route } = require("../../server");
const pagesCtrl = require("../controllers/menu_controller")

const router = new Router()

// associate put, delete, and get(id)
router.get("/web/menu", pagesCtrl.webMenus);
router.get("/sponsors",pagesCtrl.webSponsors);

module.exports = router;
