const PhotosDAO = require("../../dao/ipl_photos_dao")
const config = require("config")
module.exports = class PhotosController {
    static async apiAppGetPhotos(req, res, next) {
        if (!req.query.tag) {
            res.status(404).json({ status: false, error: config.error_codes["1002"] })
            return
        }
        const PHOTOS_PER_PAGE = 20
        let page
        try {
            page = req.query.page ? parseInt(req.query.page, 10) : "0"
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }
        const { imageList, totalNumImages } = await PhotosDAO.getPhotos({ filters: req.query, page, PHOTOS_PER_PAGE })

        let response = {
            status: true,
            message: "Images retrived successfully!!",
            images: imageList,
            page: page,
            filters: {},
            entries_per_page: PHOTOS_PER_PAGE,
            total_results: totalNumImages,
        }
        res.json(response)
    }

    static async apiWebGetPhotos(req, res, next) {
        if (!req.query.tag) {
            res.status(404).json({ status: false, error: config.error_codes["1002"] })
            return
        }
        const PHOTOS_PER_PAGE = 20
        let page
        try {
            page = req.query.page ? parseInt(req.query.page, 10) : "0"
        } catch (e) {
            console.error(`Got bad value for page:, ${e}`)
            page = 0
        }
        const { imageList, totalNumImages } = await PhotosDAO.getPhotos({ filters: req.query, page, PHOTOS_PER_PAGE })

        let response = {
            status: true,
            message: "Images retrived successfully!!",
            data: imageList,
            page: page,
            filters: {},
            entries_per_page: PHOTOS_PER_PAGE,
            total_results: totalNumImages,
        }
        res.json(response)
    }
    static async apiAppGetPhotoById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let video = await PhotosDAO.getPhotoByID(parseInt(id))
            if (!video) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, data: video })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiWebGetPhotoById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let video = await PhotosDAO.getPhotoByID(parseInt(id))
            if (!video) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, data: video })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }
    static async apiWebMatchImagesById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let matchImages = await PhotosDAO.getMatchImagesByID(parseInt(id))
            if (!matchImages) {
                res.status(404).json({ status :false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status :true, data: matchImages })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiAppMatchImagesById(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let matchImages = await PhotosDAO.getMatchImagesByID(parseInt(id))
            if (!matchImages) {
                res.status(404).json({ status :false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status :true, data: matchImages })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }
}