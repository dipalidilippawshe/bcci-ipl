const { ObjectId } = require("bson")

let franchise_years
let matches
let frenchisesData
let records
let promos
let mflix
const DEFAULT_SORT = [["tomatoes.viewer.numReviews", -1]]

module.exports = class IplRecordsDAO {
    static async injectDB(conn) {

        try {
            franchise_years = await conn.db(process.env.BCCINS).collection("franchise_years")
            matches = await conn.db(process.env.BCCINS).collection("ipl_matches_latest");
            records = await conn.db(process.env.BCCINS).collection("records");
            frenchisesData = await conn.db(process.env.BCCINS).collection("franchises");
            this.franchise_years = franchise_years // this is only for testing
            this.matches = matches
           
            //this.promos = promos
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in franchise_yearsDAO: ${e}`,
            )
        }
    }


    static async getAuctionDetails(params) {
        try {
            console.log("paramss===>,", params)
            let match = parseInt(params.year) ? {
                "year": params.year.toString()
            } : {};
            var pipeline = [];
            var pipelineTopBuys=[];
            if(params.table == "overview"){
                 pipeline = [
                    {
                        $match: match
                    },
                    {
                        $lookup:
                        {
                            from: "franchises",
                            localField: "franchise_id",
                            foreignField: "id",
                            as: "franchises"
                        }
                    },
                    {   $unwind:"$franchises" },
                    {
                        $addFields: {
                           "franchises.name":"$franchises.name", 
                           "franchises.budget_left":"$budget_left", 
                           "franchises.total_overseas_players":"$total_overseas_players", 
                           "franchises.total_players":{$add :[{"$toInt":"$total_indian_players"}, {"$toInt":"$total_overseas_players"}]}
                        }
                     },
                    {
                        $project :{
                           "franchises.name":1,
                           "franchises.budget_left":1,
                           "franchises.total_overseas_players":1,
                           "franchises.total_players":1,
                           "_id":0
                        }
                    },
                    {
                        $sort:{
                            "franchises.name":1,
                        }
                    }, 
                    {
                        $group:{
                            "_id": null, overview:{$push: "$franchises"}, 
                        }
                    },
                    {
                        $project:{
                            _id:0
                        }
                    },
                ]  

                pipelineTopBuys = [
                    {
                        $match: match
                    },
                    {
                        $lookup:
                        {
                            from: "franchises",
                            localField: "franchise_id",
                            foreignField: "id",
                            as: "franchises"
                        }
                    },
                    {   $unwind:"$franchises" },
                    {
                        $lookup:
                        {
                            from: "records",
                            localField: "id",
                            foreignField: "franchise_year_id",
                            as: "records"
                        }
                    },
                    {   $unwind:"$records" },
                    {
                        $lookup :{
                            from: "players",
                            localField: "records.player_id",
                            foreignField: "id",
                            as: "player"
                        }
                    },
                    {   $unwind:"$player" },
                    {
                        $addFields: {
                           "topBuys.team_name":"$franchises.name", 
                           "topBuys.player_name":"$player.name", 
                           "topBuys.speciality":"$records.speciality",
                           "topBuys.hammer_price":{"$toInt":"$records.hammer_price"}
                        }
                     },
                     {
                         $project : {
                             "topBuys":1,
                             _id:0
                         }
                     },
                    //  {"$toInt":"$total_indian_players"},
                     {
                         $sort:{
                            "topBuys.hammer_price":-1
                         }
                     },
                     { "$limit": 8 },
                     {
                         $group:{
                             _id:null,
                             topBuys:{$push: "$topBuys"}
                         }
                     },
                     {
                         $project:{
                             _id:0
                         }
                     }
                ]
            }else if(params.table == "to_be_auctioned"){
                return [];
            }else if(params.table == "sold_players"){
                console.log("abcccc")
                 pipeline = [
                    {
                        $match: match
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
                    {   $unwind:"$records" },
                    {   $match: {"records.status":"S"} },
                    {
                        $lookup : {
                            from:"franchises",
                            localField:"franchise_id",
                            foreignField:"id",
                            as:"franchises"
                        }
                    },
                    { $unwind : "$franchises"},
                    {
                        $lookup : {
                            from:"players",
                            localField:"records.player_id",
                            foreignField:"id",
                            as:"players"
                        }
                    },
                    { $unwind : "$players"},
                    {
                        $addFields : {
                            "sold_players.team_name":"$franchises.name",
                            "sold_players.abbreviation":"$franchises.abbreviation",
                            "sold_players.player_name":"$players.name",
                            "sold_players.speciality":"$records.speciality",
                            "sold_players.hammer_price":"$records.hammer_price",
                            
                        }
                    },
                    {
                        $project :{
                            "sold_players":1
                        }
                    },
                    {
                        $group:{
                            _id:"$sold_players.abbreviation",
                            soldPlayers: { $push: "$sold_players"}
                        }
                    },
                    {
                        $sort:{
                            _id:1
                        }
                    }
                 
                ]  
            }
            else if(params.table == "unsold_players"){

                pipeline = [
                    {
                        $match: match
                    },
                    {   $match: {"status":"U"} },
                    {
                        $lookup : {
                            from:"players",
                            localField:"player_id",
                            foreignField:"id",
                            as:"players"
                        }
                    },
                    { $unwind : "$players"},
                    
                    {
                        $addFields:{
                            "unsoldPlayers.player_name":"$players.name",
                            "unsoldPlayers.speciality":"$speciality",
                            "unsoldPlayers.reserve_price": {"$toInt":"$reserve_price"}
                        }
                    },
                    {
                        $project:{
                            "unsoldPlayers":1
                        }
                    },
                    {$sort:{
                        "unsoldPlayers.reserve_price":-1
                    }},
                    {
                        $group:{
                            _id:null,
                            unsoldPlayers:{$push: "$unsoldPlayers"}
                        }
                    },
                    {
                        $project:{
                            _id:0
                        }
                    }
                ]  
            }
            
            console.log(pipeline)
            //  console.log(franchise_years)
            
            if(params.table == "overview"){
                let overview = await (await franchise_years.aggregate(pipeline).toArray())
                let topBuys = await (await franchise_years.aggregate(pipelineTopBuys).toArray())
                return [overview[0],topBuys[0]]
            }else if(params.table == "sold_players"){
                let sold_players = await (await franchise_years.aggregate(pipeline).toArray())
                return sold_players
            }else if(params.table == "unsold_players"){
                let unsoldPlayers = await  records.aggregate(pipeline).toArray()
                return unsoldPlayers;
            }
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }

    static async processFrenchise(frenchises) {
        let returnData = [];
        if (frenchises.length > 0) {
            for (let i = 0; i <= frenchises.length - 1; i++) {
                var obj = frenchises[i];
                let won = [];
                // console.log(frenchises[i].franchises_name);
                var stringToUse = frenchises[i].fullName + " won"
                // console.log("stringToUse: ", stringToUse);
               
                var match = await matches.distinct("matchInfo.matchDate", { "matchInfo.description": "Final", "matchInfo.matchStatus.text": { $regex: new RegExp(stringToUse, "i") } });
                let years = ["2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"];
                for (let j = 0; j <= years.length - 1; j++) {
                    // console.log("in out iffifiif",typeof(match[j]))
                    for (let k = 0; k <= match.length - 1; k++) {
                        if (match[k].includes(years[j])) {
                            // console.log("in iffifiif",match[k])
                            //console.log("yes....",years[j]);
                            if (won.includes(years[j])) {
                                //console.log("do nothing");
                            } else {
                                won.push(years[j]);
                                //console.log("pushing");
                            }
                        } else {
                            // console.log("In else method...");
                        }

                    }


                }
                //console.log("+++++++++++++++++++++++++++++++++++++");
                obj.wonYears = won;

                //find frenchise logo
                let logo = await frenchisesData.findOne({name:frenchises[i].fullName},{logo:1,logo_medium:1,banner:1,primaryColor:1,secondaryColor:1});
                obj.logo=logo.logo;
                obj.logo_medium=logo.logo_medium;
                obj.primaryColor = logo.primaryColor;
                obj.secondaryColor = logo.secondaryColor;
                obj.slug = logo.slug;
                obj.venue = logo.venue;
                obj.roundSmall = logo.roundSmall;
                obj.roundBig = logo.roundBig;
                obj.logoOutline = logo.logoOutline;
                //console.log(" frenchises.wonYears us: ", frenchises.wonYears);
                returnData.push(obj);
                if (returnData.length == frenchises.length) {
                    // console.log("Final return");
                    return returnData;

                }
            }

        }
    }

}



