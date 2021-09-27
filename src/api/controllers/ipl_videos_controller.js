
const IplVideosDAO = require("../../dao/ipl_videos_dao")
const config = require("config")
module.exports = class IplVideosController {
    static async apiAppGetIplVideos(req, res, next) {
        var type = req.params.type;
        if (!type) {
            res.json({ status: false, message: "please specify video type" });
        }
        if (req.query.page)
            var page = req.query.page
        else
            page = 1;
        let limit = 20
        const respo = await IplVideosDAO.getIplVideosByFilter(type, page, limit);
        let response = {
            status: true,
            message: "Retrived data!",
            videos: respo.list,
            page: page,
            total_results: respo.total,
        }
        res.json(response)
    }
    static async getAppIplVideos(req, res, next) {
        var type = req.params.type;
        if (!type) {
            res.json({ status: false, message: "please specify video type" });
        }
        if (req.query.page)
            var page = req.query.page
        else
            page = 1;
        let limit = 20
        const respo = await IplVideosDAO.getIplVideosByFilter(type, page, limit);
        let response = {
            status: true,
            message: "Retrived data!",
            videos: respo.list,
            page: page,
            total_results: respo.total,
        }
        res.json(response)
    }


    static async apiAppGetPlayUrlById(req, res, next) {
        try {
            let id = req.body.id || {}
            let video = await IplVideosDAO.getVideoByID(parseInt(id))
            if (!video) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ video_url: video.video_url ? video.video_url : "" })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiAppGetVideoById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let video = await IplVideosDAO.getVideoByID(parseInt(id))
            if (!video) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, data: video })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiAppGetPromos(req, res, next) {
        console.log("in oromos apis");
        let page
        try {
            page = req.query.page ? parseInt(req.query.page, 10) : "0"
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }
        const LIMIT_PER_PAGE = 20
        const filter = null
        const { videosList, totalNumIplVideos } = await IplVideosDAO.getPromos(filter, page, LIMIT_PER_PAGE)
        let response = {
            status: true,
            message: "data received!",
            videos: videosList,
            page: page,
            filters: {},
            entries_per_page: LIMIT_PER_PAGE,
            total_results: totalNumIplVideos,
        }
        res.json(response)
    }
    static async apiAppGetPromoById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let video = await IplVideosDAO.getPromoByID(parseInt(id))
            if (!video) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, data: video })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiupdateRecords(req, res, next) {
        let video = await IplVideosDAO.updateRecord();
    }


    static async apiWebGetIplVideos(req, res, next) {
        const LIMIT_PER_PAGE = 20
        let page
        try {
            page = req.query.page ? parseInt(req.query.page, 10) : "0"
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }
        const filter = null
        const { videosList, totalNumIplVideos } = await IplVideosDAO.getIplVideos(filter, page, LIMIT_PER_PAGE)
        let response = {
            videos: videosList,
            page: page,
            filters: {},
            entries_per_page: LIMIT_PER_PAGE,
            total_results: totalNumIplVideos,
        }
        res.json(response)
    }
    static async getWebIplVideos(req, res, next) {
        var type = req.params.type;
        if (!type) {
            res.json({ status: false, message: "please specify video type" });
        }
        if (req.query.page)
            var page = req.query.page
        else
            page = 1;
        let limit = 20
        const respo = await IplVideosDAO.getIplVideosByFilter(type, page, limit);
        let response = {
            status: true,
            message: "Retrived data!",
            videos: respo.list,
            page: page,
            total_results: respo.total,
        }
        res.json(response)
    }


    static async apiWebGetPlayUrlById(req, res, next) {
        try {
            let id = req.body.id || {}
            let video = await IplVideosDAO.getVideoByID(parseInt(id))
            if (!video) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, video_url: video.video_url ? video.video_url : "" })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiWebGetVideoById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let video = await IplVideosDAO.getVideoByID(parseInt(id))
            if (!video) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, data: video })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiWebGetPromos(req, res, next) {
        let page
        try {
            page = req.query.page ? parseInt(req.query.page, 10) : "0"
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }
        const LIMIT_PER_PAGE = 20
        const filter = null
        const { videosList, totalNumIplVideos } = await IplVideosDAO.getPromos(filter, page, LIMIT_PER_PAGE)
        let response = {
            status: true,
            message: "data received!",
            videos: videosList,
            page: page,
            filters: {},
            entries_per_page: LIMIT_PER_PAGE,
            total_results: totalNumIplVideos,
        }
        res.json(response)
    }
    static async apiWebGetPromoById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let video = await IplVideosDAO.getPromoByID(parseInt(id))
            if (!video) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, data: video })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }
}
