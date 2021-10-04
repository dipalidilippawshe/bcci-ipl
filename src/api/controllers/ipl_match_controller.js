const MatchDAO = require("../../dao/ipl_match_dao")
const RecordDAO = require("../../dao/ipl_franchise_years_dao")
const franchiseDAO = require("../../dao/ipl_franchise_dao")
const videosDAO = require("../../dao/ipl_videos_dao");
const IplArticlesDAO = require("../../dao/ipl_articles_dao")
const config = require("config")

module.exports = class MatchController {
    static async apiAppGetMatch(req, res, next) {
        const FIXTURES_PER_PAGE = 20
        if (req.params.type == "team_results" || req.params.type == "fixture") {
            try {
                let filters = {}
                let type = req.params.type;
                if (type == 'fixture') {
                    filters.matchState = ["U"];
                }
                let teamId = req.query.teamId ? req.query.teamId : "";

                let page = req.query.page ? req.query.page : 1;
                let id = req.query.matchId ? req.query.matchId : ""; //This is team ID

                let idtype = teamId ? { "teamId": teamId } : { "matchId": id }

                let year = req.query.year && parseInt(req.query.year) ? parseInt(req.query.year) : new Date().getFullYear();
                console.log(year)
                let data = await MatchDAO.getTeamResultsByid(2008, page, idtype, filters)
                if (!data) {
                    res.status(404).json({ status: false, error: config.error_codes["1001"] })
                    return
                } else {
                    let response = {
                        status: true,
                        data: data.data,
                        page: page,
                        filters: {},
                        entries_per_page: FIXTURES_PER_PAGE,
                        total_results: data.total,
                    }
                    res.json(response);
                }
            } catch (e) {
                console.log(`api, ${e}`)
                res.status(500).json({ error: e })
            }
        }
        else {

            let page
            try {
                page = req.query.page ? parseInt(req.query.page, 10) : "0"
            } catch (e) {
                console.error(`Got bad value for page:, ${e}`)
                page = 0
            }

            let filters = {};
            filters.startDate = req.query.startDate && new Date(req.query.startDate) !== "Invalid Date" ? new Date(req.query.startDate).toISOString() : undefined
            filters.endDate = req.query.endDate && new Date(req.query.endDate) !== "Invalid Date" ? new Date(req.query.endDate).toISOString() : undefined
            filters.team = req.query.team ? [req.query.team] : ["m", "w"]
            console.log(req.query.startDate, new Date(req.query.startDate))
            if (req.params.type !== "" && req.params.type === "results") {
                filters.matchState = ["C"]
            } else if (req.params.type !== "" && req.params.type === "fixtures") {
                console.log("I m in else iffff");
                filters.matchState = ["U", "L"]
            } else if (req.params.type !== "" && req.params.type === "series-and-tournaments") {
                filters.matchState = ["U", "L"]
                filters.sort = 1
            } else if (req.params.type == "archive") {
                filters.matchState = ["U", "L"]
                filters.sort = -1
            }
            filters.year = req.query.year && parseInt(req.query.year) || new Date().getFullYear()
            console.log(filters)
            if (["results", "fixtures"].includes(req.params.type)) {

                const { matchesList, totalNumMatches } = await MatchDAO.getMatches({
                    filters,
                    page,
                    FIXTURES_PER_PAGE
                })
                let response = {
                    status: true,
                    data: matchesList,
                    page: page,
                    filters: {},
                    entries_per_page: FIXTURES_PER_PAGE,
                    total_results: totalNumMatches,
                }
                res.json(response)

            } else {

                const { matchesList, totalNumMatches } = await MatchDAO.getSeriesnTournaments({
                    filters, page,
                    FIXTURES_PER_PAGE
                })
                //  console.log(matchesList)
                let response = {
                    status: true,
                    data: matchesList,
                    page: page,
                    filters: {},
                    entries_per_page: FIXTURES_PER_PAGE,
                    total_results: totalNumMatches,
                }
                res.json(response)
            }
        }

    }

    static async apiAppGetMatchById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let article = await MatchDAO.getMatchByID(parseInt(id))
            if (!article) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, data: article })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiWebGetMatch(req, res, next) {
        console.log("in api webget match");
        if (req.params.type == 'season' || req.params.type == "team" || req.params.type == "venue") {
            try {


                let page = req.query.page ? req.query.page : 1;
                let id = req.query.id && parseInt(req.query.id) || "0";

                let matches = await MatchDAO.getIplMatchesFilterByType(req.params.type, page, parseInt(id))

                if (!matches) {
                    res.status(404).json({ status: false, error: config.error_codes["1001"] })
                    return
                }
                let response = {
                    status: true,
                    message: "Retrived data!",
                    matches: matches.list,
                    page: page,
                    entries_per_page: 20,
                    total_results: matches.total,
                }
                res.json(response);
            } catch (e) {
                console.log(`api, ${e}`)
                res.status(500).json({ error: e })
            }



        }
        else {
            console.log("CALLINGIN..");
            const FIXTURES_PER_PAGE = 20
            let page
            try {
                page = req.query.page ? parseInt(req.query.page, 10) : "0"
            } catch (e) {
                console.error(`Got bad value for page:, ${e}`)
                page = 0
            }

            let filters = {};
            // filters.startDate = req.query.startDate && new Date(req.query.startDate) !== "Invalid Date" ? new Date(req.query.startDate).getFullYear() : undefined
            //filters.endDate = req.query.endDate && new Date(req.query.endDate) !== "Invalid Date" ? new Date(req.query.endDate).getFullYear() : undefined
            filters.team = req.query.team ? [req.query.team] : ["m", "w"]
            if (req.query.teamId) {
                filters.team_id = req.query.teamId;
            }
            //console.log(req.query.startDate, new Date(req.query.startDate))
            if (req.params.type !== "" && req.params.type === "results") {
                filters.matchState = ["C"]
            } else if (req.params.type !== "" && req.params.type === "fixtures") {
                console.log("I m in else iffff");
                filters.matchState = ["U", "L"]
            } else if (req.params.type !== "" && req.params.type === "series-and-tournaments") {
                filters.matchState = ["U", "L"]
                filters.sort = 1
            } else if (req.params.type == "archive") {
                filters.matchState = ["U", "L"]
                filters.sort = -1
            }

            console.log(filters)
            if (["results", "fixtures"].includes(req.params.type)) {
                if (req.query.franchise_id) {
                    filters.team_id = req.query.franchise_id
                }
                filters.year = req.query.year && parseInt(req.query.year) || new Date().getFullYear()
                const { matchesList, totalNumMatches } = await MatchDAO.getMatches({
                    filters,
                    page,
                    FIXTURES_PER_PAGE
                })
                let response = {
                    status: true,
                    data: matchesList,
                    page: page,
                    filters: {},
                    entries_per_page: FIXTURES_PER_PAGE,
                    total_results: totalNumMatches,
                }
                res.json(response)

            } else {

                const { matchesList, totalNumMatches } = await MatchDAO.getSeriesnTournaments({
                    filters, page,
                    FIXTURES_PER_PAGE
                })
                //  console.log(matchesList)
                let response = {
                    status: true,
                    data: matchesList,
                    page: page,
                    filters: {},
                    entries_per_page: FIXTURES_PER_PAGE,
                    total_results: totalNumMatches,
                }
                res.json(response)
            }
        }
    }

    static async apiWebGetMatchById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let article = await MatchDAO.getMatchByID(parseInt(id))
            if (!article) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, data: article })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiAppGetFranchiseById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let year = req.query.year && parseInt(req.query.year) ? parseInt(req.query.year) : 2021

            let article = await MatchDAO.getSquadListByID({ id: parseInt(id), year: year })
            if (!article) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            //  console.log("article is: ",article);
            let frenchise = await franchiseDAO.getfrenchiseDetails(id);
            if (!frenchise || frenchise == null) {
                return res.json({ status: true, data: article })
            } else {
                console.log("elsing me...",frenchise.logo);
                var returnData = article;
                returnData[0].logo = frenchise.logo;
                returnData[0].owner = frenchise.owner;
                returnData[0].venue = frenchise.venue;

                //winning years of team
                let won = await MatchDAO.findWinsByTeam(parseInt(id), frenchise.name);

                console.log("returnData: ", won);
                returnData[0].wonYears = won;
                returnData[0].previousWin = won[won.length - 1];

                //latest news
                var page = 6;
                let Iplarticle = await IplArticlesDAO.getIplArticleByTeamsId(page, parseInt(id), year)
                returnData[0].latestNews = Iplarticle.data;
                let videos = await videosDAO.videoByTeamID(parseInt(id), page, year);
                returnData[0].latestVideos = videos.data;
                return res.json({ status: true, data: returnData })
                //console.log("frenchise is; ", frenchise);
            }

            // res.json({ status: true, data: article })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiWebGetFranchiseById(req, res, next) {
        try {
            console.log("In frenchise by id..", req.params.ID);
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let year = req.query.year && parseInt(req.query.year) ? parseInt(req.query.year) : 2021

            let article = await MatchDAO.getSquadListByID({ id: parseInt(id), year: year })
            console.log("in articles", article);
            if (!article || article.length <= 0) {
                console.log("in uidididi", article);
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            let frenchise = await franchiseDAO.getfrenchiseDetails(id);
            if (!frenchise || frenchise == null) {
                return res.json({ status: true, data: article })
            } else {
                console.log("elsing me...",frenchise.logo);
                var returnData = article;
                returnData[0].logo = frenchise.logo;
                returnData[0].owner = frenchise.owner;
                returnData[0].venue = frenchise.venue;

                //winning years of team
                let won = await MatchDAO.findWinsByTeam(parseInt(id), frenchise.name);

                console.log("returnData: ", won);
                returnData[0].wonYears = won;
                returnData[0].previousWin = won[won.length - 1];

                //latest news
                var page = 6;
                let Iplarticle = await IplArticlesDAO.getIplArticleByTeamsId(page, parseInt(id), year)
                returnData[0].latestNews = Iplarticle.data;
                let videos = await videosDAO.videoByTeamID(parseInt(id), page, year);
                returnData[0].latestVideos = videos.data;
                return res.json({ status: true, data: returnData })
                //console.log("frenchise is; ", frenchise);
            }
            
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiWebGetTeams(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let year = req.query.year && parseInt(req.query.year) ? parseInt(req.query.year) : "2021"
            let article = await MatchDAO.getTeams({ year: year })
            let data = { men: [], women: [] }
            for (var i in article) {
                var franchiseWithWiningYears = await RecordDAO.processFrenchise(article[i].franchises)
                if (article[i].team_type == "m") {
                    data.men = franchiseWithWiningYears
                } else if (article[i].team_type == "w") {
                    data.women = franchiseWithWiningYears
                }
            }
            console.log(req.query.type)
            if (req.query.type == "m") {
                data.women = undefined
            }
            if (req.query.type == "w") {
                data.men = undefined
            }
            if (!article || article.length <= 0) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, year: year, data: data })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiWebGetVenue(req, res, next) {
        try {
            let year = req.query.year && parseInt(req.query.year) ? parseInt(req.query.year) : 2021
            console.log(year)
            let article = await MatchDAO.getVenue({ year: year })
            if (!article) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, data: article })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiAppGetFixtures(req, res, next) {
        //fixtures
        console.log("IN FIXTURES....");
        const FIXTURES_PER_PAGE = 20;
        let page
        try {
            page = req.query.page ? parseInt(req.query.page, 10) : "0"
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }
        var filters = req.body;
        filters.matchState = ["U"];
        filters.team = req.body.team ? [req.body.team] : ["m", "w"]
        if (req.body.team_id)
            filters.team_id = req.body.team_id;
        filters.startDate = new Date("2008-01-01").toISOString();
        filters.endDate = new Date("2021-01-01").toISOString();
        filters.year = req.query.year && parseInt(req.query.year) || new Date().getFullYear()
        console.log("In apis list: ", filters);
        const { matchesList, totalNumMatches } = await MatchDAO.getMatches({
            filters,
            page,
            FIXTURES_PER_PAGE
        })
        let response = {
            status: true,
            data: matchesList,
            page: page,
            filters: {},
            entries_per_page: FIXTURES_PER_PAGE,
            total_results: totalNumMatches,
        }
        if (matchesList.length <= 0) {
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }
        res.json(response)
    }

    static async apiAppGetResults(req, res, next) {
        //results
        console.log("IN RESULTS....");
        const FIXTURES_PER_PAGE = 20;
        let page
        try {
            page = req.query.page ? parseInt(req.query.page, 10) : "0"
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }
        var filters = req.body;
        filters.matchState = ["C"];
        filters.team = req.body.team ? [req.body.team] : ["m", "w"]
        filters.startDate = new Date("2020-01-01").toISOString();
        filters.endDate = new Date("2021-01-01").toISOString();
        filters.year = req.query.year && parseInt(req.query.year) || new Date().getFullYear()
        const { matchesList, totalNumMatches } = await MatchDAO.getMatches({
            filters,
            page,
            FIXTURES_PER_PAGE
        })
        var MatchVideos = []
        if (req.body.matchId) {
            let matchVideoFilter = { match_id: req.body.matchId }
            let matchVideoPage = 1
            let matchLimitPage = 1
            MatchVideos = await videosDAO.getIplVideosByFilter(matchVideoFilter, matchVideoPage, matchLimitPage)

        }
        let response = {
            status: true,
            data: matchesList,
            match_video: MatchVideos && MatchVideos.list ? MatchVideos.list : [],
            page: page,
            filters: {},
            entries_per_page: FIXTURES_PER_PAGE,
            total_results: totalNumMatches,
        }
        if (matchesList.length <= 0) {
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }
        res.json(response)
    }

    static async apiWebGetSeasonList(req, res, next) {
        try {
            let year = req.query.year && parseInt(req.query.year) ? parseInt(req.query.year) : 2021
            console.log(year)
            if(req.query.teamId){
                var teamId = req.query.teamId;
            }else{
                teamId=null;
            }
            let data = await MatchDAO.getSeasonList({ year: year, teamId:teamId })
            if (!data) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, data: data })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiWebArchiveByTeam(req, res, next) {
        console.log("////////////////////////")
        const FIXTURES_PER_PAGE = 20
        let page
        try {
            page = req.query.page ? parseInt(req.query.page, 10) : "0"
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }

        let filters = {};
        filters.startDate = req.query.startDate && new Date(req.query.startDate) !== "Invalid Date" ? new Date(req.query.startDate).toISOString() : undefined
        filters.endDate = req.query.endDate && new Date(req.query.endDate) !== "Invalid Date" ? new Date(req.query.endDate).toISOString() : undefined
        filters.team = req.query.team ? [req.query.team] : ["m", "w"]
        if (req.params.franchise_id) {
            filters.team_id = req.params.franchise_id
        }
        filters.matchState = ["C"]


        console.log(filters)
        const { matchesList, totalNumMatches } = await MatchDAO.getArchiveData({
            filters
        })
        if (matchesList.length <= 0) {
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }
        for (var i in matchesList) {
            filters["year"] = matchesList[i].year
            matchesList[i].team_id = filters.team_id
            matchesList[i].TopRunScorer = await MatchDAO.getTopBatsmenByTeamAndYear(filters)
            matchesList[i].TopRunScorer.player_detail = matchesList[i].TopRunScorer.player_detail.filter(player => player.id == matchesList[i].TopRunScorer.player_id)
            matchesList[i].TopWktTaker = await MatchDAO.getTopBolwerByTeamAndYear(filters)
            matchesList[i].TopWktTaker.player_detail = matchesList[i].TopWktTaker.player_detail.filter(player => player.id == matchesList[i].TopWktTaker.player_id)

        }
        let response = {
            status: true,
            data: matchesList,
            page: page,
            filters: {},
            entries_per_page: FIXTURES_PER_PAGE,
            total_results: totalNumMatches,
        }

        res.json(response)

    }

    static async apiAppGetVideoByMatchId(req, res, next) {
        try {
            const FIXTURES_PER_PAGE = 20
            let page
            try {
                page = req.query.page ? parseInt(req.query.page, 10) : "0"
            } catch (e) {
                console.error(`Got bad value for page:, ${e}`)
                page = 0
            }
            console.log("In apiAppGetVideoByMatchId", req.params.ID);
            let id = req.params.ID;
            if (!id) {
                res.status({ status: false, data: [], message: "Please send match ID" })
            } else {
                console.log("In else me");
                let data = await videosDAO.videoByMatchID(id)
                if (!data) {
                    res.status(404).json({ status: false, error: config.error_codes["1001"] })
                    return
                }
                res.json({ status: true, data: data })

            }
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }

    }
    static async apiScheduleById(req, res, next) {
        try {
            let id = req.params.ID; //This is team ID
            let year = req.query.year && parseInt(req.query.year) ? parseInt(req.query.year) : 2021
            console.log(year)
            let data = await MatchDAO.getScheduleList(year, id)
            if (!data) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            } else {
                res.json({ status: true, data: data })
            }
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiAppGetTeams(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let year = req.query.year && parseInt(req.query.year) ? parseInt(req.query.year) : "2021"
            let article = await MatchDAO.getTeams({ year: year })
            let data = { men: [], women: [] }
            for (var i in article) {
                var franchiseWithWiningYears = await RecordDAO.processFrenchise(article[i].franchises)
                if (article[i].team_type == "m") {
                    data.men = franchiseWithWiningYears
                } else if (article[i].team_type == "w") {
                    data.women = franchiseWithWiningYears
                }
            }
            console.log(req.query.type)
            if (req.query.type == "m") {
                data.women = undefined
            }
            if (req.query.type == "w") {
                data.men = undefined
            }
            if (!article || article.length <= 0) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, year: year, data: data })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async getAppStatsData(req, res, next) {
        /**
         * filters needs to be added are
         * Filter1 - Most Runs / Most Wickets / Most Fours / Most Sixes / Most Fifties / Most Centuries / Best Bowling Innings /Best Bowling Average / Best Bowling Economy / Highest Scores innings 
            =>  Filter2 - Season
            => Filter3 - Teams
            => Filter4 - Players
         */
        console.log("in get appstats");
        const FIXTURES_PER_PAGE = 20
        let page
        try {
            page = req.body.page ? parseInt(req.body.page, 10) : "0"
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }

        let filters = {};
        if (req.body.stats_type)
            filters.stats_type = req.body.stats_type

        if (req.body.season)
            filters.year = req.body.season;
        else
            filters.year = "2020"

        if (req.body.team_id)
            filters.team_id = req.body.team_id;

        if (req.body.player_type)
            filters.player_type = req.body.player_type;
        else
            filters.player_type = "All"

        if (req.body.sort)
            filters.sort = req.body.sort



        let bat, bowl;
        if (filters.stats_type == "batting") {
            bat = await MatchDAO.statsBattingData(filters);
            // bat.forEach(async (i, element) => {
            //     if (element.player_id) {
            //         element.player_detail = await MatchDAO.playerInfoById(element.player_id);
            //         bat[i] = element
            //     }
            // });


        } else if (filters.stats_type == "bowling") {
            bowl = await MatchDAO.statsBowlingData(filters);
        } else {
            bat = await MatchDAO.statsBattingData(filters);
            bowl = await MatchDAO.statsBowlingData(filters);

        }

        if (bat && bat.length > 0 || bowl && bowl.length > 0) {
            if (bat && bat.length > 0) {
                for (var i = 0; i < bat.length; i++) {
                    bat[i].player_detail = await MatchDAO.playerInfoById(bat[i].player_id);

                    if (filters.player_type && filters.player_type == "Indian" && bat[i].player_detail.nationality !== "Indian") {
                        bat.splice(i, 1);
                        i--;
                    }
                    if (filters.player_type && filters.player_type !== "Indian" && filters.player_type !== "All" && bat[i].player_detail.nationality === "Indian") {
                        bat.splice(i, 1);
                        i--;
                    }
                }

            }
            if (bowl && bowl.length > 0) {
                for (var i = 0; i < bowl.length; i++) {
                    bowl[i].player_detail = await MatchDAO.playerInfoById(bowl[i].player_id);

                    if (filters.player_type && filters.player_type == "Indian" && bowl[i].player_detail.nationality !== "Indian") {
                        bowl.splice(i, 1);
                        i--;
                    }
                    if (filters.player_type && filters.player_type !== "Indian" && filters.player_type !== "All" && bowl[i].player_detail.nationality === "Indian") {
                        bowl.splice(i, 1);
                        i--;
                    }
                }
            }
            res.json({ status: true, data: { batting: bat, bowling: bowl } });
        } else {
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }

    }

    static async getAppPlayersDetails(req, res, next) {
        var player = req.body.player;
        if (!player) {
            res.status(404).json({ status: false, error: config.error_codes["1003"] })
            return
        }
        try{
            let details = await MatchDAO.playerInfo(player);
            let players = await MatchDAO.getTeamListByYear(player);
          
            let batting = await MatchDAO.getBattingStatsData(parseInt(player));
            let bawlings = await MatchDAO.getBawlingStatsData(parseInt(player));
            details.battingStats = batting;
            details.bowlingStats = bawlings;
            details.debut = "2008";
            details.teamData = players;
            if(details.teamData.teamName){
                let logoDetails = await franchiseDAO.getfrenchiseByName(details.teamData.teamName)
                details.teamData.logo = logoDetails;
            }

            details.description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet ut risus quam quis in. Hendrerit proin ac erat nullam id curabitur. Vestibulum massa, enim quam senectus in lectus enim. Tempor amet, non iaculis tincidunt condimentum magna vel dictum. Proin risus laoreet dignissim augue tortor. Aliquam convallis convallis scelerisque adipiscing vestibulum, lorem id tempus. Porttitor quisque congue sit id lectus quis enim, aliquet egestas. Blandit faucibus nec lectus convallis. Aliquam dignissim massa risus nullam. Vitae, ipsum sed amet ornare sit. Et, ultrices pellentesque pulvinar nibh gravida enim ridiculus. Malesuada viverra ultricies molestie amet, maecenas orci vitae mi. Pulvinar ut sagittis sit eu et nullam."+
            "Odio ultrices ut facilisis ornare faucibus sed. Dictum consectetur egestas lectus pretium viverra varius aliquet. "
            res.json({status:true,data:details});
        }catch(e){
            res.status(404).json({ status: false, error: config.error_codes["1003"] ,data:e})
            
        }
       
    }

    static async apiAppGetResultsByMatchId(req, res, next) {
        //results
        console.log("IN RESULTS....");
        const FIXTURES_PER_PAGE = 20;
        let page
        try {
            page = req.query.page ? parseInt(req.query.page, 10) : "0"
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }
        var filters = { matchId: req.params.match_id };
        filters.year = req.query.year && parseInt(req.query.year) || new Date().getFullYear()
        const { matchesList, totalNumMatches } = await MatchDAO.getMatches({
            filters,
            page,
            FIXTURES_PER_PAGE
        })
        var MatchVideos = []
        let matchVideoFilter = { match_id: req.params.match_id }
        let matchVideoPage = 1
        let matchLimitPage = 1
        MatchVideos = await videosDAO.getIplVideosByFilter(matchVideoFilter, matchVideoPage, matchLimitPage)
        let response = {
            status: true,
            data: matchesList,
            match_video: MatchVideos && MatchVideos.list ? MatchVideos.list : [],
            page: page,
            filters: {},
            entries_per_page: FIXTURES_PER_PAGE,
            total_results: totalNumMatches,
        }
        if (matchesList.length <= 0) {
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }
        res.json(response)
    }
    static async apiAppGetFranchesByMatchId(req, res, next) {
        //franches
     
        console.log("IN fixtures...");
        const FIXTURES_PER_PAGE = 20;
        let page
        try {
            page = req.query.page ? parseInt(req.query.page, 10) : "0"
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }
        var filters = { matchId: req.params.match_Id };
        console.log(filters
            
            )
        filters.year = req.query.year && parseInt(req.query.year) || new Date().getFullYear();
        filters.matchState = ["U"]
        const { matchesList, totalNumMatches } = await MatchDAO.getMatches({
            filters,
            page,
            FIXTURES_PER_PAGE
        })
        var MatchVideos = []
        let matchVideoFilter = { match_id: req.params.match_id }
        let matchVideoPage = 1
        let matchLimitPage = 1
        MatchVideos = await videosDAO.getIplVideosByFilter(matchVideoFilter, matchVideoPage, matchLimitPage)
        let response = {
            status: true,
            data: matchesList,
            match_video: MatchVideos && MatchVideos.list ? MatchVideos.list : [],
            page: page,
            filters: {},
            entries_per_page: FIXTURES_PER_PAGE,
            total_results: totalNumMatches,
        }
        if (matchesList.length <= 0) {
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }
        res.json(response)
    }

    static async getWebStatsData(req, res, next) {
        /**
         * filters needs to be added are
         * Filter1 - Most Runs / Most Wickets / Most Fours / Most Sixes / Most Fifties / Most Centuries / Best Bowling Innings /Best Bowling Average / Best Bowling Economy / Highest Scores innings 
            =>  Filter2 - Season
            => Filter3 - Teams
            => Filter4 - Players
         */
        console.log("in get appstats");
        const FIXTURES_PER_PAGE = 20
        let page
        try {
            page = req.body.page ? parseInt(req.body.page, 10) : "0"
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }

        let filters = {};
        if (req.body.stats_type)
            filters.stats_type = req.body.stats_type

        if (req.body.season)
            filters.year = req.body.season;
        else
            filters.year = "2020"

        if (req.body.team_id)
            filters.team_id = req.body.team_id;

        if (req.body.player_type)
            filters.player_type = req.body.player_type;
        else
            filters.player_type = "All"

        if (req.body.sort)
            filters.sort = req.body.sort



        let bat, bowl;
        if (filters.stats_type == "batting") {
            bat = await MatchDAO.statsBattingData(filters);
            // bat.forEach(async (i, element) => {
            //     if (element.player_id) {
            //         element.player_detail = await MatchDAO.playerInfoById(element.player_id);
            //         bat[i] = element
            //     }
            // });


        } else if (filters.stats_type == "bowling") {
            bowl = await MatchDAO.statsBowlingData(filters);
        } else {
            bat = await MatchDAO.statsBattingData(filters);
            bowl = await MatchDAO.statsBowlingData(filters);

        }

        if (bat && bat.length > 0 || bowl && bowl.length > 0) {
            if (bat && bat.length > 0) {
                for (var i = 0; i < bat.length; i++) {
                    bat[i].player_detail = await MatchDAO.playerInfoById(bat[i].player_id);

                    if (filters.player_type && filters.player_type == "Indian" && bat[i].player_detail.nationality !== "Indian") {
                        bat.splice(i, 1);
                        i--;
                    }
                    if (filters.player_type && filters.player_type !== "Indian" && filters.player_type !== "All" && bat[i].player_detail.nationality === "Indian") {
                        bat.splice(i, 1);
                        i--;
                    }
                }

            }
            if (bowl && bowl.length > 0) {
                for (var i = 0; i < bowl.length; i++) {
                    bowl[i].player_detail = await MatchDAO.playerInfoById(bowl[i].player_id);

                    if (filters.player_type && filters.player_type == "Indian" && bowl[i].player_detail.nationality !== "Indian") {
                        bowl.splice(i, 1);
                        i--;
                    }
                    if (filters.player_type && filters.player_type !== "Indian" && filters.player_type !== "All" && bowl[i].player_detail.nationality === "Indian") {
                        bowl.splice(i, 1);
                        i--;
                    }
                }
            }
            res.json({ status: true, data: { batting: bat, bowling: bowl } });
        } else {
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }

    }

    static async getWebPlayersDetails(req, res, next) {
        var player = req.body.player;
        if (!player) {
            res.status(404).json({ status: false, error: config.error_codes["1003"] })
            return
        }
        try{
            let details = await MatchDAO.playerInfo(player);
            let players = await MatchDAO.getTeamListByYear(player);
          
            let batting = await MatchDAO.getBattingStatsData(parseInt(player));
            let bawlings = await MatchDAO.getBawlingStatsData(parseInt(player));
            details.battingStats = batting;
            details.bowlingStats = bawlings;
            details.debut = "2008";
            details.teamData = players;
            if(details.teamData.teamName){
                let logoDetails = await franchiseDAO.getfrenchiseByName(details.teamData.teamName)
                details.teamData.logo = logoDetails;
            }

            details.description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet ut risus quam quis in. Hendrerit proin ac erat nullam id curabitur. Vestibulum massa, enim quam senectus in lectus enim. Tempor amet, non iaculis tincidunt condimentum magna vel dictum. Proin risus laoreet dignissim augue tortor. Aliquam convallis convallis scelerisque adipiscing vestibulum, lorem id tempus. Porttitor quisque congue sit id lectus quis enim, aliquet egestas. Blandit faucibus nec lectus convallis. Aliquam dignissim massa risus nullam. Vitae, ipsum sed amet ornare sit. Et, ultrices pellentesque pulvinar nibh gravida enim ridiculus. Malesuada viverra ultricies molestie amet, maecenas orci vitae mi. Pulvinar ut sagittis sit eu et nullam."+
            "Odio ultrices ut facilisis ornare faucibus sed. Dictum consectetur egestas lectus pretium viverra varius aliquet. "
            res.json({status:true,data:details});
        }catch(e){
            res.status(404).json({ status: false, error: config.error_codes["1003"] ,data:e})
            
        }
       
    }

    static async apiWebGetVenueDetail(req,res,next){
        let id = req.params.ID;
        id=parseInt(id);

        if(!id){
            res.status(404).json({ status: false, error: config.error_codes["1003"] })
            return
        }

        try{
            let details = await MatchDAO.getVenueById(id);
            console.log("details is: ",details);
            if(!details){
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            details.imageUrl = "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/addplayer/stadium.png";
            res.status(200).json({status:true, data:details});
        }catch(e){
            res.status(404).json({ status: false, error: config.error_codes["1003"] ,data:e})
        }
    }

}


