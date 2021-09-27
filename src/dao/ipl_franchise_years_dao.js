const { ObjectId } = require("bson")

let franchise_years
let promos
let mflix
const DEFAULT_SORT = [["tomatoes.viewer.numReviews", -1]]

module.exports = class IplRecordsDAO {
    static async injectDB(conn) {

        try {
            franchise_years = await conn.db(process.env.BCCINS).collection("franchise_years")
            this.franchise_years = franchise_years // this is only for testing
            //this.promos = promos
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in franchise_yearsDAO: ${e}`,
            )
        }
    }

    static async getFranchiseByID(params) {
        try {
            const pipeline = [
                // {
                //     $match: {
                //        $and:[{"year": params.year.toString()},{"franchise_id": params.id.toString()}]
                //     }
                // },
                {
                    $match:{"year": params.year.toString(),"franchise_id": params.id.toString()}
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
                }
            ]
            console.log(pipeline)
            //  console.log(franchise_years)
            return await franchise_years.aggregate(pipeline).toArray()
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }

    static async getTeams(params) {
        try {
            const pipeline = [
                {
                    $match: {
                        "year": params.year.toString()
                    }
                },
                /* {
                    $group: {
                        "_id": "year",
                        "franchise_id": {
                            "$push": "$franchise_id"
                        },
                    }
                }, */
                {
                    $lookup:
                    {
                        from: "franchises",
                        localField: "franchise_id",
                        foreignField: "id",
                        as: "franchises"
                    }
                },
                { $unwind: "$franchises" },
                {
                    $match: {
                        "franchises.is_playing": "1"
                    }
                },
                {
                    $addFields: {
                        "franchises_name": "$franchises.name",
                        "franchises_abbreviation": "$franchises.abbreviation",
                        "franchises_owner":"$franchises.owner",
                        "franchises_venue":"$franchises.venue",
                        "franchises_coach":"$franchises.coach",
                        "franchises_captain":"$franchises.captain",
                        "franchises_logo":"$franchises.logo",
                        "franchises_social":"$franchises.social"

                    }
                },
                {
                    $project: { "franchise_id": 1, "franchises_name": 1, "franchises_abbreviation": 1,"franchises_owner":1,
                    "franchises_venue":1, "franchises_coach":1,"franchises_captain":1,"franchises_logo":1,"franchises_social":1,_id: 0 }
                }

            ]
            console.log(pipeline)
            //  console.log(franchise_years)
            return await franchise_years.aggregate(pipeline).toArray()
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }
}


