

const BiosDAO = require("../../dao/bios_dao")

module.exports = class BiosController {

    static async apiAppGetBioById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let bio = await BiosDAO.getBiosByID(parseInt(id))
            if (!bio) {
                res.status(404).json({ success: false, error: "Not found" })
                return
            }
            res.json({ success: true, data: bio })
        } catch (e) {
         
            res.status(500).json({ error: e })
        }
    }

    static async apiWebGetBioById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let bio = await BiosDAO.getBiosByID(parseInt(id));
            if (!bio) {
                res.status(404).json({ success: false, error: "Not found" });
                return
            }
            res.json({ success: true, data: bio });
        } catch (e) {
            res.status(500).json({ error: e });
          
        }
    }


}
