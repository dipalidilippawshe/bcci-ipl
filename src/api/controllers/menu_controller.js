
const MenusDAO = require("../../dao/menus_dao")

module.exports = class PagesController {
    static async webMenus(req, res, next) {
        console.log("At route me...");
        var slug = "ipl-web"
        const menuFromDB = await MenusDAO.getMenu(slug)
        if (!menuFromDB) {
            errors.general = "Internal error, please try again later"
        }
        else {
            //processPageData(pageFromDB, req, res, next);
            console.log("In page data here me;;;... ");
            res.send({ status: true, message: "Received pagedata", Data: menuFromDB });
        }

    }

    static async webSponsors(req, res, next) {
        console.log("At route me...");
        var slug="home"
        const menuFromDB = await MenusDAO.getsposorsList()
        if (!menuFromDB) {
          errors.general = "Internal error, please try again later"
        }
        else{
            //processPageData(pageFromDB, req, res, next);
            console.log("In page data here me;;;... ");
            res.send({status:true, message:"Received pagedata" ,Data : menuFromDB});
        }
             
    }
    static async appMenus(req, res, next) {
        console.log("At route me...");
        var slug = "ipl-app"
        const menuFromDB = await MenusDAO.getMenu(slug)
        if (!menuFromDB) {
            errors.general = "Internal error, please try again later"
        }
        else {
            //processPageData(pageFromDB, req, res, next);
            console.log("In page data here me;;;... ");
            res.send({ status: true, message: "Received pagedata", Data: menuFromDB });
        }

    }
    static async getStanding(req,res,next)
    {

        const standings = await MenusDAO.getStadings(); 
        res.status(200).json({data:standings});
    }


}
