const { ObjectId } = require("bson")
let images
let mflix
module.exports = class PhotosDAO {
    static async injectDB(conn) {
        if (images) {
            return
        }
        try {
            mflix = await conn.db(process.env.BCCINS)
            images = await conn.db(process.env.BCCINS).collection("ipl_images")
            this.images = images // this is only for testing
        } catch (e) {
            console.error(`Unable to establish a collection handle in imagesDAO: ${e}`,)
        }
    }
    /**
    * Finds and returns videos by country.
    * Returns a list of objects, each object contains a title and an _id.
    * @param {Object} filters - The search parameters to use in the query.
    * @param {number} page - The page of videos to retrieve.
    * @param {number} photosPerPage - The number of videos to display per page.
    * @returns {GetVideosResult} An object with video results and total results
    * that would match this query
    */
    static async getPhotos({
        // here's where the default parameters are set for the getVideos method
        filters = null,
        page = 0,
        photosPerPage = 20,
    } = {}) {
        let queryParams = { query: {} }
        if (filters.tag) {
            //filters logic to be added.
            queryParams.query["tags.label"] = { $in: [filters.tag] }
        }
        if (filters.startDate && filters.endDate) {
            //filters logic to be added.
            queryParams.query["publishFrom"] = {
                $gte: filters.startDate.getTime(),
                $lte: filters.endDate.getTime()
            }
        }
        var sorting = { publishFrom: -1 }
        var projects = {
            photoCount: { $arrayElemAt: [{ $split: ["$title", " "] }, 0] },
            seasonTitle: { $concat: [{ $arrayElemAt: [{ $split: ["$title", " "] }, 1] }, " ", { $arrayElemAt: [{ $split: ["$title", " "] }, 2] }] },
            matchTitle: {
                $concat: [
                    {
                        $arrayElemAt: [{ $split: ["$title", " "] }, 3]
                    },
                    " ",
                    {
                        $arrayElemAt: [{ $split: ["$title", " "] }, 4]
                    },
                    " ",
                    {
                        $arrayElemAt: [{ $split: ["$title", " "] }, 5]
                    },
                    " ",
                    {
                        $arrayElemAt: [{ $split: ["$title", " "] }, 6]
                    },
                    " ",
                    {
                        $arrayElemAt: [{ $split: ["$title", " "] }, 7]
                    }
                ]
            },
            "_id": 1,
            "type": 1,
            "titleTranslations": 1,
            "copyright": 1,
            "metadata": 1,
            "additionalInfo": 1,
            "id": 1,
            "coordinates": 1,
            "publishTo": 1,
            "description": 1,
            "language": 1,
            "commentsOn": 1,
            "lastModified": 1,
            "accountId": 15,
            "subtitle": 1,
            "platform": 1,
            "canonicalUrl": 1,
            "references": 1,
            "originalDetails": 1,
            "related": 1,
            "location": 1,
            "imageUrl": 1,
            "tags": 1,
            "titleUrlSegment": 1,
            "onDemandUrl": 1,
            "date": 1,
            "title": 1,
            "publishFrom": 1
        }
        if (filters.tag != "matches") {
            // projects = {}
        }
        let { query = {}, project = projects, sort = sorting } = queryParams
        console.log(query)
        let cursor
        try {
            cursor = await images.find(query)
                .project(project)
                .sort(sort)
                .limit(photosPerPage)
                .skip(page * photosPerPage)

        } catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return { imageList: [], totalNumImages: 0 }
        }


        const displayCursor = cursor.limit(photosPerPage)

        try {
            const imageList = await displayCursor.toArray()

            const totalNumImages = page === 0 ? await images.countDocuments(query) : 0
            console.log("totalNumImages is: ", totalNumImages);
            return { imageList, totalNumImages }
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`,
            )
            return { imageList: [], totalNumImages: 0 }
        }
    }

    static async getPhotoByID(id) {
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
            return await images.aggregate(pipeline).next()
        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getPhotosByID: ${e}`)
            throw e
        }
    }
    static async getMatchImagesByID(id) {
        try {

            return await images.find({ $and: [{ 'references.id': id }, { 'references.type': "CRICKET_MATCH" }] }).toArray();

        } catch (e) {
            if (e.toString().startsWith("Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
                return null
            }
            console.error(`Something went wrong in getVideoByID: ${e}`)
            throw e
        }
    }

}