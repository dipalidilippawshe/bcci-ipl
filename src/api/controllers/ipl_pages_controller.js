const iplDao = require('../../dao/ipl_pages_dao');
const config = require("config")
module.exports = class IplPagesController {
    static async homeIplPagesForWeb(req, res, next) {
        try {
            let slug = "home-web"
            const homeIplPages = await iplDao.homeIplPages(slug);
            console.log("In homeiPL pages me11: ",homeIplPages);
            // console.log("--------- controlllers .js----------------");
            // console.log(homeIplPages);
            if (homeIplPages) {
                console.log("In homeiPL pages me: ",homeIplPages);
                res.json({ status: true, data: homeIplPages })
                return
            }

            res.status(404).json({ status: false, error: config.error_codes["1001"] })

        } catch (e) {
            console.error(`Error  : ${e}`)
        }

    }
    static async homeIplPagesForApp(req, res, next) {
        try {
            let slug = "home-app"
            const homeIplPages = await iplDao.homeIplPages(slug);


            if (homeIplPages) {

                res.json({ status: true, data: homeIplPages })
                return
            }

            res.status(404).json({ status: false, error: config.error_codes["1001"] })

        } catch (e) {
            console.error(`Error  : ${e}`)
        }
    }
}