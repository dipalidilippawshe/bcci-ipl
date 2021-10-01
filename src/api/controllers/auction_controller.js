

const AuctionDAO = require("../../dao/auction_dao")
const config = require("config")
const PhotosDAO = require("../../dao/ipl_photos_dao")
const IplVideosDAO = require("../../dao/ipl_videos_dao")
const IplArticlesDAO = require("../../dao/ipl_articles_dao")
const FranchiseYearsDAO = require("../../dao/ipl_franchise_years_dao")


module.exports = class AuctionController {

    static async apiAppGetAuction(req, res, next) {
        try {
            let id = req.params.ID && parseInt(req.params.ID) || "0"
            let bio = await BiosDAO.getBiosByID(parseInt(id))
            if (!bio) {
                res.status(404).json({ status: false, error: config.error_codes["1001"] })
                return
            }
            res.json({ status: true, data: bio })
        } catch (e) {

            res.status(500).json({ error: e })
        }
    }
    static async apiWebGetAuction(req, res, next) {
        try {
            let page = 1
            let limit = 5
            let year = req.params.year && parseInt(req.params.year) || new Date().getFullYear()
            let startDate = new Date(year, 0, 1);
            let endDate = new Date(year, 11, 31);
            let filters = { year, startDate, endDate, tag: "auction" }
            let image = await PhotosDAO.getPhotos({ filters, page, limit })
            let video = await IplVideosDAO.getVideos({ filters, page, limit })
            let articles = await IplArticlesDAO.getIplArticles({ filters, page, limit })
            let auctionData = await FranchiseYearsDAO.getAuctionDetails(filters)

            // console.log(articles)
            // let data = {
            //     realted_videos: video.videoList,
            //     realted_images: image.imageList,
            //     realted_articles: articles.articlesList
            // }
            res.json({ status: true, data: auctionData })
        } catch (e) {

            res.status(500).json({ error: e })
        }
    }

}
