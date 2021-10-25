const MatchDAO = require("../../dao/ipl_match_dao")
const RecordDAO = require("../../dao/ipl_franchise_years_dao")
const franchiseDAO = require("../../dao/ipl_franchise_dao")
const videosDAO = require("../../dao/ipl_videos_dao");
const IplArticlesDAO = require("../../dao/ipl_articles_dao")
const menuDAO = require("../../dao/menus_dao")
const PagesDAO = require("../../dao/pages_dao")
const PhotosDAO = require("../../dao/ipl_photos_dao")
const config = require("config");
const { iplArticles } = require("../../dao/ipl_articles_dao");

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
                let data = await MatchDAO.getTeamResultsByid(year, page, idtype, filters)
                if (!data || !data.data.length) {
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
                if (!matchesList || matchesList && !matchesList.length) {
                    res.status(404).json({ status: false, error: config.error_codes["1001"] })
                    return
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

                //convert slug to id
                if(req.params.type == "team" && id.includes("-")){
                    let slug = req.params.type;
                    let franchiseId = await franchiseDAO.getfrenchiseBySlug(slug);
                    id = franchiseId.id;
                }

                let matches = await MatchDAO.getIplMatchesFilterByType(req.params.type, page, parseInt(id))

                if (!matches || !matches.list.length) {
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
            let page = req.query.page ? parseInt(req.query.page, 10) : 0
            let filters = {};
            // filters.startDate = req.query.startDate && new Date(req.query.startDate) !== "Invalid Date" ? new Date(req.query.startDate).getFullYear() : undefined
            //filters.endDate = req.query.endDate && new Date(req.query.endDate) !== "Invalid Date" ? new Date(req.query.endDate).getFullYear() : undefined
            filters.team = req.query.team ? [req.query.team] : ["m", "w"]
            if (req.query.teamId) {
                filters.team_id = req.query.teamId;

                if(req.query.teamId.includes("-")){
                    let slug = req.query.teamId;
                    let franchiseId = await franchiseDAO.getfrenchiseBySlug(slug);
                    filters.team_id = franchiseId.id;
                }
            }
            if(req.query.venue_id){
                filters.venue_id = req.query.venue_id;
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
                filters.year = req.query.year && parseInt(req.query.year) ? parseInt(req.query.year) : new Date().getFullYear()
                const { matchesList, totalNumMatches } = await MatchDAO.getMatches({
                    filters,
                    page,
                    FIXTURES_PER_PAGE
                })
                if (!matchesList || !matchesList.length) {
                    res.status(404).json({ status: false, error: config.error_codes["1001"] })
                    return
                }
                var items = [];
                matchesList.forEach(item=>{
                      
                   let teamId1 = item.matchInfo.teams[0].team.id;
               
                   let teamId2 = item.matchInfo.teams[1].team.id;
                  items.push(teamId1.toString());
                  items.push(teamId2.toString());
         
     
                })
               ;
                items =  [...new Set(items)];
            
               //  console.log(items);
                 let logos =await franchiseDAO.getTeamLogos(items);
                 matchesList.map(item=>{
                     let teamId1 = item.matchInfo.teams[0].team.id;
               
                     let teamId2 = item.matchInfo.teams[1].team.id;
                     for(let i=0;i<logos.length;i++)
                     {
                         if(teamId1==logos[i].id)
                         {
                             
                             item.matchInfo.teams[0].team.logo=logos[i].logo;
                             item.matchInfo.teams[0].team.logo_match=logos[i].logo_match;
                             item.matchInfo.teams[0].team.logo_player=logos[i].logo_player;
                             item.matchInfo.teams[0].team.logo_medium=logos[i].logo_medium;
                             item.matchInfo.teams[0].team.banner=logos[i].banner;
                         }
                         if(teamId2==logos[i].id)
                         {
                            item.matchInfo.teams[1].team.logo=logos[i].logo;
                            item.matchInfo.teams[1].team.logo_match=logos[i].logo_match;
                            item.matchInfo.teams[1].team.logo_player=logos[i].logo_player;
                            item.matchInfo.teams[1].team.logo_medium=logos[i].logo_medium;
                            item.matchInfo.teams[1].team.banner=logos[i].banner;
                         }
                     }
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
                if (!matchesList || matchesList && !matchesList.length) {
                    res.status(404).json({ status: false, error: config.error_codes["1001"] })
                    return
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
            if (!article.length) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            //  console.log("article is: ",article);
            let frenchise = await franchiseDAO.getfrenchiseDetails(id);
            console.log(frenchise)
            if (!frenchise || frenchise == null) {
                return res.json({ status: true, data: article })
            } else {
                console.log("elsing me...", frenchise.logo);
                console.log(article)
                var returnData = article;
                returnData[0].logo = frenchise.logo;
                returnData[0].owner = frenchise.owner;
                returnData[0].venue = frenchise.venue;
                returnData[0].logo_medium = frenchise.logo_medium;
                returnData[0].banner_app = frenchise.banner_app;
                returnData[0].roundSmall = frenchise.roundSmall;
                returnData[0].roundBig = frenchise.roundBig;
                returnData[0].logoOutline = frenchise.logoOutline;
                returnData[0].website = frenchise.website;
                

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

            res.json({ status: true, data: article })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiWebGetFranchiseById(req, res, next) {
        try {
            console.log("In frenchise by id..", req.params.ID);
            let id = req.params.ID || "0"
            let year = req.query.year && parseInt(req.query.year) ? parseInt(req.query.year) : 2021
            if(id.includes("-")){
                let slug = id;
            
                let franchiseId = await franchiseDAO.getfrenchiseBySlug(slug);
                console.log("franchiseId: ",franchiseId);
                id = franchiseId.id;
            }
           
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
                console.log("elsing me...", frenchise.logo);
                var returnData = article;
                returnData[0].logo = frenchise.logo;
                returnData[0].owner = frenchise.owner;
                returnData[0].venue = frenchise.venue;
                returnData[0].couch = frenchise.Coach;
                returnData[0].captain = returnData[0].captain.fullName//frenchise.Captain;
                returnData[0].social = frenchise.social;
                returnData[0].banner = frenchise.banner;
                returnData[0].logo_medium = frenchise.logo_medium;
                returnData[0].roundSmall = frenchise.roundSmall;
                returnData[0].roundBig = frenchise.roundBig;
                returnData[0].logoOutline = frenchise.logoOutline;
                returnData[0].website = frenchise.website;
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
            data.men.sort(function (a, b) {
                return a.id - b.id;
            });
            let fr = uniqByKeepLast(data.men,it=>it.id);
            function uniqByKeepLast(a, key) {
                return [
                    ...new Map(
                        a.map(x => [key(x), x])
                    ).values()
                ]
            }
            data.men = fr;
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
        // filters.startDate = new Date("2008-01-01").toISOString();
        // filters.endDate = new Date("2021-01-01").toISOString();
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
        // filters.startDate = new Date("2020-01-01").toISOString();
        // filters.endDate = new Date("2021-01-01").toISOString();
        filters.year = req.query.year && parseInt(req.query.year) || new Date().getFullYear()
        if (req.body.team_id)
            filters.team_id = req.body.team_id;
        const { matchesList, totalNumMatches } = await MatchDAO.getMatches({
            filters,
            page,
            FIXTURES_PER_PAGE
        })
        var MatchVideos = []
        if (req.body.matchId) {

            var dataWithLogos = await MatchDAO.findTeamLogos(matchesList);
            let matchVideoFilter = { match_id: req.body.matchId }
            let matchVideoPage = 1
            let matchLimitPage = 1
            MatchVideos = await videosDAO.getIplVideosByFilter(matchVideoFilter, matchVideoPage, matchLimitPage)
            
        }
        let response = {
            status: true,
            data: matchesList,
            match_video: MatchVideos && MatchVideos.list && MatchVideos.list.length ? MatchVideos.list[0] : {},
            page: page,
            filters: {},
            entries_per_page: FIXTURES_PER_PAGE,
            total_results: totalNumMatches,
        }
        if(req.body.matchId){
            response.data = dataWithLogos;
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
            if (req.query.teamId) {
                var teamId = req.query.teamId;
            } else {
                teamId = null;
            }
            let data = await MatchDAO.getSeasonList({ year: year, teamId: teamId })
            var data1 = data.reverse();
            if (!data) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, data: data1 })
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
            filters.team_id = req.params.franchise_id;

            //convert slug to id
            if(req.params.franchise_id.includes("-")){
                let slug = req.params.franchise_id;
                let franchiseId = await franchiseDAO.getfrenchiseBySlug(slug);
                filters.team_id  = franchiseId.id;
            }

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
                page = req.query.page ? parseInt(req.query.page, 10) : 1
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
                let data = await videosDAO.videoByMatchID(id,page)
                
                if (!data || data.length <= 0) {
                    res.status(404).json({ status: false, error: config.error_codes["1001"] })
                    return
                }
               
                let response = {
                    status: true,
                    data: data.data,
                    page: page,
                    filters: {},
                    entries_per_page: FIXTURES_PER_PAGE,
                    total_results: data.total,
                }
        
                res.json(response)

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
            if(id.includes("-")){
                console.log("Inside iffififiifiif");
                let slug = id;
                let franchiseId = await franchiseDAO.getfrenchiseBySlug(slug);
                id = franchiseId.id;
            }
               let data = await MatchDAO.getScheduleList(year, id);
               var items = [];
               data.forEach(item=>{
                     
                  let teamId1 = item.matchInfo.teams[0].team.id;
              
                  let teamId2 = item.matchInfo.teams[1].team.id;
                 items.push(teamId1.toString());
                 items.push(teamId2.toString());
        
    
               })
              
               items =  [...new Set(items)];
          
          
                let logos =await franchiseDAO.getTeamLogos(items);
                  //    console.log("result================");
                  console.log(logos);
               data.map(item=>{
                    let teamId1 = item.matchInfo.teams[0].team.id;
              
                    let teamId2 = item.matchInfo.teams[1].team.id;
                    for(let i=0;i<logos.length;i++)
                    {
                        if(teamId1==logos[i].id)
                        {
                            item.matchInfo.teams[0].team.logo=logos[i].logo;
                            item.matchInfo.teams[0].team.logo_match=logos[i].logo_match;
                            item.matchInfo.teams[0].team.logo_player=logos[i].logo_player;
                            item.matchInfo.teams[0].team.logo_medium=logos[i].logo_medium;
                            item.matchInfo.teams[0].team.banner=logos[i].banner;
                        }
                        if(teamId2==logos[i].id)
                        {
                            item.matchInfo.teams[1].team.logo=logos[i].logo;
                            item.matchInfo.teams[1].team.logo_match=logos[i].logo_match;
                            item.matchInfo.teams[1].team.logo_player=logos[i].logo_player;
                            item.matchInfo.teams[1].team.logo_medium=logos[i].logo_medium;
                            item.matchInfo.teams[1].team.banner=logos[i].banner;;
                        }
                    }
                })
            if (!data || data.length <= 0) {
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
            let article = await MatchDAO.getTeams({ year: year });
            console.log("articled: ",article.length);
            let data = { men: [], women: [] }
            for (var i in article) {
                var franchiseWithWiningYears = await RecordDAO.processFrenchise(article[i].franchises)
                if (article[i].team_type == "m") {
                    data.men = franchiseWithWiningYears
                } else if (article[i].team_type == "w") {
                    data.women = franchiseWithWiningYears
                }
            }
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
            data.men.sort(function (a, b) {
                return a.id - b.id;
            });
            let fr = uniqByKeepLast(data.men,it=>it.id);
            function uniqByKeepLast(a, key) {
                return [
                    ...new Map(
                        a.map(x => [key(x), x])
                    ).values()
                ]
            }
            data.men = fr;
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
            filters.year = "all"

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


        } else if (filters.stats_type == "bowling") {
            bowl = await MatchDAO.statsBowlingData(filters);
        } else {
            bat = await MatchDAO.statsBattingData(filters);
            bowl = await MatchDAO.statsBowlingData(filters);

        }

        if (bat && bat.length > 0 || bowl && bowl.length > 0) {
            if (bat && bat.length > 0) {
                for (var i = 0; i < bat.length; i++) {
                    bat[i].teams = await MatchDAO.playerInfoById(bat[i].player_id, bat[i].highestInnScore[0].matchId.id);
                    bat[i].matches = await MatchDAO.countMatchesPlayerByPlayer(bat[i].player_id, filters.year);
                    if (filters.player_type && filters.player_type == "Indian" && bat[i].teams.player_detail.nationality !== "Indian") {
                        bat.splice(i, 1);
                        i--;
                    }
                    if (filters.player_type && filters.player_type !== "Indian" && filters.player_type !== "All" && bat[i].teams.player_detail.nationality === "Indian") {
                        bat.splice(i, 1);
                        i--;
                    }
                    if (filters.team_id && bat[i] && bat[i].teams.team_detail.id && filters.team_id != bat[i].teams.team_detail.id) {
                        bat.splice(i, 1);
                        i--;
                    }
                }

            }
            if (bowl && bowl.length > 0) {
                for (var i = 0; i < bowl.length; i++) {

                    bowl[i].teams = await MatchDAO.playerInfoById(bowl[i].player_id, bowl[i].bestBowlInn.matchId.id);
                    bowl[i].matches = await MatchDAO.countMatchesPlayerByPlayer(bowl[i].player_id, filters.year);

                    if (filters.player_type && filters.player_type == "Indian" && bowl[i].teams.player_detail.nationality !== "Indian") {
                        bowl.splice(i, 1);
                        i--;
                    }
                    if (filters.player_type && filters.player_type !== "Indian" && filters.player_type !== "All" && bowl[i].teams.player_detail.nationality === "Indian") {
                        bowl.splice(i, 1);
                        i--;
                    }
                    if (filters.team_id && bowl[i] && bowl[i].teams.team_detail.id && filters.team_id !== bowl[i].teams.team_detail.id) {
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
        try {
            let details = await MatchDAO.playerInfo(player);
            let players = await MatchDAO.getTeamListByYear(player);

            let batting = await MatchDAO.getBattingStatsData(parseInt(player));
            let bawlings = await MatchDAO.getBawlingStatsData(parseInt(player));
            batting.sr = batting.sr.toString();
            if(Object.keys(bawlings).length !== 0)
              bawlings.ov = bawlings.ov.toString();
            details.battingStats = batting;
            details.bowlingStats = bawlings;
            details.debut = "2008";
            details.teamData = players;
            if (details.teamData.teamName) {
                let logoDetails = await franchiseDAO.getfrenchiseByName(details.teamData.teamName)
                details.teamData.logo = logoDetails;
            }

            details.description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet ut risus quam quis in. Hendrerit proin ac erat nullam id curabitur. Vestibulum massa, enim quam senectus in lectus enim. Tempor amet, non iaculis tincidunt condimentum magna vel dictum. Proin risus laoreet dignissim augue tortor. Aliquam convallis convallis scelerisque adipiscing vestibulum, lorem id tempus. Porttitor quisque congue sit id lectus quis enim, aliquet egestas. Blandit faucibus nec lectus convallis. Aliquam dignissim massa risus nullam. Vitae, ipsum sed amet ornare sit. Et, ultrices pellentesque pulvinar nibh gravida enim ridiculus. Malesuada viverra ultricies molestie amet, maecenas orci vitae mi. Pulvinar ut sagittis sit eu et nullam." +
                "Odio ultrices ut facilisis ornare faucibus sed. Dictum consectetur egestas lectus pretium viverra varius aliquet. "
            res.json({ status: true, data: details });
        } catch (e) {
            res.status(404).json({ status: false, error: config.error_codes["1003"], data: e })

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
        //find team logos..
        let dataWithLogos = await MatchDAO.findTeamLogos(matchesList);
        MatchVideos = await videosDAO.getIplVideosByFilter(matchVideoFilter, matchVideoPage, matchLimitPage)
        let response = {
            status: true,
            data: dataWithLogos,
            match_video: MatchVideos && MatchVideos.list && MatchVideos.list.length ? MatchVideos.list[0] : {},
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

    static async getTeamsLogo (req, res, next){
        let teamLogo = await MatchDAO.getTeamsLogos();
        if (!teamLogo) {
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }
        res.status(200).json({ status: true, data: teamLogo });
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
            match_video: MatchVideos && MatchVideos.list && MatchVideos.list.length ? MatchVideos.list[0] : {},
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


        } else if (filters.stats_type == "bowling") {
            bowl = await MatchDAO.statsBowlingData(filters);
        } else {
            bat = await MatchDAO.statsBattingData(filters);
            bowl = await MatchDAO.statsBowlingData(filters);

        }

        if (bat && bat.length > 0 || bowl && bowl.length > 0) {
            if (bat && bat.length > 0) {
                for (var i = 0; i < bat.length; i++) {

                    bat[i].teams = await MatchDAO.playerInfoById(bat[i].player_id, bat[i].highestInnScore[0].matchId.id);
                    bat[i].matches = await MatchDAO.countMatchesPlayerByPlayer(bat[i].player_id, filters.year);

                    if (filters.player_type && filters.player_type == "Indian" && bat[i].teams.player_detail.nationality !== "Indian") {
                        bat.splice(i, 1);
                        i--;
                    }
                    if (filters.player_type && filters.player_type !== "Indian" && filters.player_type !== "All" && bat[i].teams.player_detail.nationality === "Indian") {
                        bat.splice(i, 1);
                        i--;
                    }
                    if (filters.team_id && bat[i] && bat[i].teams.team_detail.id && filters.team_id != bat[i].teams.team_detail.id) {
                        bat.splice(i, 1);
                        i--;
                    }
                }

            }
            if (bowl && bowl.length > 0) {
                for (var i = 0; i < bowl.length; i++) {

                    bowl[i].teams = await MatchDAO.playerInfoById(bowl[i].player_id, bowl[i].bestBowlInn.matchId.id);
                    bowl[i].matches = await MatchDAO.countMatchesPlayerByPlayer(bowl[i].player_id, filters.year);

                    if (filters.player_type && filters.player_type == "Indian" && bowl[i].teams.player_detail.nationality !== "Indian") {
                        bowl.splice(i, 1);
                        i--;
                    }
                    if (filters.player_type && filters.player_type !== "Indian" && filters.player_type !== "All" && bowl[i].teams.player_detail.nationality === "Indian") {
                        bowl.splice(i, 1);
                        i--;
                    }
                    if (filters.team_id && bowl[i] && bowl[i].teams.team_detail.id && filters.team_id !== bowl[i].teams.team_detail.id) {
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
        try {
            let details = await MatchDAO.playerInfo(player);
            let players = await MatchDAO.getTeamListByYear(player);

            let batting = await MatchDAO.getBattingStatsData(parseInt(player));
            let bawlings = await MatchDAO.getBawlingStatsData(parseInt(player));
            details.battingStats = batting;
            details.bowlingStats = bawlings;
            details.debut = "2008";
            details.teamData = players;
            if (details.teamData.teamName) {
                let logoDetails = await franchiseDAO.getfrenchiseByName(details.teamData.teamName)
                details.teamData.logo = logoDetails;
            }

            details.description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet ut risus quam quis in. Hendrerit proin ac erat nullam id curabitur. Vestibulum massa, enim quam senectus in lectus enim. Tempor amet, non iaculis tincidunt condimentum magna vel dictum. Proin risus laoreet dignissim augue tortor. Aliquam convallis convallis scelerisque adipiscing vestibulum, lorem id tempus. Porttitor quisque congue sit id lectus quis enim, aliquet egestas. Blandit faucibus nec lectus convallis. Aliquam dignissim massa risus nullam. Vitae, ipsum sed amet ornare sit. Et, ultrices pellentesque pulvinar nibh gravida enim ridiculus. Malesuada viverra ultricies molestie amet, maecenas orci vitae mi. Pulvinar ut sagittis sit eu et nullam." +
                "Odio ultrices ut facilisis ornare faucibus sed. Dictum consectetur egestas lectus pretium viverra varius aliquet. "
            res.json({ status: true, data: details });
        } catch (e) {
            res.status(404).json({ status: false, error: config.error_codes["1003"], data: e })

        }

    }

    static async apiWebGetVenueDetail(req, res, next) {
        let id = req.params.ID;
        id = parseInt(id);

        if (!id) {
            res.status(404).json({ status: false, error: config.error_codes["1003"] })
            return
        }

        try {
            let details = await MatchDAO.getVenueById(id);
            console.log("details is: ", details);
            if (!details) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            details.imageUrl = "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/addplayer/stadium.png";
            res.status(200).json({ status: true, data: details });
        } catch (e) {
            res.status(404).json({ status: false, error: config.error_codes["1003"], data: e })
        }
    }
    static async getapiWebLeaders(req, res, next) {
        try {

            let battings = await MatchDAO.getHighestBattingStats();
            let bowlings = await MatchDAO.getHighestBowlingStats();
            let run = battings.reduce((max, obj) => (max.mostRuns > obj.mostRuns) ? max : obj);           
            let fours = battings.reduce((max, obj) => (max.most4s > obj.most4s) ? max : obj);
            let six = battings.reduce((max, obj) => (max.most6s > obj.most6s) ? max : obj);
            let strikeRate = battings.reduce((max, obj) => (parseInt(max.sr) > parseInt(obj.sr)) ? max : obj);

            //bowlings:
             let w = bowlings.reduce((max, obj) => (max.w > obj.w) ? max : obj);
             let d = bowlings.reduce((max, obj) => (max.d > obj.d) ? max : obj);
             let maid = bowlings.reduce((max, obj) => (max.maid > obj.maid) ? max : obj);
             let e = bowlings.reduce((max, obj) => (max.e > obj.e) ? max : obj);
             let wd = bowlings.reduce((max, obj) => (max.wd > obj.wd) ? max : obj);
             let nb = bowlings.reduce((max, obj) => (max.nb > obj.nb) ? max : obj);

            let battingStats ={runs:run,fours:fours,six:six, strikeRate:strikeRate};
            let bowlingStats = {w:w,d:d,maid:maid,e:e,wd:wd,nb:nb};

            for(let bats in battingStats){
               let details = await MatchDAO.playerInfo(battingStats[bats].player_id);
               let bawling = await MatchDAO.getBawlingStatsData(parseInt(battingStats[bats].player_id));
                battingStats[bats].details = details;
                battingStats[bats].wickets = bawling.w;
            }
            for(let bats in bowlingStats){
                let details = await MatchDAO.playerInfo(bowlingStats[bats].player_id);
                let bawling = await MatchDAO.getBawlingStatsData(parseInt(bowlingStats[bats].player_id));
                bowlingStats[bats].details = details;
                bowlingStats[bats].wickets = bawling.w;
             }

            res.json({ status: true, data: {battingStats:battingStats, bowlingStats:bowlingStats} });
        } catch (e) {
            res.status(404).json({ status: false, error: config.error_codes["1003"], data: e })
        }
    }

    static async apiWebTeamsResults(req, res, next) {
        let matchId;
        let pageType = req.params.type;
        console.log("pagetype is: ", req.body);
        if (!req.body.matchId || !pageType) {
            res.status(404).json({ status: false, error: config.error_codes["1003"] })
            return
        }
        else {
            matchId = req.body.matchId;
            let matchDetail = await MatchDAO.getMatchByIDTeamsResult(parseInt(matchId));
           
            if (pageType == "scorecard") {

                let validData = { teams: matchDetail.matchInfo.teams, innings: matchDetail.innings };

                let data = [];
                for (let i = 0; i <= validData.teams.length - 1; i++) {
                    let teamData = { team: validData.teams[i].team.fullName }
                    let teamWise = validData.innings[i];

                    for (let j = 0; j <= teamWise.scorecard.battingStats.length - 1; j++) {
                        teamWise.scorecard.battingStats[j].player = validData.teams[i].players.find(element => element.id == teamWise.scorecard.battingStats[j].playerId);
                    }
                    for (let l = 0; l <= teamWise.scorecard.fow.length - 1; l++) {
                        teamWise.scorecard.fow[l].player = validData.teams[i].players.find(element => element.id == teamWise.scorecard.fow[l].playerId);
                       
                    }
                    let diff = difference(validData.teams[i].players, teamWise.scorecard.battingStats);
                    for (let k = 0; k <= teamWise.scorecard.bowlingStats.length - 1; k++) {
                        if(i==0)
                        validData.teams[i] =validData.teams[i+1]
                        if(i==1) 
                        validData.teams[i] =validData.teams[i-1]
                        teamWise.scorecard.bowlingStats[k].player = validData.teams[i].players.find(element => element.id == teamWise.scorecard.bowlingStats[k].playerId);
                       
                    }
  
                    teamData.innings = teamWise;
                    teamData.difference = diff;
                    teamData.teamAbbrivation = validData.teams[i].team.abbreviation;
                    data.push(teamData);
                }
                function difference(array1, array2) {
                    var difference = [];
                    for (let ar = 0; ar <= array1.length - 1; ar++) {
                        var player = array2.find(element => element.playerId == array1[ar].id);

                        if (!player) {
                            difference.push({ id: array1[ar].id, name: array1[ar].name = array1[ar].fullName })
                        }
                    }
                    return difference;
                }
                res.json({ status: true, data: data });
                return
            }
            else if (pageType == "hawkeye") {
                var imgUrl = "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/logos/hawkeye.png";
                //find teams logo
                for (let team = 0; team <= matchDetail.matchInfo.teams.length - 1; team++) {

                    var logo = await franchiseDAO.getfrenchiseByName(matchDetail.matchInfo.teams[team].team.fullName);
                    matchDetail.matchInfo.teams[team].team.logo = logo;
                }

                let pointTable = await menuDAO.getStadings("m", "app");
                matchDetail.pointsTable = pointTable;
                res.json({ status: true, data: { match: matchDetail, image: imgUrl } });
            } else if (pageType == "teams") {
                for (let team = 0; team <= matchDetail.matchInfo.teams.length - 1; team++) {

                    var logo = await franchiseDAO.getfrenchiseByName(matchDetail.matchInfo.teams[team].team.fullName);
                    matchDetail.matchInfo.teams[team].team.logo = logo;
                }

                let pointTable = await menuDAO.getStadings("m", "app");
                matchDetail.pointsTable = pointTable;
                res.json({ status: true, data: { match: matchDetail} });

            }else if(pageType == "videos"){
                for (let team = 0; team <= matchDetail.matchInfo.teams.length - 1; team++) {

                    var logo = await franchiseDAO.getfrenchiseByName(matchDetail.matchInfo.teams[team].team.fullName);
                    matchDetail.matchInfo.teams[team].team.logo = logo;
                }

                let pointTable = await menuDAO.getStadings("m", "app");
            
                matchDetail.pointsTable = pointTable;
                let page = await PagesDAO.getPage("video-list-web");
                matchDetail.pagedata = page;
                res.json({ status: true, data: { match: matchDetail } });


            }else if(pageType == "photos"){
                for (let team = 0; team <= matchDetail.matchInfo.teams.length - 1; team++) {

                    var logo = await franchiseDAO.getfrenchiseByName(matchDetail.matchInfo.teams[team].team.fullName);
                    matchDetail.matchInfo.teams[team].team.logo = logo;
                }

                let pointTable = await menuDAO.getStadings("m", "app");
            
                matchDetail.pointsTable = pointTable;
                let matchImages = await PhotosDAO.getMatchImagesByID(parseInt(matchId))
                matchDetail.matchImages = matchImages;
                res.json({ status: true, data: { match: matchDetail } });
            }
            else {
                //find teams logo
                for (let team = 0; team <= matchDetail.matchInfo.teams.length - 1; team++) {

                    var logo = await franchiseDAO.getfrenchiseByName(matchDetail.matchInfo.teams[team].team.fullName);
                    matchDetail.matchInfo.teams[team].team.logo = logo;
                }

                let pointTable = await menuDAO.getStadings("m", "app");
                matchDetail.pointsTable = pointTable;
                var filters = { match_id: matchId }
                const respo = await videosDAO.getIplVideosByFilter(filters, 1, 10);
                matchDetail.videos = respo.list;
                res.json({ status: true, data: matchDetail });
            }

        }
    }

    static async apiWebGetSquadById(req,res,next){
        let id = req.params.ID|| "0"
       
        let year = req.query.year && parseInt(req.query.year) ? parseInt(req.query.year) : 2021
       //convert slug to id
         id=id.toString();
        
         if(id.includes("-")){
          
             let franchiseId = await franchiseDAO.getfrenchiseBySlug(id);
             id = franchiseId.id;
        }

        let article = await MatchDAO.getSquadListByID({ id: parseInt(id), year: year })
     
        if (!article || article.length <= 0) {
            console.log("in uidididi", article);
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }

        var playerArr = [];
        for(let i=0;i<=article[0].players.length-1;i++){
            playerArr.push(article[0].players[i].id);
        }

        let runs = await MatchDAO.getPlayersRunsDataByYear(playerArr,year);
        let wickets = await MatchDAO.getPlayersWicketsDataByYear(playerArr,year);
        for(let i=0;i<=article[0].players.length-1;i++){
            var player = runs.find(element => element._id == article[0].players[i].id);
           
            if(!player)
              article[0].players[i].runs = 0
            else
              article[0].players[i].runs = player.runs
             
            article[0].players[i].matches = wickets.count;
            article[0].players[i].debut = "2008";
            var playerwik = wickets.bawlings.find(element => element._id == article[0].players[i].id);
            if(!playerwik)
              article[0].players[i].wickets = 0
            else
              article[0].players[i].wickets = playerwik.wickets
        }
     
        return res.json({ status: true, data: article })

    }

    static async getStatsPerPlayer(req,res,next){
        let body = req.body;
        if(!body.playerId || !body.year){
            res.status(404).json({ status: false, error: config.error_codes["1003"] })
            return
        }
        try{
            let details = await MatchDAO.playerInfoByYear(body.playerId,body.year);
            console.log("")
            var player =null;
          
               
                for (let i = 0; i <= details.matchInfo.teams.length-1; i++) {
                    player = details.matchInfo.teams[i].players.find(element => element.id == parseInt(body.playerId));
                    
                    if(player){
                        player.debut = "2008"; break;
                    }
                     
                }
                let players = await MatchDAO.getTeamListByYear(parseInt(body.playerId),body.year);

                let batting = await MatchDAO.getBattingStatsData(parseInt(body.playerId));
                let bawlings = await MatchDAO.getBawlingStatsData(parseInt(body.playerId));
                player.battingStats = batting;
                player.bowlingStats = bawlings;
                player.teamData = players;


            let battings = await MatchDAO.playerBattingStatsPerYear(parseInt(body.playerId));
            let bowlings = await MatchDAO.playerBowlingStatsPerYear(parseInt(body.playerId));

            let response = {playerInfo:player,battingStats : battings, bowlingStats: bowlings};
               res.json({ status: true, data: response });
        } catch (e) {
            res.status(404).json({ status: false, error: config.error_codes["1001"], data: e })

        }

    }

    static async getReportsByMatch(req,res,next){
        let matchId = req.query.matchId;
        if(!matchId){
            res.status(404).json({ status: false, error: config.error_codes["1003"] })
            return
        }
        let article = await MatchDAO.getArticleByMatch(matchId);
       // console.log("article: ",article);
        res.json({ status: true, data: article })

    }

    static async addheadshots(req,res,next){
        const players = await MatchDAO.playerQuery();
        var data = []
        for(let i=0;i<=players.length-1;i++){
            data.push(players[i].player_detail);
            if(i==players.length-1){

                //insert in collection
                let insert = await MatchDAO.addAllPlayers(data);

                res.json({status:true, data:insert});
            }
        }
       
    } 
}


