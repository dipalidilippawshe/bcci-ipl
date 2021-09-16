const MatchDAO = require("../../dao/matches_dao")

module.exports = class MatchController {
    static async apiAppGetMatch(req, res, next) {
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
        console.log(req.query.startDate, new Date(req.query.startDate))
        if (req.params.type !== "" && req.params.type === "results") {
            filters.matchState = ["C"]
        } else if (req.params.type !== "" && req.params.type === "fixtures") {
            console.log("I m in else iffff");
            filters.matchState = ["U", "L"]
        }else if (req.params.type !== "" && req.params.type === "series-and-tournaments") {
            filters.matchState = ["U", "L"]
            filters.sort = 1
        } else if (req.params.type == "archive") {
            filters.matchState = ["U", "L"]
            filters.sort = -1
        }
        
        console.log(filters)
        if (["results", "fixtures"].includes(req.params.type)) {

        const { matchesList, totalNumMatches } = await MatchDAO.getMatches({
            filters,
            page,
            FIXTURES_PER_PAGE
        })
        let response = {
            success: true,
            data: matchesList,
            page: page,
            filters: {},
            entries_per_page: FIXTURES_PER_PAGE,
            total_results: totalNumMatches,
        }
        res.json(response)

      }else {

        const { matchesList, totalNumMatches } = await MatchDAO.getSeriesnTournaments({
            filters, page,
            FIXTURES_PER_PAGE
        })
        //  console.log(matchesList)
        let response = {
            success: true,
            data: matchesList,
            page: page,
            filters: {},
            entries_per_page: FIXTURES_PER_PAGE,
            total_results: totalNumMatches,
        }
        res.json(response)
     }
    }

    static async apiAppGetMatchById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let article = await MatchDAO.getMatchByID(parseInt(id))
            if (!article) {
                res.status(404).json({ success: false, error: "Not found" })
                return
            }
            res.json({ success: true, data: article })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }
 
    static async apiWebGetMatch(req, res, next) {
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
        console.log(req.query.startDate, new Date(req.query.startDate))
        if (req.params.type !== "" && req.params.type === "results") {
            filters.matchState = ["C"]
        } else if (req.params.type !== "" && req.params.type === "fixtures") {
            console.log("I m in else iffff");
            filters.matchState = ["U", "L"]
        }else if (req.params.type !== "" && req.params.type === "series-and-tournaments") {
            filters.matchState = ["U", "L"]
            filters.sort = 1
        } else if (req.params.type == "archive") {
            filters.matchState = ["U", "L"]
            filters.sort = -1
        }
        
        console.log(filters)
        if (["results", "fixtures"].includes(req.params.type)) {

        const { matchesList, totalNumMatches } = await MatchDAO.getMatches({
            filters,
            page,
            FIXTURES_PER_PAGE
        })
        let response = {
            success: true,
            data: matchesList,
            page: page,
            filters: {},
            entries_per_page: FIXTURES_PER_PAGE,
            total_results: totalNumMatches,
        }
        res.json(response)

      }else {

        const { matchesList, totalNumMatches } = await MatchDAO.getSeriesnTournaments({
            filters, page,
            FIXTURES_PER_PAGE
        })
        //  console.log(matchesList)
        let response = {
            success: true,
            data: matchesList,
            page: page,
            filters: {},
            entries_per_page: FIXTURES_PER_PAGE,
            total_results: totalNumMatches,
        }
        res.json(response)
     }
    }

    static async apiWebGetMatchById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let article = await MatchDAO.getMatchByID(parseInt(id))
            if (!article) {
                res.status(404).json({ success: false, error: "Not found" })
                return
            }
            res.json({ success: true, data: article })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }
}

