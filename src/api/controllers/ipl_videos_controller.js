
const IplVideosDAO = require("../../dao/ipl_videos_dao")
const config = require("config")
module.exports = class IplVideosController {
    static async apiAppGetIplVideos(req, res, next) {
        const MOVIES_PER_PAGE = 20
        const { videosList, totalNumIplVideos } = await IplVideosDAO.getIplVideos()
        let response = {
            videos: videosList,
            page: 0,
            filters: {},
            entries_per_page: MOVIES_PER_PAGE,
            total_results: totalNumIplVideos,
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

        const respo = await IplVideosDAO.getIplVideosByFilter(type, page);
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
                res.status(404).json({ error: "Data not found" })
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
                res.status(404).json({ success: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ success: true, data: video })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiAppGetPromos(req, res, next) {
        console.log("in oromos apis");
        const MOVIES_PER_PAGE = 20
        const { videosList, totalNumIplVideos } = await IplVideosDAO.getPromos()
        let response = {
            status: true,
            message: "data received!",
            videos: videosList,
            page: 0,
            filters: {},
            entries_per_page: MOVIES_PER_PAGE,
            total_results: totalNumIplVideos,
        }
        res.json(response)
    }
    static async apiAppGetPromoById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let video = await IplVideosDAO.getPromoByID(parseInt(id))
            if (!video) {
                res.status(404).json({ success: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ success: true, data: video })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiupdateRecords(req, res, next) {
        let video = await IplVideosDAO.updateRecord();
    }


    static async apiWebGetIplVideos(req, res, next) {
        const MOVIES_PER_PAGE = 20
        const { videosList, totalNumIplVideos } = await IplVideosDAO.getIplVideos()
        let response = {
            videos: videosList,
            page: 0,
            filters: {},
            entries_per_page: MOVIES_PER_PAGE,
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

        const respo = await IplVideosDAO.getIplVideosByFilter(type, page);
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
                res.status(404).json({ error: "Data not found" })
                return
            }
            res.json({ video_url: video.video_url ? video.video_url : "" })
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
                res.status(404).json({ success: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ success: true, data: video })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiWebGetPromos(req, res, next) {
        console.log("in oromos apis");
        const MOVIES_PER_PAGE = 20
        const { videosList, totalNumIplVideos } = await IplVideosDAO.getPromos()
        let response = {
            status: true,
            message: "data received!",
            videos: videosList,
            page: 0,
            filters: {},
            entries_per_page: MOVIES_PER_PAGE,
            total_results: totalNumIplVideos,
        }
        res.json(response)
    }
    static async apiWebGetPromoById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let video = await IplVideosDAO.getPromoByID(parseInt(id))
            if (!video) {
                res.status(404).json({ success: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ success: true, data: video })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }
}
