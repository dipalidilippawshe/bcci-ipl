
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

    //proccess data
    let page={list:[]}

    //allnews,announcements,matchreport, features nd interviews
    let all = await PagesDAO.getNews("Latest");
               
    if(all && all.length>0){
        let objd = {
            slug:"Latest",name:"Latest News",display_type:"news",contents:all,show_more:true
        }
        page.list.push(objd)
        
    }
    let announcements = await PagesDAO.getNews("announcements");
               
    if(announcements && announcements.length>0){
        let objd = {
            slug:"announcements",name:"Announcements",display_type:"news",contents:announcements,show_more:true
        }
        page.list.push(objd)
        
    }
    let match_reports = await PagesDAO.getNews("match-reports");
               
    if(match_reports && match_reports.length>0){
        let objd = {
            slug:"match-reports",name:"Match Reports",display_type:"news",contents:match_reports,show_more:true
        }
        page.list.push(objd)
        
    }
    let interviews = await PagesDAO.getNews("interviews");
               
    if(interviews && interviews.length>0){
        let objd = {
            slug:"interviews",name:"Interviews",display_type:"news",contents:announcements,show_more:true
        }
        page.list.push(objd)
        
    }
    let cms = await PagesDAO.getNews("pulse-cms");
               
    if(cms && cms.length>0){
        let objd = {
            slug:"more-news",name:"News",display_type:"news",contents:cms,show_more:true
        }
        page.list.push(objd) 
    }
    //var slug = "news-list-web";
    const pageFromDB = page
    //const pageFromDB = await PagesDAO.getPage(slug)
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


