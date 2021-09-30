const { ObjectId } = require("bson")

let franchise
let promos
let mflix
const DEFAULT_SORT = [["tomatoes.viewer.numReviews", -1]]

module.exports = class IplRecordsDAO {
    static async injectDB(conn) {

        try {
            franchise = await conn.db(process.env.BCCINS).collection("franchises")
            this.franchise = franchise // this is only for testing
            //this.promos = promos
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in franchiseDAO: ${e}`,
            )
        }
    }


}


