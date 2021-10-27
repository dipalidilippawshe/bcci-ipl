
const PagesDAO = require("../../dao/pages_dao")
const config = require("config")
module.exports = class PagesController {
  static async appHomepage(req, res, next) {
    console.log("At route me...");
    var slug = "home-app"
    const pageFromDB = await PagesDAO.getBcciPage(slug)
    
    if (!pageFromDB) {
      res.send({ status: false, message: "Error!" });
      // errors.general = "Internal error, please try again later"
    }
    else {
      for(let i=0;i<=pageFromDB.list.length-1;i++){
         pageFromDB.list[i].contents=pageFromDB.list[i].content_list;
         //delete pageFromDB.list[i].content_list;
      }
      //processPageData(pageFromDB, req, res, next);
      console.log("In page data here me;;;... ");
      res.send({ status: true, message: "Received pagedata", pageData: pageFromDB });
    }


  }

  static async webHomepage(req, res, next) {
    console.log("At route me...");
    var slug = "home-web"
    const pageFromDB = await PagesDAO.getBcciPage(slug)
    if (!pageFromDB) {
      res.send({ status: false, message: "Could not load data.", pageData: pageFromDB });
    }
    else {
      for(let i=0;i<=pageFromDB.list.length-1;i++){
        pageFromDB.list[i].contents=pageFromDB.list[i].content_list;
       
     }
      //processPageData(pageFromDB, req, res, next);
      console.log("In page data here me;;;... ");
      res.send({ status: true, message: "Received pagedata", pageData: pageFromDB });
    }


  }

  static async appVideoLIstpage(req, res, next) {
    console.log("At route me...");
    var slug = "video-list-app"
    const pageFromDB = await PagesDAO.getPage(slug)
    if (!pageFromDB) {
      res.send({ status: false, message: "Error!" });
      // errors.general = "Internal error, please try again later"
    }
    else {
      //processPageData(pageFromDB, req, res, next);
      console.log("In page data here me;;;... ");
      res.send({ status: true, message: "Received pagedata", pageData: pageFromDB });
    }


  }
  static async webVideoLIstpage(req, res, next) {

    var slug = "video-list-web";
    const pageFromDB = await PagesDAO.getPage(slug)
    if (!pageFromDB) {
      res.send({ status: false, message: "Error!" });
      // errors.general = "Internal error, please try again later"
    }
    else {
      //processPageData(pageFromDB, req, res, next);
      console.log("In page data here me;;;... ");
      res.send({ status: true, message: "Received pagedata", pageData: pageFromDB });
    }


  }
  static async appNewsLIstpage(req, res, next) {
    console.log("At route me...");
    var slug = "news-list-app"
    const pageFromDB = await PagesDAO.getPage(slug)
    if (!pageFromDB) {
      res.send({ status: false, message: "Error!" });
      // errors.general = "Internal error, please try again later"
    }
    else {
      //processPageData(pageFromDB, req, res, next);
      console.log("In page data here me;;;... ");
      res.send({ status: true, message: "Received pagedata", pageData: pageFromDB });
    }


  }
  static async webNewsLIstpage(req, res, next) {

    var slug = "news-list-web";
    const pageFromDB = await PagesDAO.getPage(slug)
    if (!pageFromDB) {
      res.send({ status: false, message: "Error!" });
      // errors.general = "Internal error, please try again later"
    }
    else {
      //processPageData(pageFromDB, req, res, next);
      console.log("In page data here me;;;... ");
      res.send({ status: true, message: "Received pagedata", pageData: pageFromDB });
    }


  }
}


