const { ObjectId } = require("bson")

let records
let promos
let mflix
const DEFAULT_SORT = [["tomatoes.viewer.numReviews", -1]]

module.exports = class IplRecordsDAO {
    static async injectDB(conn) {

        try {
            records = await conn.db(process.env.BCCINS).collection("franchise_years")
            this.records = records // this is only for testing
            //this.promos = promos
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in recordsDAO: ${e}`,
            )
        }
    }


    static async getFranchiseByID(params) {
        try {
            const pipeline = [
                {
                    $match: {
                        "year": params.year.toString(),
                        "franchise_id": params.id.toString()
                    }
                },
                {
                    $lookup:
                    {
                        from: "records",
                        localField: "id",
                        foreignField: "franchise_year_id",
                        as: "records"
                    }
                },
                //{ $unwind: "$records" },
                {
                    $lookup:
                    {
                        from: "players",
                        localField: "records.player_id",
                        foreignField: "id",
                        as: "players"
                    }
                },
            ]
            console.log(pipeline)
            //  console.log(records)
            return await records.aggregate(pipeline).toArray()
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }
}


