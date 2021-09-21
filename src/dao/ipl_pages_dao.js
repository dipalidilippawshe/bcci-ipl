let iplPages;
module.exports = class IplPagesDAO {
    static async injectDB(con) {
        try {
            iplPages = await con.db(process.env.BCCINS).collection('ipl-pages')
        }
        catch (e) {
            console.error(`Unable to establish collection handles in pagesDAO: ${e}`)
        }

    }
    static async homeIplPages() {
        try {

            return await iplPages.find({ slug: 'home' }).limit(1).skip(1).toArray();

        }
        catch (e) {

            console.log(` Error : ${e}`)

        }
    }

}