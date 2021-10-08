const { Router } = require('express');
const IplArticleCtrl = require('../controllers/ipl_articles_controller');
const router = new Router();


router.get("/app/:type", IplArticleCtrl.apiAppGetIplArticleList)
router.get("/app/detail/:ID", IplArticleCtrl.apiAppGetIplArticleById)
router.get("/app/details/:id")
router.get("/app/teamnews/:ID", IplArticleCtrl.apiAppGetIplArticleTeamById);

router.get("/web/:type", IplArticleCtrl.apiWebGetIplArticleList)
router.get("/web/detail/:ID", IplArticleCtrl.apiWebGetIplArticleById);
router.get("/web/teamnews/:ID", IplArticleCtrl.apiWebGetIplArticleTeamById);

//midpages
router.get("/app/midpage/:slug",IplArticleCtrl.apiAppGetMidpage)
router.get("/web/midpage/:slug",IplArticleCtrl.apiAppGetMidpage)
module.exports = router;