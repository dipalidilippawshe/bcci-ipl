const { ObjectId } = require("bson")

let bios
const DEFAULT_SORT = [["date", -1]]

module.exports = class BiosDAO {
    static async injectDB(conn) {
        if (bios) {
            return
        }
        try {
            bios = await conn.db(process.env.BCCINS).collection("bios")
            this.bios = bios // this is only for testing
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in biosDAO: ${e}`,
            )
        }
    }

   

    /**
     * Gets a video by its id
     * @param {string} id - The desired video id, the _id in Mongo
     * @returns {MflixVideo | null} Returns either a single video or nothing
     */
    static async getBiosByID(id) {
        try {

            const pipeline = [
                {
                    $match: {
                        // _id: ObjectId(id)
                        ID: id
                    }
                }
            ]
            console.log(pipeline)
            return await bios.aggregate(pipeline).next()
        } catch (e) {
          
            console.error(`Unable to establish a collection handle in Playlist DAO: ${e}`)
        }
    }
}


