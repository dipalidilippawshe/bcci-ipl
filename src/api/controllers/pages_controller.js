
const PagesDAO = require("../../dao/pages_dao")

module.exports = class PagesController {
  static async appHomepage(req, res, next) {
    console.log("At route me...");
    var slug = "home-app"
    const pageFromDB = await PagesDAO.getPage(slug)
    if (!pageFromDB) {
      errors.general = "Internal error, please try again later"
    }
    else {
      //processPageData(pageFromDB, req, res, next);
      console.log("In page data here me;;;... ");
      res.send({ status: true, message: "Received pagedata", pageData: pageFromDB });
    }


  }

  static async webHomepage(req, res, next) {
    console.log("At route me...");
    var slug = "home"
    const pageFromDB = await PagesDAO.getPage(slug)
    if (!pageFromDB) {
      errors.general = "Internal error, please try again later"
    }
    else {
      //processPageData(pageFromDB, req, res, next);
      console.log("In page data here me;;;... ");
      res.send({ status: true, message: "Received pagedata", pageData: pageFromDB });
    }


  }
}

async function processPageData(doc, err, pageName, displayName, user_id, session_id, skip, req, res, next, reg_query, isPremium = '', kids_content) {
  var pagedata = {};
  pagedata.name = doc.name;
  pagedata.slug = doc.slug;
  pagedata.asset_type = doc.asset_type;
  pagedata.list_language = doc.list_language;
  pagedata.list_view = doc.list_view;
  pagedata.show_more = doc.show_more;
  pagedata.lists = [];
  pagedata.listCount = 0
  //if (doc.list.length > 0) {

  pagedata.lists = doc.list.length > 0 ? doc.list.map(li => {
    let contentData = li.content;
    // let list_data = ContentListData(contentData, li, displayName, reg_query, isPremium, req.device, doc.slug);
    //return list_data;
    return "123";
  }) : []


}
