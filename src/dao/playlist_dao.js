const { ObjectId } = require("bson")

let videos

const DEFAULT_SORT = [["tomatoes.viewer.numReviews", -1]]

module.exports = class IplVideosDAO {
    static async injectDB(conn) {
        if (videos) {
            return
        }
        try {
            videos = await conn.db(process.env.BCCINS).collection("playlist_copy")
            this.videos = videos // this is only for testing
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

    /**
     * Gets video by type
     * @param {String} type 
     * @returns 
     */
    static async getPlaylistsByFilter(type, page) {
        try {
            if (!type) {
               return "error";
            }
            page = parseInt(page);
            var videosPerPage = 20;

            var skip = (page - 1) * videosPerPage;
            const mongoquery = { "content_type": type } ;

            //page logic here..
            var cursor = await videos.find(mongoquery).limit(videosPerPage).skip(skip);

            const displayCursor = cursor.limit(videosPerPage)
            const videoList = await displayCursor.toArray()

            if (videoList && videoList.length > 0) {
                const totalNumIplVideos = await videos.find(mongoquery).count();
                let res = { list: videoList, total: totalNumIplVideos };
                return res;

            } else {
                return ({ success: false, data: null });
            }

        } catch (e) {
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }
   

}

/**
 * This is a parsed query, sort, and project bundle.
 * @typedef QueryParams
 * @property {Object} query - The specified query, transformed accordingly
 * @property {any[]} sort - The specified sort
 * @property {Object} project - The specified project, if any
 */

/**
 * Represents a single country result
 * @typedef CountryResult
 * @property {string} ObjectID - The ObjectID of the video
 * @property {string} title - The title of the video
 */

/**
 * A Video from mflix
 * @typedef MflixVideo
 * @property {string} _id
 * @property {string} title
 * @property {number} year
 * @property {number} runtime
 * @property {Date} released
 * @property {string[]} cast
 * @property {number} metacriticd
 * @property {string} poster
 * @property {string} plot
 * @property {string} fullplot
 * @property {string|Date} lastupdated
 * @property {string} type
 * @property {string[]} languages
 * @property {string[]} directors
 * @property {string[]} writers
 * @property {IMDB} imdb
 * @property {string[]} countries
 * @property {string[]} rated
 * @property {string[]} genres
 * @property {string[]} comments
 */

/**
 * IMDB subdocument
 * @typedef IMDB
 * @property {number} rating
 * @property {number} votes
 * @property {number} id
 */

/**
 * Result set for getIplVideos method
 * @typedef GetIplVideosResult
 * @property {MflixIplVideos[]} videosList
 * @property {number} totalNumResults
 */

/**
 * Faceted Search Return
 *
 * The type of return from faceted search. It will be a single document with
 * 3 fields: rating, runtime, and videos.
 * @typedef FacetedSearchReturn
 * @property {object} rating
 * @property {object} runtime
 * @property {MFlixVideo[]}videos
 */
