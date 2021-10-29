const { ObjectId } = require("bson")

let iplArticles
const DEFAULT_SORT = [["date", -1]]

module.exports = class ArticlesDAO {
    static async injectDB(conn) {
        if (iplArticles) {
            return
        }
        try {
            iplArticles = await conn.db(process.env.BCCINS).collection("ipl_articles_latest")
            this.iplArticles = iplArticles;
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in articlesDAO: ${e}`,
            );
        }
    }




    /**
     * Finds and returns iplArticles matching a given text in their title or description.
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
     * Finds and returns iplArticles matching a one or more tags.
     * @param {string[]} tag - The tags to match with.
     * @returns {QueryParams} The QueryParams for tag search
     */
    static tagSearchQuery(tag) {
        const searchGenre = Array.isArray(tag) ? tag : tag.split(", ")
        const query = { "tags.label": { $in: searchGenre } }
        const project = {}
        const sort = DEFAULT_SORT

        return { query, project, sort }
    }

    /**
     *
     * @param {Object} filters - The search parameter to use in the query. Comes
     * in the form of `{cast: { $in: [...castMembers]}}`
     * @param {number} page - The page of iplArticles to retrieve.
     * @param {number} articlesPerPage - The number of iplArticles to display per page.
     * @returns {FacetedSearchReturn} FacetedSearchReturn
     */
    static async facetedSearch({
        filters = null,
        page = 0,
        articlesPerPage = 20,
    } = {}) {
        if (!filters || !filters.cast) {
            throw new Error("Must specify cast members to filter by.")
        }
        const matchStage = { $match: filters }
        const sortStage = { $sort: { "tomatoes.viewer.numReviews": -1 } }
        const countingPipeline = [matchStage, sortStage, { $count: "count" }]
        const skipStage = { $skip: articlesPerPage * page }
        const limitStage = { $limit: articlesPerPage }
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
                iplArticles: [
                    {
                        $addFields: {
                            title: "$title",
                        },
                    },
                ],
            },
        }


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
            const results = await (await iplArticles.aggregate(queryPipeline)).next()
            const count = await (await iplArticles.aggregate(countingPipeline)).next()
            return {
                ...results,
                ...count,
            }
        } catch (e) {
            return { error: "Results too large, be more restrictive in filter" }
        }
    }

    /**
     * Finds and returns iplArticles by country.
     * Returns a list of objects, each object contains a title and an _id.
     * @param {Object} filters - The search parameters to use in the query.
     * @param {number} page - The page of iplArticles to retrieve.
     * @param {number} articlesPerPage - The number of iplArticles to display per page.
     * @returns {GetArticlesResult} An object with video results and total results
     * that would match this query
     */
    static async getIplArticles({
        // here's where the default parameters are set for the getArticles method
        filters = null,
        page = 0,
        articlesPerPage = 20,
    } = {}) {
        var sort;
        let queryParams = { query: {} }
       
        if (filters.tag) {
            //filters logic to be added.
            queryParams.query["tags.label"] = { $in: [filters.tag] }
        }
        if(filters.tag=="all"){
            console.log("in all videos");
            queryParams = { query: {} };
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

        let { query = {}, project = {}} = queryParams
       // console.log(query)
       let pageLimit =articlesPerPage;
       pageLimit = filters.tag == "Latest"? 6 :articlesPerPage;
       
        let cursor
        if(!filters.sort){
            console.log("in not filters");
            sort = {"_id":-1}
        }
        
        try {
            cursor = await iplArticles
                .find(query)
                .project(project)
                .sort(sort)
                .limit(pageLimit)
                .skip(page * pageLimit)

        } catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return { articlesList: [], totalNumArticles: 0 }
        }


        const displayCursor = cursor.limit(pageLimit)

        try {
            const articlesList = await displayCursor.toArray()
            const totalNumArticles = await iplArticles.countDocuments(query) //page === 0 ? await iplArticles.countDocuments(query) : 0
            return { articlesList, totalNumArticles }
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`,
            )
            return { articlesList: [], totalNumArticles: 0 }
        }
    }

    /**
     * Gets a video by its id
     * @param {string} id - The desired video id, the _id in Mongo
     * @returns {MflixVideo | null} Returns either a single video or nothing
     */
    static async getIplArticleByID(id) {

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
            return await iplArticles.aggregate(pipeline).next()
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }

    static async getIplArticleByTeamId(type, page, id) {

        try {
            let pageLimit = 20;
            let skip = (page - 1) * pageLimit;

            let query = { $and: [{ 'references.id': { $eq: id } }, { "references.type": { $eq: type } }] };

            let total = await iplArticles.find(query).count();
            let data = await iplArticles.find(query).limit(pageLimit).skip(skip).toArray();

            return { data: data, total_results: total }

        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }
    static async getIplArticleByTeamsId(page, id,year) {

        try {
            let pageLimit = 20;
            let skip = (page - 1) * pageLimit;

            let query = { 'references.id': id };
            if(year){
                query = { 'references.id': id ,date: new RegExp(year, "i")};
                skip =0;
            }
            let total = await iplArticles.find(query).count();
            let data = await iplArticles.find(query).limit(pageLimit).skip(skip).toArray();

            return { data: data, total: total }

        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }
    static async getIplNewsByFilter(filters, page, limit = 20) {
        try {
            if (!filters.type) {
                filters.type = "Latest";
            }
            page = parseInt(page);
            var newsPerPage = limit;

            var skip = (page - 1) * newsPerPage;
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
            var cursor = await iplArticles.find(mongoquery).limit(newsPerPage).skip(skip);

            const displayCursor = cursor.limit(newsPerPage)
            const videoList = await displayCursor.toArray()

            //if (videoList && videoList.length > 0) {
            const totalNumIplVideos = await iplArticles.find(mongoquery).count();
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
}


