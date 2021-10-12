const { ObjectId } = require("bson")

let franchise_years
let matches
let frenchisesData
let promos
let mflix
const DEFAULT_SORT = [["tomatoes.viewer.numReviews", -1]]

module.exports = class IplRecordsDAO {
    static async injectDB(conn) {

        try {
            franchise_years = await conn.db(process.env.BCCINS).collection("franchise_years")
            matches = await conn.db(process.env.BCCINS).collection("ipl_matches");
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
            let match = parseInt(params.year) ? {
                "year": params.year.toString()
            } : {};
            const pipeline = [
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
                {
                    $lookup:
                    {
                        from: "franchises",
                        localField: "franchise_id",
                        foreignField: "id",
                        as: "franchises"
                    }
                },
                {
                    $addFields: {
                        "franchises_name": { $first: "$franchises.name" },
                        "franchises_abbreviation": { $first: "$franchises.abbreviation" },
                        "franchises_owner": { $first: "$franchises.owner" },
                        "franchises_venue": { $first: "$franchises.venue" },
                        "franchises_coach": { $first: "$franchises.coach" },
                        "franchises_captain": { $first: "$franchises.captain" },
                        "franchises_logo": { $first: "$franchises.logo" },
                        "franchises_social": { $first: "$franchises.social" },
                        "franchises_is_playing": { $first: "$franchises.is_playing" },
                        // "speciality": { $first: "$records.speciality" },
                        // "reserve_price": { $first: "$records.reserve_price" },
                        // "status": { $first: "$records.status" },
                        // "hammer_price": { $first: "$records.hammer_price" },
                        // "marquee_player": { $first: "$records.marquee_player" },
                        // "player_id": { $first: "$records.player_id" },
                    }
                },
                {
                    $lookup:
                    {
                        from: "players",
                        localField: "records.player_id",
                        foreignField: "id",
                        as: "players"
                    }
                },
                {
                    $project: {
                        "franchises": 0
                    }
                }

            ]
            console.log(pipeline)
            //  console.log(franchise_years)
            let frenchises = await franchise_years.aggregate(pipeline).toArray()
            // let data = this.processFrenchise(frenchises);
            return frenchises;
            //  return await franchise_years.aggregate(pipeline).toArray()
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
                let logo = await frenchisesData.findOne({name:frenchises[i].fullName},{logo:1,logo_medium:1});
                obj.logo=logo.logo;
                obj.logo_medium=logo.logo_medium;

               

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



