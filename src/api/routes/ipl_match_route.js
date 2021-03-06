const { Router } = require("express")
const iplMatchCtrl = require("../controllers/ipl_match_controller")

const router = new Router()
router.get("/app/teamsLogo", iplMatchCtrl.getTeamsLogo);
router.get("/app/:type", iplMatchCtrl.apiAppGetMatch)
router.get("/app/detail/:ID", iplMatchCtrl.apiAppGetMatchById)
router.get("/app/franchise/detail/:ID", iplMatchCtrl.apiAppGetFranchiseById)
router.post("/app/fixtures", iplMatchCtrl.apiAppGetFixtures);
router.post("/app/results", iplMatchCtrl.apiAppGetResults);
router.get("/app/results/:match_id", iplMatchCtrl.apiAppGetResultsByMatchId);
router.get("/app/fixtures/:match_Id",iplMatchCtrl.apiAppGetFranchesByMatchId);
router.get("/app/franchise/season-list", iplMatchCtrl.apiWebGetSeasonList);
//teams
//router.get("/app/teams/list", iplMatchCtrl.apiAppGetTeams)
router.get("/app/franchise/teams-list", iplMatchCtrl.apiAppGetTeams)

//result match id wise videos data
router.get("/app/videoByMatch/:ID", iplMatchCtrl.apiAppGetVideoByMatchId)
router.get("/web/teamSchedule/:ID", iplMatchCtrl.apiScheduleById)

router.get("/web/:type", iplMatchCtrl.apiWebGetMatch)
router.get("/web/detail/:ID", iplMatchCtrl.apiWebGetMatchById)
router.get("/web/franchise/detail/:ID", iplMatchCtrl.apiWebGetFranchiseById)
router.get("/web/squadlist/:ID", iplMatchCtrl.apiWebGetSquadById)

//Teams 
//router.get("/web/teams/list", iplMatchCtrl.apiWebGetTeams)
router.get("/web/franchise/teams-list", iplMatchCtrl.apiWebGetTeams)
router.get("/web/franchise/venue-list", iplMatchCtrl.apiWebGetVenue)
router.get("/web/franchise/venue-detail/:ID",iplMatchCtrl.apiWebGetVenueDetail)
router.get("/web/franchise/season-list", iplMatchCtrl.apiWebGetSeasonList)
router.get("/web/archive/:franchise_id", iplMatchCtrl.apiWebArchiveByTeam)

//team-match centre
router.get("/web/franchise/team-results/:type",iplMatchCtrl.apiWebTeamsResults)
router.get("/app/franchise/team-results/:type",iplMatchCtrl.apiWebTeamsResults)
//stats apis
router.post("/app/stats", iplMatchCtrl.getAppStatsData);
router.post("/app/playersdetails", iplMatchCtrl.getAppPlayersDetails);

//stats web
router.post("/web/stats", iplMatchCtrl.getWebStatsData);
router.post("/web/playersdetails", iplMatchCtrl.getWebPlayersDetails);

router.post("/web/playerstats",iplMatchCtrl.getStatsPerPlayer);

//leaders api
router.post("/web/leaders",iplMatchCtrl.getapiWebLeaders);

//reports
router.get("/web/match/reports",iplMatchCtrl.getReportsByMatch);

//headshorts
router.get("/web/addheadshots/players",iplMatchCtrl.addheadshots);

module.exports = router