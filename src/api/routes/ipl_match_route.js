const { Router } = require("express")
const iplMatchCtrl = require("../controllers/ipl_match_controller")

const router = new Router()
router.get("/app/:type", iplMatchCtrl.apiAppGetMatch)
router.get("/app/detail/:ID", iplMatchCtrl.apiAppGetMatchById)
router.get("/app/franchise/detail/:ID", iplMatchCtrl.apiAppGetFranchiseById)
router.post("/app/fixtures", iplMatchCtrl.apiAppGetFixtures);
router.post("/app/results", iplMatchCtrl.apiAppGetResults);
//result match id wise videos data
router.get("/app/videoByMatch/:ID", iplMatchCtrl.apiAppGetVideoByMatchId)
router.get("/web/teamSchedule/:ID",iplMatchCtrl.apiScheduleById)

router.get("/web/:type", iplMatchCtrl.apiWebGetMatch)
router.get("/web/detail/:ID", iplMatchCtrl.apiWebGetMatchById)
router.get("/web/franchise/detail/:ID", iplMatchCtrl.apiWebGetFranchiseById)

//Teams 
router.get("/web/teams/list",iplMatchCtrl.apiWebGetTeams)
router.get("/web/franchise/teams-list", iplMatchCtrl.apiWebGetTeams)
router.get("/web/franchise/venue-list", iplMatchCtrl.apiWebGetVenue)
router.get("/web/franchise/season-list", iplMatchCtrl.apiWebGetSeasonList)
module.exports = router