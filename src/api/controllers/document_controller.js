

const DocumentDAO = require("../../dao/document_dao")
const config = require("config")

module.exports = class DocumentController {

    static async apiAppGetDocumentById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let document = await DocumentDAO.getDocumentByID(parseInt(id))
            if (!document) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, data: document })
        } catch (e) {

            res.status(500).json({ error: e })
        }
    }

    static async apiWebGetDocumentById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let document = await DocumentDAO.getDocumentByID(parseInt(id));
            if (!document) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] });
                return
            }
            res.json({ status: true, data: document });
        } catch (e) {
            res.status(500).json({ error: e });

        }
    }


}
