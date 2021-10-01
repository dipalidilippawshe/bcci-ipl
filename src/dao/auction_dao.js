const { ObjectId } = require("bson")

let auction
const DEFAULT_SORT = [["date", -1]]

module.exports = class AuctionDAO {
    static async injectDB(conn) {
        if (auction) {
            return
        }
        try {
            auction = await conn.db(process.env.BCCINS).collection("records")
            this.auction = auction // this is only for testing
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in auctionDAO: ${e}`,
            )
        }
    }



    /**
     * Gets a video by its id
     * @param {string} id - The desired video id, the _id in Mongo
     * @returns {MflixVideo | null} Returns either a single video or nothing
     */
    static async getAuctionByID(id) {
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
            return await auction.aggregate(pipeline).next()
        } catch (e) {

            console.error(`Unable to establish a collection handle in Playlist DAO: ${e}`)
        }
    }
}


