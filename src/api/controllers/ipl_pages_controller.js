const iplDao = require('../../dao/ipl_pages_dao');
const config = require("config")
module.exports = class IplPagesController {
    static async homeIplPagesForWeb(req, res, next) {
        try {
            let slug = "home-web"
            const homeIplPages = await iplDao.homeIplPages(slug);
            // console.log("--------- controlllers .js----------------");
            // console.log(homeIplPages);
            if (homeIplPages) {

                res.json({ success: true, data: homeIplPages })
                return
            }

            res.status(404).json({ success: false, error: config.error_codes["1001"] })

        } catch (e) {
            console.error(`Error  : ${e}`)
        }

    }
    static async homeIplPagesForApp(req, res, next) {
        try {
            let slug = "home-app"
            const homeIplPages = await iplDao.homeIplPages(slug);


            if (homeIplPages) {

                res.json({ success: true, data: homeIplPages })
                return
            }

            res.status(404).json({ success: false, error: config.error_codes["1001"] })

        } catch (e) {
            console.error(`Error  : ${e}`)
        }
    }
}