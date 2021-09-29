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
            console.log("filters: ", filters);
            if ("matchState" in filters) {
                queryParams.query["matchInfo.matchState"] = { $in: filters["matchState"] }
            }
            if (filters["startDate"] && filters["endDate"]) {
                console.log("In start and end dates");

                // queryParams.query["matchInfo.matchDate"] = { $gte: filters["startDate"], $lte: filters["endDate"] }
                // queryParams.query["$expr"] = {
                //     "$gte": [{ "$dateFromString": { "dateString": "$matchInfo.matchDate" } }, filters["startDate"]],
                //     "$lte": [{ "$dateFromString": { "dateString": "$matchInfo.matchDate" } }, filters["endDate"]]
                // }
            } if ("team" in filters) { //Men or Women
                queryParams.query["matchInfo.teams.team.type"] = { $in: filters["team"] }
            }
            if ("matchId" in filters) {
                queryParams.query["matchId.id"] = parseInt(filters["matchId"])
            }
            if ("team_id" in filters) {
                queryParams.query["matchInfo.teams.team.id"] = parseInt(filters["team_id"])
            }
            if ("year" in filters && !filters["startDate"] && !filters["endDate"]) {
                queryParams.query["matchInfo.matchDate"] = new RegExp(filters["year"], "i")
            }
        }
        console.log(queryParams)
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
    static async getSeasonList(params) {
        try {
            const pipeline = [
                // {
                //     $match: {
                //         "matchInfo.matchDate": new RegExp(params.year, "i")
                //     }
                // },

                {
                    $group: {
                        _id: {
                            "$substr": [
                                "$matchInfo.matchDate",
                                0,
                                4
                            ]
                        },
                        "tournament_id": { $first: "$matchId.tournamentId.id" }
                    }
                },
                { $sort: { "_id": 1 } },
                {
                    $project: { "year": "$_id", "tournament_id": 1, _id: 0 }
                }

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

    static async getArchiveData({ filters = null }) {
        try {
            const countingPipeline = [
                {
                    $match: {
                        "matchInfo.teams.team.type": { $in: filters["team"] },
                        "matchInfo.teams.team.id": { $eq: parseInt(filters["team_id"]) },

                        "matchInfo.matchDate": { $not: new RegExp(new Date().getFullYear(), "i") }
                    }
                },
                {
                    $group: {
                        _id: {
                            "$substr": [
                                "$matchInfo.matchDate",
                                0,
                                4
                            ]
                        }
                    }
                },
                {
                    $project: { "year": "$_id", description: 1 }
                },
                { '$sort': { '_id': -1 } },

            ]
            const pipeline = [...countingPipeline]

            const matchesList = await (await matches.aggregate(pipeline)).toArray()
            return {
                matchesList,
                totalNumMatches: 0//totalNumMatches.count,
            }
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }

    static async getTopBatsmenByTeamAndYear(filters) {
        try {
            const countingPipeline = [
                {
                    $match: {
                        "matchInfo.teams.team.type": { $in: filters["team"] },
                        "matchInfo.teams.team.id": { $eq: parseInt(filters["team_id"]) },
                        "matchInfo.matchDate": new RegExp(filters["year"], "i")
                    }
                },
                { $unwind: "$innings" },
                { $unwind: "$matchInfo.teams" },
                { $unwind: "$innings.scorecard.battingStats" },
                {
                    $match: {
                        "matchInfo.teams.team.id": { $eq: parseInt(filters["team_id"]) }
                    }
                },
                { $project: { "matchInfo.matchDate": 1, "matchInfo.teams.players": 1, "innings.scorecard.battingStats": 1, "matchId": 1 } },
                {
                    $group:
                    {

                        _id: "$innings.scorecard.battingStats.playerId",
                        player_detail: { $first: "$matchInfo.teams.players" },

                        totalRuns: { $sum: "$innings.scorecard.battingStats.r" },
                    }
                },
                {
                    $project: { "player_id": "$_id", player_detail: 1, totalRuns: 1, _id: 0 }
                },
                { '$sort': { 'totalRuns': -1 } },

            ]
            const pipeline = [...countingPipeline]
            const matchesList = await (await matches.aggregate(pipeline)).toArray()
            return matchesList.length ? matchesList[0] : {}

        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }
    static async getTopBolwerByTeamAndYear(filters) {
        try {
            const countingPipeline = [
                {
                    $match: {
                        "matchInfo.teams.team.type": { $in: filters["team"] },
                        "matchInfo.teams.team.id": { $eq: parseInt(filters["team_id"]) },
                        "matchInfo.matchDate": new RegExp(filters["year"], "i")
                    }
                },
                { $unwind: "$innings" },
                { $unwind: "$matchInfo.teams" },
                { $unwind: "$innings.scorecard.bowlingStats" },
                {
                    $match: {
                        "matchInfo.teams.team.id": { $eq: parseInt(filters["team_id"]) }
                    }
                },
                { $project: { "matchInfo.matchDate": 1, "matchInfo.teams.players": 1, "innings.scorecard.bowlingStats": 1, "matchId": 1 } },
                {
                    $group:
                    {
                        _id: "$innings.scorecard.bowlingStats.playerId",
                        player_detail: { $first: "$matchInfo.teams.players" },
                        totalWikcets: { $sum: "$innings.scorecard.bowlingStats.w" },
                    }
                },
                {
                    $project: { "player_id": "$_id", player_detail: 1, totalWikcets: 1, _id: 0 }
                },
                { '$sort': { 'totalWikcets': -1 } },

            ]
            const pipeline = [...countingPipeline]

            console.dir(pipeline, { depth: null, color: true })
            const matchesList = await (await matches.aggregate(pipeline)).toArray()
            return matchesList.length ? matchesList[0] : {}

        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }
    static async getScheduleList(year, id) {
        console.log("Year is: ", year, " id is : ", id);
        try {
            const pipeline = [
                {
                    $match: {
                        $and: [{ "matchInfo.matchDate": new RegExp(year, "i") },
                        { "matchInfo.teams.team.id": parseInt(id) }]
                    }
                }
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


    static async getSquadListByID(params) {
        try {
            const pipeline = [

                {
                    $match: { "matchInfo.matchDate": new RegExp(params.year, "i"), "matchInfo.teams.team.id": params.id }
                },
                { $unwind: "$matchInfo.teams" },
                {
                    $match: { "matchInfo.teams.team.id": params.id }
                },
                { $unwind: "$matchInfo.teams.players" },
                {
                    $group: {
                        _id: "$matchInfo.teams.team.id",
                        "fullName": { $first: "$matchInfo.teams.team.fullName" },
                        "shortName": { $first: "$matchInfo.teams.team.shortName" },
                        "abbreviation": { $first: "$matchInfo.teams.team.abbreviation" },
                        "type": { $first: "$matchInfo.teams.team.type" },
                        "primaryColor": { $first: "$matchInfo.teams.team.primaryColor" },
                        "secondaryColor": { $first: "$matchInfo.teams.team.secondaryColor" },
                        "captain": { $first: "$matchInfo.teams.captain" },
                        "wicketKeeper": { $first: "$matchInfo.teams.wicketKeeper" },
                        "players": { $addToSet: "$matchInfo.teams.players" }
                    }
                }
            ]
            console.log(pipeline)
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
    static async getTeamResultsByid(year, id) {
        console.log("Year is: ", year, " id is : ", id);
        try {
            const pipeline = [
                {
                    $match: {
                        $and: [{ "matchInfo.matchDate": new RegExp(year, "i") },
                        { "matchInfo.teams.team.id": parseInt(id) }]
                    }
                }
            ]
            console.dir(pipeline, { depth: null, color: true })
            return await matches.aggregate(pipeline).toArray()
        }
        catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }
    static async getIplMatchesFilterByType(type, page, id) {
        let query = {};
        let videosPerPage =20;
        var skip = (page - 1) * videosPerPage;
        try {
            if (type == "season") {
                query = { 'matchId.tournamentId.id': id }
            }
            else if (type == "team") {
                query = { 'matchInfo.teams.team.id': id }
            }
            else if (type = "venue") {
                query = { 'matchInfo.venue.id': id }
            }
           const totalMatches = await matches.find(query).count();
           let matchesResult = await matches.find(query).limit(videosPerPage).skip(skip).toArray();
    
          let results = { list: matchesResult, total: totalMatches };
          return results
           
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }

    }
}