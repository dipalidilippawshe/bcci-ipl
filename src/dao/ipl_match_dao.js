let matches
const DEFAULT_SORT = [["date", -1]]
module.exports = class MatchDAO {
    static async injectDB(conn) {

        try {
            matches = await conn.db(process.env.BCCINS).collection("ipl_matches")
        } catch (e) {
            console.error(`Unable to establish collection handles in pagesDAO: ${e}`)
        }
    }

    /**
    Ticket: User Management
  
    For this ticket, you will need to implement the following five methods:
  
    - getUser
    - addUser
    - loginUser
    - logoutUser
    - getUserSession
  
    You can find these methods below this comment. Make sure to read the comments
    in each method to better understand the implementation.
  
    The method deleteUser is already given to you.
    */

    /**
     * Finds a user in the `users` collection
     * @param {string} slug - The email of the desired user
     * @returns {Object | null} Returns either a single user or nothing
     */
    static async getMatches({
        // here's where the default parameters are set for the getMatches method
        filters = null,
        page = 0,
        matchesPerPage = 20,
    } = {}) {
        let queryParams = {}
        queryParams.query = {}
        if (filters) {
            if ("matchState" in filters) {
                queryParams.query["matchInfo.matchState"] = { $in: filters["matchState"] }
            }
            if ("startDate" in filters && "endDate" in filters) {
                queryParams.query["matchInfo.matchDate"] = { $gte: filters["startDate"], $lte: filters["endDate"] }
            } if ("team" in filters) { //Men or Women
                queryParams.query["matchInfo.teams.team.type"] = { $in: filters["team"] }
            }
        }
        console.dir(queryParams, { depth: null, color: true })
        let { query = {}, project = {}, sort = DEFAULT_SORT } = queryParams
        let cursor
        try {
            cursor = await matches
                .find(query)
                .project(project)
                .sort(sort)
                .limit(matchesPerPage)
                .skip(page * matchesPerPage)

        } catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return { matchesList: [], totalNumMatches: 0 }
        }


        const displayCursor = cursor.limit(matchesPerPage)

        try {
            const matchesList = await displayCursor.toArray()
            const totalNumMatches = await matches.countDocuments(query) //page === 0 ? await matches.countDocuments(query) : 0
            return { matchesList, totalNumMatches }
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`,
            )
            return { matchesList: [], totalNumMatches: 0 }
        }
    }
    static async getSeriesnTournaments({ filters = null,
        page = 0,
        matchesPerPage = 20 }) {
        try {
            const countingPipeline = [
                {
                    $match: {
                        // _id: ObjectId(id)

                        "matchInfo.matchDate": { $gte: filters["startDate"], $lte: filters["endDate"] },
                        "matchInfo.teams.team.type": { $in: filters["team"] }
                    }
                },
                {
                    $group: {
                        "_id": "$matchId.tournamentId.id",
                        "matchTypes": {
                            "$push": "$matchInfo.matchType"
                        },
                        "endDate": {
                            "$last": "$matchInfo.matchDate"
                        },
                        "startDate": {
                            "$first": "$matchInfo.matchDate"
                        },
                        "tournamentLabel": {
                            "$first": "$matchInfo.tournamentLabel"
                        }
                    }
                },
                { '$sort': { 'matchInfo.matchDate': filters["sort"] } },

            ]
            const pipeline = [...countingPipeline,
            { $skip: matchesPerPage * page }
                , { $limit: matchesPerPage }]

            console.dir(pipeline, { depth: null, color: true })
            const matchesList = await (await matches.aggregate(pipeline)).toArray()
            //console.log(results)
            const totalNumMatches = await (await matches.aggregate([...countingPipeline, { $count: "count" }])).next()
            return {
                matchesList,
                totalNumMatches: totalNumMatches.count,
            }
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }
    static async getMatchByID(id) {
        try {
            const pipeline = [
                {
                    $match: {
                        "matchId.id": id
                    }
                }
            ]
            console.log(pipeline)
            return await matches.aggregate(pipeline).next()
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }

    static async getFranchiseByID(id) {
        try {
            const pipeline = [
                {
                    $match: {
                        "matchInfo.teams.team.id": id
                    }
                }
            ]
            console.log(pipeline)
            return await matches.aggregate(pipeline).toArray()
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }

    static async getVenue(params) {
        try {
            const pipeline = [
                {
                    $match: {
                        "matchInfo.matchDate": new RegExp(params.year, "i")
                    }
                },
                { $group: { _id: null, venues: { $addToSet: "$matchInfo.venue" } } }

            ]
            console.dir(pipeline, { depth: null, color: true })
            //  console.log(franchise_years)
            return await matches.aggregate(pipeline).toArray()
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }

}