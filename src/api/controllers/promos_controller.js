const promoDao = require('../../dao/promos_dao')
const config = require("config")
module.exports = class PromosController {
    static async apiAppGetPromoById(req, res, next) {
        try {
            const id = req.params.id ? req.params.id : "0";
            const promo = await promoDao.getPromoById(parseInt(id));
            if (!promo) {
                res.status(404).json({ success: false, error: config.error_codes["1001"] })
            }
            else {
                res.status(200).json({ success: true, data: promo })
            }

        }
        catch (e) {
            res.status(500).json({ error: e })
        }
    }
    static async apiWebGetPromoById(req, res, next) {
        try {
            const id = req.params.id ? req.params.id : "0";
            const promo = await promoDao.getPromoById(parseInt(id));
            if (!promo) {
                res.status(404).json({ success: false, error: config.error_codes["1001"] })
            }
            else {
                res.status(200).json({ success: true, data: promo })
            }

        }
        catch (e) {
            res.status(500).json({ error: e })
        }

    }
}