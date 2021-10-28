const { Router } = require("express")
const pagesCtrl = require("../controllers/pages_controller")

const router = new Router()

// associate put, delete, and get(id)
router.get("/app/home", pagesCtrl.appHomepage);
router.get("/web/home", pagesCtrl.webHomepage);
router.get("/app/video-list", pagesCtrl.appVideoLIstpage);
router.get("/web/video-list", pagesCtrl.webVideoLIstpage);
router.get("/app/news-list", pagesCtrl.appNewsLIstpage);
router.get("/web/news-list", pagesCtrl.webNewsLIstpage);

router.get("/web/homenumbers",pagesCtrl.webHomeNumbers);
//leaders api
router.post("/web/leaders",pagesCtrl.getapiWebLeaders);

module.exports = router;
