
const MenusDAO = require("../../dao/menus_dao")
const config = require("config")
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
        var slug = "home"
        const menuFromDB = await MenusDAO.getsposorsList()

        for(let i=0;i<=menuFromDB.length-1;i++){
            menuFromDB[i].group = menuFromDB[i].category;
            
        }

        if (!menuFromDB) {
            errors.general = "Internal error, please try again later"
        }
        else {
            res.send({ status: true, message: "Received pagedata", data: menuFromDB });
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
            res.send({ status: true, message: "Received data", data: menuFromDB });
        }

    }
    static async getAppStanding(req, res, next) {
        if(req.query.type){
            var type =req.query.type
        }else{
            type = "m"
        }
        const standings = await MenusDAO.getStadings(type,"app"); 
        if(!standings)
        {
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }
       
        res.status(200).json({status:true,data:standings});
    }
    static async getAppStanding(req, res, next) {
        if(req.query.type){
            var type =req.query.type
        }else{
            type = "m"
        }
        const standings = await MenusDAO.getStadings(type,"app"); 
        if(!standings)
        {
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }
       
        res.status(200).json({status:true,data:standings});
    }

    static async getWebStanding(req, res, next) {
        if(req.query.type){
            var type =req.query.type
        }else{
            type = "m"
        }
        const standings = await MenusDAO.getStadings(type,"web"); 
        if(!standings)
        {
            res.status(404).json({ status: false, error: config.error_codes["1001"] })
            return
        }
       
        res.status(200).json({status:true,data:standings});
    }


}
