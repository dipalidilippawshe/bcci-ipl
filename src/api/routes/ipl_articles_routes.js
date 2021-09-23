const {Router} = require('express');
const IplArticleCtrl = require('../controllers/ipl_articles_controller');
const router = new Router();


router.get("/app/:type", IplArticleCtrl.apiAppGetIplArticleList)
router.get("/app/detail/:ID",IplArticleCtrl.apiAppGetIplArticleById)
router.get("/app/details/:id")

router.get("/web/",IplArticleCtrl.apiWebGetIplArticleList)
router.get("/web/detail/:ID",IplArticleCtrl.apiWebGetIplArticleById);
router.get("/web/teamnews/:ID",IplArticleCtrl.apiWebGetIplArticleTeamById);

module.exports = router;