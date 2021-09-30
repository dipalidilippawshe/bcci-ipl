const { ObjectId } = require("bson")

let records
let promos
let mflix
const DEFAULT_SORT = [["tomatoes.viewer.numReviews", -1]]

module.exports = class IplRecordsDAO {
    static async injectDB(conn) {

        try {
            records = await conn.db(process.env.BCCINS).collection("franchises")
            this.records = records // this is only for testing
            //this.promos = promos
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in recordsDAO: ${e}`,
            )
        }
    }

    static async getfrenchiseDetails(id){
        console.log("ID: ",typeof(id));
        const frenchise = await records.findOne({id:id.toString()});
        return frenchise;
    }
}


