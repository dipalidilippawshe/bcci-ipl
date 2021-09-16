const playlistDAO = require("../../dao/playlist_dao");
module.exports = class IplVideosController {
    
    static async getAppPlaylistbyType(req, res, next) {
        var type = req.params.type;
        if (!type) {
            res.json({ status: false, message: "please specify video type" });
        }
        if (req.query.page)
            var page = req.query.page
        else
            page = 1;

        const respo = await playlistDAO.getPlaylistsByFilter(type, page);
        let response = {
            status: true,
            message: "Retrived data!",
            videos: respo.list,
            page: page,
            total_results: respo.total,
        }
        res.json(response)
    }

    static async getWebPlaylistbyType(req, res, next) {
        var type = req.params.type;
        if (!type) {
            res.json({ status: false, message: "please specify video type" });
        }
        if (req.query.page)
            var page = req.query.page
        else
            page = 1;

        const respo = await playlistDAO.getPlaylistsByFilter(type, page);
        let response = {
            status: true,
            message: "Retrived data!",
            videos: respo.list,
            page: page,
            total_results: respo.total,
        }
        res.json(response)
    }
    static async apiAppGetPlaylistById(req, res, next) {
        try {
            const id = req.params.id ? req.params.id : "";
            const playList = await playlistDAO.getPlayListByid(parseInt(id));
            if (!playList) {
                res.status(404).json({ succcess: false, data: `id ${id} not found ` });
            }
            else {
                res.status(200).json({ success: true, data: playList });
            }
        }
        catch (e) {
            res.status(500).json({ error: e });
        }
    }
    static async apiWebGetPlaylistById(id) {
        try {
            const id = req.params.id ? req.params.id : "";
            const playList = await playlistDAO.getPlayListByid(parseInt(id));
            if (!playList) {
                res.status(404).json({ succcess: false, data: `id not ${id} found` })
            }
            else {
                res.json({ success: true, data: playList })
            }
        }
        catch (e) {
            res.status(500).json({ error: e })
        }
    }
}