
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
        let filters = { type: type, match_id: req.query.match_id, player_id: req.query.player_id, season_id: req.query.season_id, team_id: req.query.team_id }

        const respo = await IplVideosDAO.getIplVideosByFilter(filters, page, limit);
        if (respo && !respo.list.length) {
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }
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
        if (req.params.type != "teamByvideos") {
            var type = req.params.type;
            if (!type) {
                res.json({ status: false, message: "please specify video type" });
            }
            if (req.query.page)
                var page = req.query.page
            else
                page = 1;
            let limit = 20
            let filters = { type: type, match_id: req.query.match_id, player_id: req.query.player_id, season_id: req.query.season_id, team_id: req.query.team_id }
            const respo = await IplVideosDAO.getIplVideosByFilter(filters, page, limit);
            if (respo && !respo.list.length) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }

            let response = {
                status: true,
                message: "Retrived data!",
                videos: respo.list,
                page: page,
                total_results: respo.total,
            }
            res.json(response)
        }
        else {
            try {
                let page = req.query.page ? req.query.page : 1;

                let id = req.query.id && parseInt(req.query.id) || "0"
                let videos = await IplVideosDAO.videoByTeamID(parseInt(id), page)
                if (!videos) {
                    res.status(404).json({ status: false, error: config.error_codes["1001"] })
                    return
                }

                let response = {
                    status: true,
                    message: "Retrived data!",
                    data: videos.data,
                    page: page,
                    total_results: videos.total,
                }
                res.json(response)
            } catch (e) {
                console.log(`api, ${e}`)
                res.status(500).json({ error: e })
            }
        }
    }


    static async apiAppGetPlayUrlById(req, res, next) {
        try {
            console.log("id is: ", req.body.id)
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
            let tags = video.tags;var titles =[];
          
            for(let i=0;i<=tags.length-1;i++){
                titles.push(tags[i].label);
            }
         
            let related = await IplVideosDAO.getRelatedVideos(titles);
            video["relatedVideos"]=related.videoList;
            video["wickets"]=related.wicketList;
            video["sixes"]=related.sixes;
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
        const filter = "";
        const { videosList, totalNumIplVideos } = await IplVideosDAO.getIplVideos(filter, page, LIMIT_PER_PAGE)
        if (!videosList) {
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }
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
        let filters = { type: type, match_id: req.query.match_id, player_id: req.query.player_id, season_id: req.query.season_id, team_id: req.query.team_id }
        console.log("......................", filters)
        const respo = await IplVideosDAO.getIplVideosByFilter(filters, page, limit);
        console.log(respo)
        if (respo && !respo.list.length) {
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }
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
            let tags = video.tags;var titles =[];
          
            for(let i=0;i<=tags.length-1;i++){
                titles.push(tags[i].label);
            }
         
            let related = await IplVideosDAO.getRelatedVideos(titles);
            video.relatedVideos=related;
           // console.log("titles: ",related);
            res.json({ status: true, data: video });
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
    static async apiAppPlayTracking(req, res, next) {
        try {
            var data = req.body;
            //contentId, duration, title,device,utc,
            if(!data || Object.keys(data).length === 0 ){
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            var PlaybackObject = {
                date_added: new Date(),
                title: data.title,
                device: data.device,
                country: data.country,
                content_id : data.content_id,
                duration:parseInt(data.duration)
            }

            let saved = await IplVideosDAO.setPlayTracks(PlaybackObject)
            if (!saved) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            let returndata = saved.ops[0];
            res.json({ status: true, data: returndata })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiAppGetMidpage(req,res,next){
        let slug = req.params.slug;
        if(!slug){
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }
        var filters={};
        filters.type = slug;
        try{
            let videos = await IplVideosDAO.getIplVideosByFilter(filters,1,30);
            if(!videos){
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
                res.json({ status: true, data: videos })
        }catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
        
    }
}
