let matches
const DEFAULT_SORT = [["matchDateMs", -1]]
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
            } else {
                queryParams.project = {
                    "innings.scorecard.battingStats": 0,
                    "innings.scorecard.bowlingStats": 0,
                    "innings.overHistory": 0,
                    "innings.scorecard.fow": 0,
                    "innings.scorecard.extras": 0
                }
            }
            if ("team_id" in filters) {
                console.log("in team id mme...");
                queryParams.query["matchInfo.teams.team.id"] = parseInt(filters["team_id"])
            }
            if ("year" in filters) {
                queryParams.query["matchInfo.matchDate"] = { $in: [new RegExp(filters["year"], "i"), new RegExp(filters["year"] - 1, "i")] }
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
    static async getTeamResultsByid(year, page, id) {
        console.log("Year is: ", year, " id is : ", id);
        try {
            let pageLimit = 20;
            let skip = (page - 1) * pageLimit;
            const pipeline = [
                {
                    $match: {
                        $and: [{ "matchInfo.matchDate": new RegExp(year, "i") },
                        { "matchInfo.teams.team.id": parseInt(id) }]
                    }
                }
            ]
            const countMatches = [
                {
                    $match: {
                        $and: [{ "matchInfo.matchDate": new RegExp(year, "i") },
                        { "matchInfo.teams.team.id": parseInt(id) }]
                    }
                }, { $count: "total" }
            ]
            // console.dir(pipeline, { depth: null, color: true })

            let total = await matches.aggregate(countMatches).toArray();

            let data = await matches.aggregate(pipeline).limit(pageLimit).skip(skip).toArray();
            return { data: data, total: total[0].total };
        }
        catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }
    static async playerInfo(ID) {
        try {
            let id = parseInt(ID);
            console.log("id: ",id );
            const countingPipeline = [

                {
                    $match: {
                        "matchInfo.teams.players.id": id
                    }
                },
                { $unwind: "$matchInfo.teams" },
                { $unwind: "$matchInfo.teams.players" },
                // { $unwind: "$innings" },
                // { $unwind: "$innings.scorecard.bowlingStats" },

                {
                    $match: {
                        'matchInfo.teams.players.id': id
                    }
                },
                { $project: { "matchInfo.matchDate": 1, "matchInfo.teams.players": 1,"matchInfo.teams.team.id":1, "matchId": 1 } },
                {
                    $group:
                    {
                        _id: "$matchInfo.teams.players.id",
                        player_detail: { $first: "$matchInfo.teams.players" },
                        team: { $first: "$matchInfo.teams.team.id" },
                    }
                },
                {
                    $project: { "player_id": "$_id", player_detail: 1, team:1,_id: 0 }
                }
            ]
            const total = await matches.find({"matchInfo.teams.players.id":id}).count()
            const pipeline = [...countingPipeline]
            const matchesList = await matches.aggregate(pipeline).toArray()
            // console.log(matchesList);
            // console.log(total);
            let data= matchesList.length ? matchesList[0] : {}
            data.matches=total;
            console.log(data);
            return data;

        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }

    }
    static async getIplMatchesFilterByType(type, page, id) {
        console.log("getIplMatchesFilterByType",type);
        let query = {};
        let videosPerPage = 20;
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
            else if(type=="teamId"){
                console.log("teamid: ",type);
                query = { 'matchInfo.teams.team.id': id }
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

    static async getTeams(params) {
        try {
            const pipeline = [
                {
                    $match: { "matchInfo.matchDate": new RegExp(params.year, "i") }
                },
                { $unwind: "$matchInfo.teams" },
                {
                    $addFields: {
                        team: "$matchInfo.teams.team",
                    }
                },

                {
                    $group: {
                        "_id": "$team.type",
                        "franchises": {
                            "$addToSet": "$team"
                        },
                    }
                },


                {
                    $project: { "team_type": "$_id", "franchises": 1, _id: 0 }
                },
                { $sort: { "franchises.id": 1 } }


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
    static async findWinsByTeam(id, name) {
        var stringToUse = name + " won"
        console.log("string to use is: ",stringToUse);
        var match = await matches.distinct("matchInfo.matchDate", { "matchInfo.description": "Final","matchInfo.matchStatus.text": { $regex: new RegExp(stringToUse, "i") } ,"matchInfo.teams.team.id":id});
        console.log("match is: ",match);
        let years = ["2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"];
        let won = [];
       
        for (let j = 0; j <= years.length - 1; j++) {
            for (let k = 0; k <= match.length - 1; k++) {
                if (match[k].includes(years[j])) {
                    if (won.includes(years[j])) {
                    } else {
                        won.push(years[j]);
                    }
                } else {
                    // console.log("In else method...");
                }
            }

            if (j == years.length - 1) {
                return won;
            }
        }
    }

    static async statsData(filters) {
        let pipeline = [{
            $match: { "matchInfo.matchDate": new RegExp(filters["year"], "i") }
        },
        { $unwind: "$matchInfo.teams" },
        { $unwind: "$innings" },
        { $unwind: "$innings.scorecard.bowlingStats" },
        { $project: { "matchInfo.matchDate": 1, "matchInfo.teams": 1, "innings.scorecard.bowlingStats": 1, "matchId": 1 } },
        {
            $group:
            {
                _id: "$matchInfo.teams.team.id",
                team_details: { $first: "$matchInfo.teams.team" },
                player_detail: { $first: "$matchInfo.teams.players" },

            }
        }
        ]

        const matchList = await matches.aggregate(pipeline).toArray()
        return matchList;
    }

    static async getProcessPlayersData(players){
        for(let i=0;i<=players.length-1;i++){
            console.log("id: ",players[i].id);
            var pipeline = [
                {$match: {
                    "matchInfo.teams.players.id": players[i].id },
                    
                }
                ,{ $unwind: "$innings" }, { $unwind: "$innings.scorecard.bowlingStats" },
                 {$match:{"innings.scorecard.bowlingStats.playerId":players[i].id}},
            //     {
            //     $group:
            //     {
            //         _id: "$innings.scorecard.bowlingStats.playerId",
            //         totalWickets: { $sum: "$innings.scorecard.bowlingStats.w" },
            //     }
            //   }
            ]
            const total = await matches.aggregate(pipeline).toArray()
            console.log("Total is: ",total);

        }
    }
}