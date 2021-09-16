const Db = require("mongodb/lib/db")
let playList
module.exports = class PlaylistDao {
    static async injectDB(con) {
        try {
            playList = await con.db(process.env.BCCI).collection('playlist');
        }
        catch (e) {
            console.error(`Unable to establish collection handles in pagesDAO: ${e}`)
        }

    }
    static async getPlayListByid(id) {
        try {
            const pipeline = [
                {
                    $match: {
                        ID: id
                    }
                }
            ]
            return await playList.aggregate(pipeline).next();
        }
        catch (e) {
            console.error(`Unable to establish a collection handle in Playlist DAO: ${e}`);
        }
    }
}