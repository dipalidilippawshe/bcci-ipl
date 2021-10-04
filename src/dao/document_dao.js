const { ObjectId } = require("bson")

let document
const DEFAULT_SORT = [["date", -1]]

module.exports = class DocumentDAO {
    static async injectDB(conn) {
        if (document) {
            return
        }
        try {
            document = await conn.db(process.env.BCCINS).collection("documents")
            this.document = document // this is only for testing
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in documentDAO: ${e}`,
            )
        }
    }



    /**
     * Gets a video by its id
     * @param {string} id - The desired video id, the _id in Mongo
     * @returns {MflixVideo | null} Returns either a single video or nothing
     */
    static async getDocumentByID(id) {
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
            return await document.aggregate(pipeline).next()
        } catch (e) {

            console.error(`Unable to establish a collection handle in Document DAO: ${e}`)
        }
    }
}


