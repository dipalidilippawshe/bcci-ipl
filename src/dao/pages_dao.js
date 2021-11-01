let pages
let bccipages
let iplArticles
let winners
let matches
module.exports = class PagesDAO {
  static async injectDB(conn) {

    try {
      pages = await conn.db(process.env.BCCINS).collection("ipl_pages")
      bccipages = await conn.db(process.env.BCCINS).collection("bcci_pages")
      iplArticles = await conn.db(process.env.BCCINS).collection("ipl_articles")
      winners = await conn.db(process.env.BCCINS).collection("ipl_winners")
      matches = await conn.db(process.env.BCCINS).collection("ipl_matches")

    } catch (e) {
      console.error(`Unable to establish collection handles in pagesDAO: ${e}`)
    }
  }

  /**
  Ticket: User Management
 
  For this ticket, you will need to implement the following five methods:
 
  - getUser
  - addUser
  - loginUser
  - logoutUser
  - getUserSession
 
  You can find these methods below this comment. Make sure to read the comments
  in each method to better understand the implementation.
 
  The method deleteUser is already given to you.
  */

  /**
   * Finds a user in the `users` collection
   * @param {string} slug - The email of the desired user
   * @returns {Object | null} Returns either a single user or nothing
   */
  static async getBcciPage(slug) {
    // TODO Ticket: User Management
    // Retrieve the user document corresponding with the user's email.
    return await bccipages.findOne({ slug: slug })
  }
  static async getPage(slug) {
    // TODO Ticket: User Management
    // Retrieve the user document corresponding with the user's email.
    return await pages.findOne({ slug: slug })
  }

  static async getNews(type){
    
        var query = {'tags.label':type}
        if(type=="pulse-cms"){
          query = {'platform':"PULSE_CMS"}
        }

    let cursor
    try {
        console.log("query: ",query);
        cursor = await iplArticles.find(query)
        
        const displayCursor = cursor.limit(12)
        const list = await displayCursor.toArray()
       
        return list;
    } catch (e) {
        console.error(`Unable to issue find command, ${e}`)
        return { list: [], total: 0 }
    }
   
    //var list = await videos.find(query).limit(15);
    
}

static async callWinners(){
  var cursor;
  cursor = await winners.find({})

  const displayCursor = cursor;
  const list = await displayCursor.toArray()
  return list
}

static async callHighestRuns(year){
  var pipeline =[
    {
      $match: { "matchInfo.matchDate": new RegExp(year, "i"), "matchInfo.matchState": "C" }
  },
  { $project: { "innings": 1,  } },
  { $unwind: "$innings" },
  { $unwind: "$innings.scorecard" },
  ]
}

}