const {Router} = require('express');
const iplPagesDao = require('../controllers/ipl_pages_controller');
const router = new Router();


router.get('/app',iplPagesDao.homeIplPagesForApp);
router.get('/web',iplPagesDao.homeIplPagesForWeb);


module.exports = router;