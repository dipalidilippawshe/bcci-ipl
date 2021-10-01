const { Router } = require("express")
const AuctionCtrl = require("../controllers/auction_controller")

const router = new Router()

router.get("/app/:year", AuctionCtrl.apiAppGetAuction)
router.get("/web/:year", AuctionCtrl.apiWebGetAuction)


module.exports = router
