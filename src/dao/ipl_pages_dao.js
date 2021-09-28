let iplPages;
module.exports = class IplPagesDAO {
    static async injectDB(con) {
        try {
            iplPages = await con.db(process.env.BCCINS).collection('ipl_pages')
        }
        catch (e) {
            console.error(`Unable to establish collection handles in pagesDAO: ${e}`)
        }

    }
    static async homeIplPages(slug) {
        try {
            console.log("slug is: ", slug);
            var page = iplPages.findOne({ slug: slug });
            return page;
            // return await iplPages.find({ slug: slug }).limit(1).skip(1).toArray();

        }
        catch (e) {

            console.log(` Error : ${e}`)

        }
    }


}