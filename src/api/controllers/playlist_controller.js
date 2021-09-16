const playlistDAO = require("../../dao/playlist_dao")


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

}