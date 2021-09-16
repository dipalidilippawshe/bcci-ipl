const playlistDAO = require('../../dao/playlist_dao');
module.exports = class PlaylistController {
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