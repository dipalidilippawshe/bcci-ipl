const { Router } = require("express")
const DocumentCtrl = require("../controllers/document_controller")

const router = new Router()

router.get("/app/detail/:ID", DocumentCtrl.apiAppGetDocumentById)

router.get("/web/detail/:ID", DocumentCtrl.apiWebGetDocumentById)



module.exports = router
