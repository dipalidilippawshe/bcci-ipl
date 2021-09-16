const promoDao = require('../../dao/promos_dao')
module.exports = class PromosController {
    static async apiAppGetPromoById(req, res, next) {
        try {
            const id = req.params.id ? req.params.id : "0";
            const promo = await promoDao.getPromoById(parseInt(id));
            if (!promo) {
                res.status(404).json({ success: false, data: `Id = ${id} not found ` })
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
                res.status(404).json({ success: false, data: `id ${id} not found` })
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