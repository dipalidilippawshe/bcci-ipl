
const MenusDAO = require("../../dao/menus_dao")

module.exports = class PagesController {
    static async webMenus(req, res, next) {
        console.log("At route me...");
        var slug="home"
        const menuFromDB = await MenusDAO.getMenu()
        if (!menuFromDB) {
          errors.general = "Internal error, please try again later"
        }
        else{
            //processPageData(pageFromDB, req, res, next);
            console.log("In page data here me;;;... ");
            res.send({status:true, message:"Received pagedata" ,Data : menuFromDB});
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
}
