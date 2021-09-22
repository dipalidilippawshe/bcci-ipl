
const IplArticlesDAO = require("../../dao/ipl_articles_dao")
const config = require("config")
module.exports = class IPLArticlesController {
    static async apiAppGetIplArticleList(req, res, next) {
        console.log("API iplarticles");
        const ARTICLES_PER_PAGE = 20
        let page
        try {
            page = req.query.page ? parseInt(req.query.page, 10) : "0"
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }

        // "feature", 355
        // "featured", 186
        // "features-and-interviews", 187
        // "press-conference", 20
        // "press-releases", 214
        // "bcci", 2
        // "bcci-news", 347
        const filterValues = {
            "features": ["feature", "featured", "features-and-interviews"],
            "press-releases": ["press-conference", "press-releases"],
            "bcci-news": ["bcci", "bcci-news"]
        }
        let filters = {};
        if (req.params.type !== "" && filterValues[req.params.type]) {
            filters.tag = filterValues[req.params.type]
        }
        const { articlesList, totalNumArticles } = await IplArticlesDAO.getIplArticles({
            filters,
            page,
            ARTICLES_PER_PAGE
        })
        let response = {
            success: true,
            data: articlesList,
            page: page,
            filters: {},
            entries_per_page: ARTICLES_PER_PAGE,
            total_results: totalNumArticles,
        }
        res.json(response)
    }

    static async apiAppGetIplArticleById(req, res, next) {

        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let iplArticle = await IplArticlesDAO.getIplArticleByID(parseInt(id))
            if (!iplArticle) {
                res.status(404).json({ success: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ success: true, data: iplArticle })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiWebGetIplArticleList(req, res, next) {
        console.log("in articles");
        const ARTICLES_PER_PAGE = 20
        let page
        try {
            page = req.query.page ? parseInt(req.query.page, 10) : "0"
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }

        // "feature", 355
        // "featured", 186
        // "features-and-interviews", 187
        // "press-conference", 20
        // "press-releases", 214
        // "bcci", 2
        // "bcci-news", 347
        const filterValues = {
            "features": ["feature", "featured", "features-and-interviews"],
            "press-releases": ["press-conference", "press-releases"],
            "bcci-news": ["bcci", "bcci-news"]
        }
        let filters = {};
        if (req.params.type !== "" && filterValues[req.params.type]) {
            filters.tag = filterValues[req.params.type]
        }
        const { articlesList, totalNumArticles } = await IplArticlesDAO.getArticles({
            filters,
            page,
            ARTICLES_PER_PAGE
        })
        let response = {
            success: true,
            data: articlesList,
            page: page,
            filters: {},
            entries_per_page: ARTICLES_PER_PAGE,
            total_results: totalNumArticles,
        }
        res.json(response)
    }

    static async apiWebGetIplArticleById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let Iplarticle = await IplArticlesDAO.getIplArticleByID(parseInt(id))
            if (!Iplarticle) {
                res.status(404).json({ success: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ success: true, data: Iplarticle })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }
}
