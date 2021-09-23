const {Router} = require('express');
const IplArticleCtrl = require('../controllers/ipl_articles_controller');
const router = new Router();


router.get("/app/:type", IplArticleCtrl.apiAppGetIplArticleList)
router.get("/app/detail/:ID",IplArticleCtrl.apiAppGetIplArticleById)
router.get("/app/details/:id")

router.get("/web/:type",IplArticleCtrl.apiWebGetIplArticleList)
router.get("/web/detail/:ID",IplArticleCtrl.apiWebGetIplArticleById);

module.exports = router;