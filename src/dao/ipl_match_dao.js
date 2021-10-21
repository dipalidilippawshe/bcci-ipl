let matches
let franchisedata
let iplArticles
let videos
const DEFAULT_SORT = [["matchDateMs", -1]]
module.exports = class MatchDAO {
    static async injectDB(conn) {

        try {
            matches = await conn.db(process.env.BCCINS).collection("ipl_matches")
            franchisedata = await conn.db(process.env.BCCINS).collection("franchises")
            iplArticles = await conn.db(process.env.BCCINS).collection("ipl_articles")
            videos = await conn.db(process.env.BCCINS).collection("ipl_videos")
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

            }
            if ("team" in filters) { //Men or Women
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
                queryParams.query["matchInfo.matchDate"] = { $in: [new RegExp(filters["year"], "i")/* , new RegExp(filters["year"] - 1, "i") */] }
            }
            if ("venue_id" in filters) {
                queryParams.query["matchInfo.venue.id"] = parseInt(filters["venue_id"])
            }
        }
        console.log(page)
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
            console.log(totalNumMatches)
            return {
                matchesList,
                totalNumMatches: totalNumMatches ? totalNumMatches.count : 0,
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
            let pipeline = [
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

            if (params.teamId && params.teamId !== null) {
                pipeline = [
                    {
                        $match: {
                            "matchInfo.teams.team.id": parseInt(params.teamId)
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
                            },
                            "tournament_id": { $first: "$matchId.tournamentId.id" }
                        }
                    },
                    { $sort: { "_id": 1 } },
                    {
                        $project: { "year": "$_id", "tournament_id": 1, _id: 0 }
                    }

                ]
            }
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
                        },
                        team: { $first: "$matchInfo.teams.team" }
                    }
                },
                {
                    $project: {
                        "year": "$_id", description: 1,
                        // team: 1
                        team: {
                            $first: {
                                $filter: {
                                    input: "$team",
                                    as: "item",
                                    cond: { $eq: [parseInt(filters["team_id"]), "$$item.id"] }
                                }
                            }
                        },
                    }
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
    static async getTeamResultsByid(year, page, id, filters) {

        console.log("Year is: ", year, " id is : ", id);
        let pageLimit = 20;
        try {
            if (!filters) {

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
            else {
                let queryParams = {};
                queryParams.query = {};

                let skip = (page - 1) * pageLimit;
                if ("matchState" in filters) {
                    queryParams.query["matchInfo.matchState"] = { $in: filters["matchState"] }
                }
                if (id.matchId) {
                    queryParams.query["matchId.id"] = parseInt(id.matchId);
                }
 
                if (id.teamId) {
                    console.log("in team id mme...");
                    queryParams.query["matchInfo.teams.team.id"] = parseInt(id.teamId);
                }

                if (year) {
                    queryParams.query["matchInfo.matchDate"] = { $in: [new RegExp(year, "i"), new RegExp(year - 1, "i")] }
                }

                try {
                 
                    let total = await matches.find(queryParams.query).count();
                    let data = await matches.find(queryParams.query).limit(pageLimit).skip(skip).toArray();
                    
                    return { data: data, total: total };

                } catch (e) {
                    console.error(`Unable to issue find command, ${e}`)
                    return { matchesList: [], totalNumMatches: 0 }
                }
            }



        }
        catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getting corrent year: ${e}`)
            throw e
        }
    }
    static async playerInfo(ID) {
        try {

            let id = parseInt(ID);
            const countingPipeline = [

                {
                    $match: {
                        "matchInfo.teams.players.id": id
                    }
                },
                { $unwind: "$matchInfo.teams" },
                { $unwind: "$matchInfo.teams.players" },
                {
                    $match: {
                        'matchInfo.teams.players.id': id
                    }
                },
                { $project: { "matchInfo.matchDate": 1, "matchInfo.teams.players": 1, "matchId": 1 } },
                {
                    $group:
                    {
                        _id: "$matchInfo.teams.players.id",
                        player_detail: { $first: "$matchInfo.teams.players" },

                    }
                },
                {
                    $project: { "player_id": "$_id", player_detail: 1, _id: 0 }
                }
            ]
            const total = await matches.find({ "matchInfo.teams.players.id": id }).count()
            const pipeline = [...countingPipeline]
            const matchesList = await matches.aggregate(pipeline).toArray()

            let data = matchesList.length ? matchesList[0] : {}
            data.matches = total;
           // console.log(data);
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
        console.log("getIplMatchesFilterByType", type);
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
            else if (type == "teamId") {
                console.log("teamid: ", type);
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
                    $sort:{"team": 1}
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
               // { $sort: { "franchises.id": 1 } }


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
        console.log("string to use is: ", stringToUse);
        var match = await matches.distinct("matchInfo.matchDate", { "matchInfo.description": "Final", "matchInfo.matchStatus.text": { $regex: new RegExp(stringToUse, "i") }, "matchInfo.teams.team.id": id });
        console.log("match is: ", match);
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

    static async statsBattingData(filters) {
        var sort = { '$sort': { 'mostRuns': -1 } }
        if (filters.sort) {
            sort = { '$sort': { [filters.sort]: -1 } }
        }
        var match = {}
        if (filters.team_id) {
            match = {
                "matchInfo.teams.team.id": { $eq: parseInt(filters["team_id"]) }
            }
        }
        const countingPipeline = [
            {
                $match: {
                    "matchInfo.teams.team.type": { $in: filters["team"] ? filters["team"] : ["m"] },
                    "matchInfo.matchDate": new RegExp(filters["year"], "i")
                }
            },
            { $unwind: "$innings" },
            filters.team_id ? { $unwind: "$matchInfo.teams" } : { $match: {} },
            {
                $match: match
            },
            { $unwind: "$innings.scorecard.battingStats" },
            { $match: { "innings.scorecard.battingStats.b": { $gt: 0 } } },
            {
                $project: {
                    "matchInfo.matchDate": 1,
                    "matchInfo.teams": 1,
                    "innings.scorecard.battingStats": 1,
                    "matchId": 1,
                    "most50s": {
                        "$cond": [{ $and: [{ "$gte": ["$innings.scorecard.battingStats.r", 50] }, { "$lt": ["$innings.scorecard.battingStats.r", 100] }] }, 1, 0]
                    },
                    "most100s": {
                        "$cond": [{ "$gte": ["$innings.scorecard.battingStats.r", 100] }, 1, 0]
                    },
                }
            },
            {
                $group:
                {

                    _id: "$innings.scorecard.battingStats.playerId",
                    inns: { $sum: 1 },
                    mostRuns: { $sum: "$innings.scorecard.battingStats.r" },
                    most4s: { $sum: "$innings.scorecard.battingStats.4s" },
                    most6s: { $sum: "$innings.scorecard.battingStats.6s" },
                    bestBat: { $push: { "runs": "$innings.scorecard.battingStats.r", matchId: "$matchId" } },
                    highestInnScore: { $max: "$innings.scorecard.battingStats.r" },
                    most50s: { $sum: "$most50s" },
                    isOut: { $push: "$innings.scorecard.battingStats.mod.isOut" },
                    most100s: { $sum: "$most100s" },
                    ballsFaced: { $sum: "$innings.scorecard.battingStats.b" },
                }
            }, {
                $project: {
                    player_id: "$_id",
                    ballsFaced: 1,
                    // matches: 1, //{ $size: "$matches" },
                    highScore: "$highestInnScore",
                    notOut: { $subtract: ["$inn", { $size: "$isOut" }] },
                    stickeRate: { $toString: { $round: [{ $multiply: [100, { $divide: ['$mostRuns', '$ballsFaced'] }] }, 2] } },
                    highestInnScore: {
                        $filter: {
                            input: "$bestBat",
                            as: "item",
                            cond: { $eq: ["$highestInnScore", "$$item.runs"] }
                        }
                    },
                    avg: { $toString: { $cond: [{ $eq: [{ $size: "$isOut" }, 0] }, "NA", { $round: [{ $divide: ['$mostRuns', { $size: "$isOut" }] }, 2] }] } },
                    most50s: 1,
                    most100s: 1,
                    mostRuns: 1,
                    most4s: 1,
                    most6s: 1,
                    inns: 1,
                    _id: 0,
                }
            },
            sort

        ]
        const pipeline = [...countingPipeline]
        console.dir(pipeline, { depth: null, color: true })
        const matchesList = await (await matches.aggregate(pipeline)).toArray()
        return matchesList

    }

    static async statsBowlingData(filters) {
        var sort = { '$sort': { 'mostWkts': -1 } }
        if (filters.sort) {
            sort = { '$sort': { [filters.sort]: ["bestBowlAvg", "bestBowlEco"].includes(filters.sort) ? 1 : -1 } }
        }
        if (filters.sort === "bestBowlInn") {
            sort = { '$sort': { "bestBowlInn.wkts": -1, "bestBowlInn.runs": 1 } }
        }
        var bowlAvgMatch = {}
        if (filters.sort === "bestBowlAvg") {
            bowlAvgMatch = {

                bestBowlAvg: { $ne: "NA" }
            }
        }
        var match = {}
        if (filters.team_id) {
            match = {

                "matchInfo.teams.team.id": { $eq: parseInt(filters["team_id"]) }
            }
        }
        const countingPipeline = [
            {
                $match: {
                    "matchInfo.teams.team.type": { $in: filters["team"] ? filters["team"] : ["m"] },
                    "matchInfo.matchDate": new RegExp(filters["year"], "i")
                }
            },
            { $unwind: "$innings" },
            filters.team_id ? { $unwind: "$matchInfo.teams" } : { $match: {} },
            {
                $match: match
            },
            { $unwind: "$innings.scorecard.bowlingStats" },

            {
                $project: {
                    "matchInfo.matchDate": 1,
                    "innings.scorecard.bowlingStats": 1,
                    "matchId": 1
                }
            },
            {
                $group:
                {
                    _id: "$innings.scorecard.bowlingStats.playerId",
                    mostWkts: { $sum: "$innings.scorecard.bowlingStats.w" },
                    wkts: { $push: "$innings.scorecard.bowlingStats.w" },
                    ov: { $push: "$innings.scorecard.bowlingStats.ov" },
                    mostRuns: { $sum: "$innings.scorecard.bowlingStats.r" },
                    mostOvers: { $sum: { "$toDouble": "$innings.scorecard.bowlingStats.ov" } },
                    bestBowl: { $push: { ov: { "$toDouble": "$innings.scorecard.bowlingStats.ov" }, "runs": "$innings.scorecard.bowlingStats.r", wkts: "$innings.scorecard.bowlingStats.w", matchId: "$matchId" } },
                    maxWktsInn: { $max: "$innings.scorecard.bowlingStats.w" }
                }
            },
            {
                $project: {
                    player_id: "$_id",
                    mostWkts: 1,
                    mostRuns: 1,
                    mostOvers: 1,
                    bestBowlInn: {
                        $filter: {
                            input: "$bestBowl",
                            as: "item",
                            cond: { $eq: ["$maxWktsInn", "$$item.wkts"] }
                        }
                    },
                    bestBowlEco: { $toString: { $round: [{ $divide: ['$mostRuns', '$mostOvers'] }, 2] } },
                    bestBowlAvg: { $toString: { $cond: [{ $eq: ["$mostWkts", 0] }, "NA", { $round: [{ $divide: ['$mostRuns', '$mostWkts'] }, 2] }] } },
                    _id: 0
                }
            },
            {
                $match: bowlAvgMatch
            },
            { $unwind: "$bestBowlInn" },
            sort

        ]
        const pipeline = [...countingPipeline]
        console.dir(pipeline, { depth: null, color: true })
        const matchesList = await (await matches.aggregate(pipeline)).toArray()
        return matchesList

    }


    static async playerInfoById(id, matchId) {
        try {
            const countingPipeline = [

                {
                    $match: {
                        "matchInfo.teams.players.id": id,
                        "matchId.id": matchId
                    }
                },
                { $unwind: "$matchInfo.teams" },
                //  { $unwind: "$matchInfo.teams.players" },
                // { $unwind: "$innings" },
                // { $unwind: "$innings.scorecard.bowlingStats" },
                {
                    $match: {
                        'matchInfo.teams.players.id': id
                    }
                },
                { $project: { "matchInfo.matchDate": 1, "matchInfo.teams": 1, "matchId": 1 } },
                // {
                //     $group:
                //     {
                //         _id: null,
                //         //player_detail: { $push: "$matchInfo.teams.players" },
                //         team_details: { $push: "$matchInfo.teams.team" },
                //         //totalRuns: { $sum: "$innings.scorecard.battingStats.r" },
                //     }
                // },
                //{ $project: { teams: "$matchInfo.teams" } }
                {
                    $project: {
                        //"player_id": "$_id", 
                        team_detail: "$matchInfo.teams.team",
                        "player_detail": {
                            $first: {
                                $filter: {
                                    input: "$matchInfo.teams.players",
                                    as: "item",
                                    cond: { $eq: [id, "$$item.id"] }
                                }
                            }
                        },
                        // players: "$matchInfo.teams.players",
                        _id: 0
                    }
                }
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

    static async getBattingStatsData(id) {

        const countingPipeline = [
            {
                $match: {
                    "innings.scorecard.battingStats.playerId": id,
                    "matchInfo.matchState": "C"
                }
            },
            { $unwind: "$innings" },
            { $unwind: "$innings.scorecard.battingStats" },
            {
                $match: { "innings.scorecard.battingStats.playerId": id }
            },
            {
                $project: { "innings.scorecard.battingStats": 1 }
            },
            {
                $group:
                {
                    _id: "$innings.scorecard.battingStats.playerId",
                    r: { $sum: "$innings.scorecard.battingStats.r" },
                    b: { $sum: "$innings.scorecard.battingStats.b" },
                    sr: { $sum: "$innings.scorecard.battingStats.sr" },
                    fours: { $sum: "$innings.scorecard.battingStats.4s" },
                    sixes: { $sum: "$innings.scorecard.battingStats.6s" }
                }

            },
            {
                $project: { "player_id": "$_id", r: 1, b: 1, sr: 1, fours: 1, sixes: 1, _id: 0 }
            }

        ]
        //console.log("pipeline: ",countingPipeline);
        const pipeline = [...countingPipeline]
        const matchesList = await matches.aggregate(pipeline).toArray()
        //console.log("oatchlist in vawling....",matchesList);
        // console.log(total);
        let data = matchesList.length ? matchesList[0] : {}
        return data;
    }

    static async getBawlingStatsData(id) {

        const countingPipeline = [
            {
                $match: {
                    "innings.scorecard.bowlingStats.playerId": id,
                    "matchInfo.matchState": "C"
                }
            },
            { $unwind: "$innings" },
            { $unwind: "$innings.scorecard.bowlingStats" },
            {
                $match: { "innings.scorecard.bowlingStats.playerId": id }
            },
            {
                $project: { "innings.scorecard.bowlingStats": 1 }
            },
            {
                $group:
                {
                    _id: "$innings.scorecard.bowlingStats.playerId",
                    ov: { $sum: "$innings.scorecard.bowlingStats.ov" },
                    r: { $sum: "$innings.scorecard.bowlingStats.r" },
                    w: { $sum: "$innings.scorecard.bowlingStats.w" },
                    d: { $sum: "$innings.scorecard.bowlingStats.d" },
                    maid: { $sum: "$innings.scorecard.bowlingStats.maid" },
                    e: { $sum: "$innings.scorecard.bowlingStats.e" },
                    wd: { $sum: "$innings.scorecard.bowlingStats.wd" },
                    nb: { $sum: "$innings.scorecard.bowlingStats.nb" }
                }

            },
            {
                $project: { "player_id": "$_id", ov: 1, r: 1, w: 1, d: 1, maid: 1, e: 1, wd: 1, nb: 1, _id: 0 }
            }

        ]
        //console.log("pipeline: ",countingPipeline);
        const pipeline = [...countingPipeline]
        const matchesList = await matches.aggregate(pipeline).toArray()
        //console.log("oatchlist in vawling....",matchesList);
        // console.log(total);
        let data = matchesList.length ? matchesList[0] : {}
        return data;
    }

    static async getTeamListByYear(playerId, year) {
        if (!year) {
            year = new Date().getFullYear();
        }
        year = year.toString();
        let query = { "matchInfo.matchState": "C", "matchInfo.teams.players.id": parseInt(playerId) };
        let cursor = await matches.find(query).sort({ _id: -1 });
        const displayCursor = cursor.limit(1);
        const articlesList = await displayCursor.toArray()

        var teams = articlesList[0].matchInfo.teams;
        for (var i = 0; i <= teams.length - 1; i++) {

            const found = teams[i].players.find(element => element.id == playerId);
           
            if (found) {
                let franchise = await franchisedata.findOne({id:teams[i].team.id.toString()});
              
                var data = {
                    teamId: teams[i].team.id,
                    teamName: teams[i].team.fullName,
                    playersList: teams[i].players

                }
                if(franchise){
                    data.primaryColor = franchise.primaryColor;
                    data.secondaryColor = franchise.secondaryColor;
                    data.logo = franchise.logo;
                    data.logo_medium = franchise.logo_medium;
                }
                return data;
            }
        }

        //  console.log("getTeamListByYear....",articlesList);

    }
    static async getVenueById(id) {
        let cursor = await matches.findOne({ "matchInfo.venue.id": id });

        return cursor.matchInfo.venue;
    }

    static async getHighestBattingStats() {
        const countingPipeline = [
            { $match : { 'matchInfo.teams.team.type': { '$in': [ 'm' ] }}},
            { $unwind: "$innings" },
            { $unwind: "$innings.scorecard.battingStats" },
            {
                $project: {
                    "matchInfo.matchDate": 1,
                    "innings.scorecard.battingStats": 1,
                    "matchId": 1,
                    "matchInfo.teams": 1,
                }
            },
            {
                $group:
                {
                    _id: "$innings.scorecard.battingStats.playerId",
                    mostRuns: { $sum: "$innings.scorecard.battingStats.r" },
                    most4s: { $sum: "$innings.scorecard.battingStats.4s" },
                    most6s: { $sum: "$innings.scorecard.battingStats.6s" },
                    score: { $sum: "$innings.scorecard.battingStats.sr" }
                }
            },


            {
                $project: {
                    player_id: "$_id",
                    mostRuns: 1,
                    most4s: 1,
                    most6s: 1,
                    //bestBat:1,
                    score: 1,
                    _id: 0,
                }
            }

        ]
        const pipeline = [...countingPipeline]
        console.dir(pipeline, { depth: null, color: true })
        const matchesList = await (await matches.aggregate(pipeline)).toArray()
        return matchesList
    }
    static async getHighestBowlingStats() {
        const countingPipeline = [
            { $unwind: "$innings" },
            { $unwind: "$innings.scorecard.bowlingStats" },
            {
                $project: {
                    "matchInfo.matchDate": 1,
                    "innings.scorecard.bowlingStats": 1,
                    "matchId": 1,
                    "matchInfo.teams": 1,
                }
            },
            {
                $group:
                {
                    _id: "$innings.scorecard.bowlingStats.playerId",
                    ov: { $sum: "$innings.scorecard.bowlingStats.ov" },
                    r: { $sum: "$innings.scorecard.bowlingStats.r" },
                    w: { $sum: "$innings.scorecard.bowlingStats.w" },
                    d: { $sum: "$innings.scorecard.bowlingStats.d" },
                    maid: { $sum: "$innings.scorecard.bowlingStats.maid" },
                    e: { $sum: "$innings.scorecard.bowlingStats.e" },
                    wd: { $sum: "$innings.scorecard.bowlingStats.wd" },
                    nb: { $sum: "$innings.scorecard.bowlingStats.nb" }
                }
            },
            {
                $project: {
                    player_id: "$_id",
                    ov:1,r:1,w:1,d:1,maid:1,e:1,wd:1,nb:1,
                    _id: 0,
                }
            }

        ]
        const pipeline = [...countingPipeline]
        console.dir(pipeline, { depth: null, color: true })
        const matchesList = await (await matches.aggregate(pipeline)).toArray()
        return matchesList
    }
    static async getMatchByIDTeamsResult(id) {
        try {
            const pipeline = [
                {
                    $match: {
                        "matchId.id": id
                    }
                },
                {
                    $project: {
                        "matchInfo.additionalInfo": 1, "matchInfo.teams": 1, "matchInfo.venue": 1, "matchInfo.matchStatus": 1, "matchInfo.matchDate": 1, matchId: 1,
                        "matchInfo.description": 1, "matchInfo.currentState.currentInningsIndex": 1,
                        innings: 1
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

    static async countMatchesPlayerByPlayer(id, year) {
        try {
            var query = {

                "matchInfo.matchDate": new RegExp(year, "i"),

                "matchInfo.teams.players.id": id,

            }
            //console.log(query)
            const count = await matches.countDocuments(query)// await (await matches.aggregate(pipeline)).toArray()
            return count ? count : 0

        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }

    }
    static async getPlayersRunsDataByYear(players, year) {

        try {
            const pipeline = [
                {
                    $match: { "matchInfo.matchDate": new RegExp(year, "i"), "matchInfo.teams.players.id": { $in: players } }
                },
                { $project: { "innings": 1 } },
                { $unwind: "$innings" },
                { $unwind: "$innings.scorecard" },
                { $unwind: "$innings.scorecard.battingStats" },
                {
                    $group: {
                        _id: "$innings.scorecard.battingStats.playerId",
                        runs: { $sum: "$innings.scorecard.battingStats.r" }
                    }
                },
                { $project: { "_id": 1, runs: 1 } }

            ]

            return await matches.aggregate(pipeline).toArray()
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }
    static async getPlayersWicketsDataByYear(players, year) {

        try {
            const pipeline = [
                {
                    $match: { "matchInfo.matchDate": new RegExp(year, "i"), "matchInfo.teams.players.id": { $in: players } }
                },
                { $project: { "innings": 1 } },
                { $unwind: "$innings" },
                { $unwind: "$innings.scorecard" },
                { $unwind: "$innings.scorecard.bowlingStats" },
                {
                    $group: {
                        _id: "$innings.scorecard.bowlingStats.playerId",
                        wickets: { $sum: "$innings.scorecard.bowlingStats.w" }
                    }
                },
                { $project: { "_id": 1, wickets: 1 } }
            ]

            let count = await matches.find({ "matchInfo.matchDate": new RegExp(year, "i"), "matchInfo.teams.players.id": { $in: players } }).count()

            let bawlings = await matches.aggregate(pipeline).toArray()
            return { bawlings: bawlings, count: count };
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }

    static async playerInfoByYear(id,year){
        const countingPipeline = [
            {
                $match: {
                    "matchInfo.teams.players.id": parseInt(id),
                    "matchInfo.matchDate": new RegExp(year, "i")
                }
            }

        ]
        const pipeline = [...countingPipeline]
        console.log("pipeline: ",pipeline);
        const matchesList = await matches.aggregate(pipeline).toArray()
        return matchesList[0]
    }

    static async playerBattingStatsPerYear(playerId){
        const countingPipeline = [
            {
                '$match': {
                  'matchInfo.teams.team.type': { '$in': [ 'm' ] },
                  'innings.scorecard.battingStats.playerId':playerId
                }
              },
              { '$unwind': '$innings' },
              { '$unwind': '$innings.scorecard.battingStats' },
              {
                '$match': {
                  'innings.scorecard.battingStats.playerId':playerId
                }
              },
              { '$match': { 'innings.scorecard.battingStats.b': { '$gt': 0 } } },
              {
                '$project': {
                  'year':  {
                    "$substr": [
                        "$matchInfo.matchDate",
                        0,
                        4
                    ]
                  },
                  'matchInfo.matchDate': 1,
                  'matchInfo.teams': 1,
                  'innings.scorecard.battingStats': 1,
                  matchId: 1,
                  most50s: {
                    '$cond': [
                      {
                        '$and': [
                          { '$gte': [ '$innings.scorecard.battingStats.r', 50 ] },
                          { '$lt': [ '$innings.scorecard.battingStats.r', 100 ] }
                        ]
                      },
                      1,
                      0
                    ]
                  },
                  most100s: {
                    '$cond': [
                      { '$gte': [ '$innings.scorecard.battingStats.r', 100 ] },
                      1,
                      0
                    ]
                  }
                }
              },
              {
                '$group': {
                  _id: '$year',
                  inns: { '$sum': 1 },
                  mostRuns: { '$sum': '$innings.scorecard.battingStats.r' },
                  most4s: { '$sum': '$innings.scorecard.battingStats.4s' },
                  most6s: { '$sum': '$innings.scorecard.battingStats.6s' },
                  bestBat: {
                    '$push': {
                      runs: '$innings.scorecard.battingStats.r',
                      matchId: '$matchId'
                    }
                  },
                  highestInnScore: { '$max': '$innings.scorecard.battingStats.r' },
                  most50s: { '$sum': '$most50s' },
                  isOut: { '$push': '$innings.scorecard.battingStats.mod.isOut' },
                  most100s: { '$sum': '$most100s' },
                  ballsFaced: { '$sum': '$innings.scorecard.battingStats.b' }
                }
              },
              {
                '$project': {
                  year: '$_id',
                  ballsFaced: 1,
                  highScore: '$highestInnScore',
                  notOut: { '$subtract': [ '$inn', { '$size': '$isOut' } ] },
                  stickeRate: {
                    '$round': [
                      {
                        '$multiply': [ 100, { '$divide': [ '$mostRuns', '$ballsFaced' ] } ]
                      },
                      2
                    ]
                  },
                  highestInnScore: {
                    '$filter': {
                      input: '$bestBat',
                      as: 'item',
                      cond: { '$eq': [ '$highestInnScore', '$$item.runs' ] }
                    }
                  },
                  avg: {
                    '$cond': [
                      { '$eq': [ { '$size': '$isOut' }, 0 ] },
                      'NA',
                      {
                        '$round': [
                          { '$divide': [ '$mostRuns', { '$size': '$isOut' } ] },
                          2
                        ]
                      }
                    ]
                  },
                  most50s: 1,
                  most100s: 1,
                  mostRuns: 1,
                  most4s: 1,
                  most6s: 1,
                  inns: 1,
                  _id: 0
                }
              },
              { '$sort': { year: -1 } }
        ]
     
        const pipeline = [...countingPipeline]
        const matchesList = await matches.aggregate(pipeline).toArray()
        //console.log("oatchlist in vawling....",matchesList);
        // console.log(total);
       // let data = matchesList.length ? matchesList[0] : {}
        return matchesList;
    }

    static async playerBowlingStatsPerYear(playerId){
        const countingPipeline = [
            {
               '$match': {
                  'matchInfo.teams.team.type': { '$in': [ 'm' ] },
                  'innings.scorecard.bowlingStats.playerId':playerId
                }
            },
            { '$unwind': '$innings' },
            
            { '$unwind': '$innings.scorecard.bowlingStats' },
            {
                '$match': {
                  'innings.scorecard.bowlingStats.playerId':playerId
                }
              },
            {
              '$project': {
               'year':  {
                    "$substr": [
                        "$matchInfo.matchDate",
                        0,
                        4
                    ]
                  },
                'matchInfo.matchDate': 1,
                'innings.scorecard.bowlingStats': 1,
                matchId: 1
              }
            },
            {
              '$group': {
                _id: '$year',
                mostWkts: { '$sum': '$innings.scorecard.bowlingStats.w' },
                wkts: { '$push': '$innings.scorecard.bowlingStats.w' },
                ov: { '$push': '$innings.scorecard.bowlingStats.ov' },
                mostRuns: { '$sum': '$innings.scorecard.bowlingStats.r' },
                mostOvers: { '$sum': { '$toDouble': '$innings.scorecard.bowlingStats.ov' } },
                bestBowl: {
                  '$push': {
                    ov: { '$toDouble': '$innings.scorecard.bowlingStats.ov' },
                    runs: '$innings.scorecard.bowlingStats.r',
                    wkts: '$innings.scorecard.bowlingStats.w',
                    matchId: '$matchId'
                  }
                },
                maxWktsInn: { '$max': '$innings.scorecard.bowlingStats.w' }
              }
            },
            {
              '$project': {
                year: '$_id',
                mostWkts: 1,
                mostRuns: 1,
                mostOvers: 1,
                bestBowlInn: {
                  '$filter': {
                    input: '$bestBowl',
                    as: 'item',
                    cond: { '$eq': [ '$maxWktsInn', '$$item.wkts' ] }
                  }
                },
                bestBowlEco: {
                  '$round': [ { '$divide': [ '$mostRuns', '$mostOvers' ] }, 2 ]
                },
                bestBowlAvg: {
                  '$cond': [
                    { '$eq': [ '$mostWkts', 0 ] },
                    'NA',
                    {
                      '$round': [ { '$divide': [ '$mostRuns', '$mostWkts' ] }, 2 ]
                    }
                  ]
                },
                _id: 0
              }
            },
            { '$match': {} },
            { '$unwind': '$bestBowlInn' },
            { '$sort': { year: -1 } }
          ]
        
        const pipeline = [...countingPipeline]
        const matchesList = await matches.aggregate(pipeline).toArray()
        //console.log("oatchlist in vawling....",matchesList);
        // console.log(total);
       // let data = matchesList.length ? matchesList[0] : {}
        return matchesList;
    }

    static async findTeamLogos(matchesData){
        for(let i=0;i<=matchesData[0].matchInfo.teams.length-1;i++){
           
            let logo = await franchisedata.findOne({id:matchesData[0].matchInfo.teams[i].team.id.toString()});
            matchesData[0].matchInfo.teams[i].team.logo_medium = logo.logo_medium;
            matchesData[0].matchInfo.teams[i].team.logo = logo.logo;
        }
        return matchesData
    }

    static async getArticleByMatch(matchId){

        let query = {$or:[{"references.type":"CRICKET_MATCH"},{"references.type":"CRICKET_TOURNAMENT"}],
                           "references.id":parseInt(matchId)};

        
        let article=await iplArticles.findOne(query);
        let video = await videos.findOne(query);

        let detail={article:article, video:video}
        return detail


    }
}