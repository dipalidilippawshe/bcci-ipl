const { Router } = require('express');
const promosController = require("../controllers/promos_controller")
const router = new Router();

//promo routes
router.get('/app/detail/:id', promosController.apiAppGetPromoById);
router.get('/web/detail/:id', promosController.apiWebGetPromoById);

module.exports = router;