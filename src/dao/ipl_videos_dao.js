const { ObjectId } = require("bson")

let videos
let promos
let playtracks
let mflix
const DEFAULT_SORT = [["tomatoes.viewer.numReviews", -1]]

module.exports = class IplVideosDAO {
    static async injectDB(conn) {
        if (videos) {
            return
        }
        try {
            mflix = await conn.db(process.env.BCCINS)
            videos = await conn.db(process.env.BCCINS).collection("ipl_videos")
            playtracks = await conn.db(process.env.BCCINS).collection("playtrackings")
            this.videos = videos // this is only for testing
            this.playtracks = playtracks 
            //this.promos = promos
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in videosDAO: ${e}`,
            )
        }
    }



    /**
     * Finds and returns videos originating from one or more countries.
     * Returns a list of objects, each object contains a title and an _id.
     * @param {string[]} countries - The list of countries.
     * @returns {Promise<CountryResult>} A promise that will resolve to a list of CountryResults.
     */
    static async getIplVideosByCountry(countries) {
        /**
        Ticket: Projection
    
        Write a query that matches videos with the countries in the "countries"
        list, but only returns the title and _id of each video.
    
        Remember that in MongoDB, the $in operator can be used with a list to
        match one or more values of a specific field.
        */

        let cursor
        try {
            // TODO Ticket: Projection
            // Find videos matching the "countries" list, but only return the title
            // and _id. Do not put a limit in your own implementation, the limit
            // here is only included to avoid sending 46000 documents down the
            // wire.
            cursor = await videos.find({ countries: { $in: countries } }).project({ title: 1 })
        } catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return []
        }

        return cursor.toArray()
    }

    /**
     * Finds and returns videos matching a given text in their title or description.
     * @param {string} text - The text to match with.
     * @returns {QueryParams} The QueryParams for text search
     */
    static textSearchQuery(text) {
        const query = { $text: { $search: text } }
        const meta_score = { $meta: "textScore" }
        const sort = [["score", meta_score]]
        const project = { score: meta_score }

        return { query, project, sort }
    }

    /**
     * Finds and returns videos including one or more cast members.
     * @param {string[]} cast - The cast members to match with.
     * @returns {QueryParams} The QueryParams for cast search
     */
    static castSearchQuery(cast) {
        const searchCast = Array.isArray(cast) ? cast : cast.split(", ")

        const query = { cast: { $in: searchCast } }
        const project = {}
        const sort = DEFAULT_SORT

        return { query, project, sort }
    }

    /**
     * Finds and returns videos matching a one or more genres.
     * @param {string[]} genre - The genres to match with.
     * @returns {QueryParams} The QueryParams for genre search
     */
    static genreSearchQuery(genre) {
        /**
        Ticket: Text and Subfield Search
    
        Given an array of one or more genres, construct a query that searches
        MongoDB for videos with that genre.
        */

        const searchGenre = Array.isArray(genre) ? genre : genre.split(", ")

        // TODO Ticket: Text and Subfield Search
        // Construct a query that will search for the chosen genre.
        const query = { genres: { $in: searchGenre } }
        const project = {}
        const sort = DEFAULT_SORT

        return { query, project, sort }
    }

    /**
     *
     * @param {Object} filters - The search parameter to use in the query. Comes
     * in the form of `{cast: { $in: [...castMembers]}}`
     * @param {number} page - The page of videos to retrieve.
     * @param {number} videosPerPage - The number of videos to display per page.
     * @returns {FacetedSearchReturn} FacetedSearchReturn
     */
    static async facetedSearch({
        filters = null,
        page = 0,
        videosPerPage = 20,
    } = {}) {
        if (!filters || !filters.cast) {
            throw new Error("Must specify cast members to filter by.")
        }
        const matchStage = { $match: filters }
        const sortStage = { $sort: { "tomatoes.viewer.numReviews": -1 } }
        const countingPipeline = [matchStage, sortStage, { $count: "count" }]
        const skipStage = { $skip: videosPerPage * page }
        const limitStage = { $limit: videosPerPage }
        const facetStage = {
            $facet: {
                runtime: [
                    {
                        $bucket: {
                            groupBy: "$runtime",
                            boundaries: [0, 60, 90, 120, 180],
                            default: "other",
                            output: {
                                count: { $sum: 1 },
                            },
                        },
                    },
                ],
                rating: [
                    {
                        $bucket: {
                            groupBy: "$metacritic",
                            boundaries: [0, 50, 70, 90, 100],
                            default: "other",
                            output: {
                                count: { $sum: 1 },
                            },
                        },
                    },
                ],
                videos: [
                    {
                        $addFields: {
                            title: "$title",
                        },
                    },
                ],
            },
        }

        /**
        Ticket: Faceted Search
    
        Please append the skipStage, limitStage, and facetStage to the queryPipeline
        (in that order). You can accomplish this by adding the stages directly to
        the queryPipeline.
    
        The queryPipeline is a Javascript array, so you can use push() or concat()
        to complete this task, but you might have to do something about `const`.
        */

        const queryPipeline = [
            matchStage,
            sortStage,
            // TODO Ticket: Faceted Search
            skipStage,
            limitStage,
            facetStage

            // Add the stages to queryPipeline in the correct order.
        ]

        try {
            const results = await (await videos.aggregate(queryPipeline)).next()
            const count = await (await videos.aggregate(countingPipeline)).next()
            return {
                ...results,
                ...count,
            }
        } catch (e) {
            return { error: "Results too large, be more restrictive in filter" }
        }
    }

    /**
     * Finds and returns videos by country.
     * Returns a list of objects, each object contains a title and an _id.
     * @param {Object} filters - The search parameters to use in the query.
     * @param {number} page - The page of videos to retrieve.
     * @param {number} videosPerPage - The number of videos to display per page.
     * @returns {GetIplVideosResult} An object with video results and total results
     * that would match this query
     */
    static async getIplVideos({
        // here's where the default parameters are set for the getIplVideos method
        filters = null,
        page = 0,
        videosPerPage = 20,
    } = {}) {
        let queryParams = {}
        if (filters) {
            if ("text" in filters) {
                queryParams = this.textSearchQuery(filters["text"])
            } else if ("cast" in filters) {
                queryParams = this.castSearchQuery(filters["cast"])
            } else if ("genre" in filters) {
                queryParams = this.genreSearchQuery(filters["genre"])
            }
        }
        var sorting = { _id: -1 }
        let { query = {}, project = {}, sort = sorting } = queryParams

        let cursor
        try {
            cursor = await videos
                .find(query)
                .project(project)
                .sort(sort)
                .limit(videosPerPage)
                .skip(page * videosPerPage)

        } catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return { videosList: [], totalNumIplVideos: 0 }
        }

        /**
        Ticket: Paging
    
        Before this method returns back to the API, use the "videosPerPage" and
        "page" arguments to decide the videos to display.
    
        Paging can be implemented by using the skip() and limit() cursor methods.
        */

        // TODO Ticket: Paging
        // Use the cursor to only return the videos that belong on the current page
        const displayCursor = cursor.limit(videosPerPage)

        try {
            const videosList = await displayCursor.toArray()
            const totalNumIplVideos = page === 0 ? await videos.countDocuments(query) : 0

            return { videosList, totalNumIplVideos }
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`,
            )
            return { videosList: [], totalNumIplVideos: 0 }
        }
    }

    /**
     * Gets video by type
     * @param {String} type 
     * @returns 
     */
    static async getIplVideosByFilter(filters, page, limit = 20) {
        try {
            if (!filters.type) {
                filters.type = "latest";
            }
            page = parseInt(page);
            var videosPerPage = limit;

            var skip = (page - 1) * videosPerPage;
            const mongoquery = { "tags.label": { $regex: new RegExp(filters.type, "i") } };
            if (filters.match_id) {
                mongoquery["references.id"] = { $eq: parseInt(filters.match_id) }
                mongoquery["references.type"] = { $eq: "CRICKET_MATCH" }

            }
            if (filters.player_id) {
                mongoquery["references.id"] = { $eq: parseInt(filters.player_id) }
                mongoquery["references.type"] = { $eq: "CRICKET_PLAYER" }
            }
            if (filters.team_id) {
                mongoquery["references.id"] = { $eq: parseInt(filters.team_id) }
                mongoquery["references.type"] = { $eq: "CRICKET_TEAM" }
            }
            if (filters.season_id) {
                mongoquery["references.id"] = { $eq: parseInt(filters.season_id) }
                mongoquery["references.type"] = { $eq: "CRICKET_TOURNAMENT" }
            }

            //page logic here..
            console.log("final qu", mongoquery)
            var cursor = await videos.find(mongoquery).limit(videosPerPage).skip(skip);

            const displayCursor = cursor.limit(videosPerPage)
            const videoList = await displayCursor.toArray()

            //if (videoList && videoList.length > 0) {
            const totalNumIplVideos = await videos.find(mongoquery).count();
            let res = { list: videoList, total: totalNumIplVideos };
            return res;

            // } else {
            //     return ({ status: false, data: null });
            // }

        } catch (e) {
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }
    /**
     * Gets a video by its id
     * @param {string} id - The desired video id, the _id in Mongo
     * @returns {MflixVideo | null} Returns either a single video or nothing
     */

    static async getVideoByID(id) {
        console.log("ID here is : ", id);
        try {

            const pipeline = [
                {
                    $match: {
                        // _id: ObjectId(id)
                        id: id
                    }
                }
            ]
            console.log(pipeline)
            return await videos.aggregate(pipeline).next()
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }

    static async updateRecord() {
        let cursor;
        cursor = await videos.find({});


    }

    //promos
    static async getPromos({
        // here's where the default parameters are set for the getIplVideos method
        filters = null,
        page = 0,
        videosPerPage = 20,
    } = {}) {
        console.log("In dao class");
        let queryParams = {}
        if (filters) {
            if ("text" in filters) {
                queryParams = this.textSearchQuery(filters["text"])
            } else if ("cast" in filters) {
                queryParams = this.castSearchQuery(filters["cast"])
            } else if ("genre" in filters) {
                queryParams = this.genreSearchQuery(filters["genre"])
            }
        }
        var sorting = { _id: -1 }
        let { query = {}, project = {}, sort = sorting } = queryParams

        let cursor
        try {
            cursor = await promos
                .find(query)
                .project(project)
                .sort(sort)
                .limit(videosPerPage)
                .skip(page * videosPerPage)

        } catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return { videosList: [], totalNumIplVideos: 0 }
        }


        const displayCursor = cursor.limit(videosPerPage)

        try {
            const videosList = await displayCursor.toArray()
            const totalNumIplVideos = page === 0 ? await videos.countDocuments(query) : 0

            return { videosList, totalNumIplVideos }
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`,
            )
            return { videosList: [], totalNumIplVideos: 0 }
        }
    }

    static async getPromoByID(id) {
        try {

            const pipeline = [
                {
                    $match: {
                        // _id: ObjectId(id)
                        ID: id
                    }
                }
            ]
            console.log(pipeline)
            return await promos.aggregate(pipeline).next()
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }

    static async videoByMatchID(id,page) {
        
        let pageLimit = 20;
        let skip = (page-1)*20;
        try {
            console.log("In video by match ID me");
            // const pipeline = [
            //     {
            //         $match: {
            //             "references.sid": id
            //         }
            //     }
            // ]
            // console.dir(pipeline, { depth: null, color: true })
            //  console.log(franchise_years)
            let total = await videos.find({'references.sid':id.toString()}).count();
            let data = await videos.find({'references.sid':id.toString()}).limit(pageLimit).skip(skip).toArray();
            
            return {data:data,total:total};
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }
    static async videoByTeamID(id, page,year) {
        try {

            let pageLimit = 20;
            let skip = (page - 1) * pageLimit;
            let query = { "references.id": id }
            if(year){
                query = { "references.id": id,date: new RegExp(year, "i") }
            }
            let total = await videos.find(query).count();
           
            let data = await videos.find(query).limit(pageLimit).skip(skip).toArray();
            return { data: data, total: total };

        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }

    static async getVideos({
        // here's where the default parameters are set for the getVideos method
        filters = null,
        page = 0,
        videosPerPage = 20,
    } = {}) {
        let queryParams = { query: {} }
        if (filters.tag) {
            //filters logic to be added.
            queryParams.query["tags.label"] = { $in: [filters.tag] }
        }
        // if (filters.year) {
        //     //filters logic to be added.
        //     queryParams.query["date"] = new RegExp(filters.year, "i")
        // }
        if (filters.startDate && filters.endDate) {
            //filters logic to be added.
            queryParams.query["publishFrom"] = {
                $gte: filters.startDate.getTime(),
                $lte: filters.endDate.getTime()
            }
        }
        var sorting = { _id: -1 }
        let { query = {}, project = {}, sort = sorting } = queryParams
        console.log(query)
        let cursor
        try {
            cursor = await videos.find(query)
                .project(project)
                .sort(sort)
                .limit(videosPerPage)
                .skip(page * videosPerPage)

        } catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return { videoList: [], totalNumImages: 0 }
        }


        const displayCursor = cursor.limit(videosPerPage)

        try {
            const videoList = await displayCursor.toArray()

            const totalNumImages = page === 0 ? await videos.countDocuments(query) : 0
            console.log("totalNumImages is: ", totalNumImages);
            return { videoList, totalNumImages }
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`,
            )
            return { videoList: [], totalNumImages: 0 }
        }
    }

    static async setPlayTracks(data){
        var playtrackObject = data;
        try{
            const doc = await playtracks.insertOne(playtrackObject);
            return doc;
            
        }catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`,
            )
            return { error:e}
        }
    }

    static async getRelatedVideos(titles){
        let limit = 20;
        let queryParams = { query: {"tags.label":{$in: titles}} };
        let cursor;  let cursor1;  let cursor2;
        try {
            cursor = await videos.find({"tags.label":{$in: titles}})
            cursor1 = await videos.find({"tags.label":"wicket"})
            cursor2 = await videos.find({"tags.label":"super-sixes"})    

        } catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return { videoList: []}
        }
        const displayCursor = cursor.limit(limit)
        const displayCursor1 = cursor1.limit(limit)
        const displayCursor2 = cursor2.limit(limit)

        try {
            const videoList = await displayCursor.toArray()
            const wicketList = await displayCursor.toArray()
            const sixesList = await displayCursor.toArray()
            return {videoList:videoList, wicketList:wicketList,sixes:sixesList}
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`,
            )
            return e
        }
    }
    

}

