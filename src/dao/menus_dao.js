let menus
let logos
let standings;
module.exports = class MenuDAO {
  static async injectDB(conn) {

    try {
      menus = await conn.db(process.env.BCCINS).collection("ipl_menus")
      logos = await conn.db(process.env.BCCINS).collection("logos")
      standings = await conn.db(process.env.BCCINS).collection('standings');
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
  static async getMenu(slug) {
    // TODO Ticket: User Management
    // Retrieve the user document corresponding with the user's email.
    return await menus.findOne({ slug: slug })
  }

  static async getsposorsList() {
    let matchesPerPage = 100;
    let cursor
    try {
      cursor = await logos
        .find({category:{$ne:null}});

      const displayCursor = cursor.limit(matchesPerPage)

      try {
        const List = await displayCursor.toArray()
        //const totalList = await matches.countDocuments(query) //page === 0 ? await matches.countDocuments(query) : 0
        return List
      } catch (e) {
        console.error(
          `Unable to convert cursor to array or problem counting documents, ${e}`,
        )
        return e;
      }

    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return { data: [] }
    }
    //    logos.find({}, async function(err,data){
    //         if(err){
    //             console.log("error is:,", err);
    //         }else{


    //             console.log("data us :",data);
    //             let data1=JSON.stringify(data);
    //             data1=JSON.parse(data1);
    //             return data1;
    //         }

    //     });

  }
  static async getStadings(type,from) {
    try {
      return standings.find({team:type, source:from}).toArray();
    }
    catch (e) {

      console.error("Error :", e);
      return { data: "Unable to find data" }
    }

  }

}
