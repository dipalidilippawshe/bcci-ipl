let pages
let bccipages
module.exports = class PagesDAO {
  static async injectDB(conn) {

    try {
      pages = await conn.db(process.env.BCCINS).collection("ipl_pages")
      bccipages = await conn.db(process.env.BCCINS).collection("bcci_pages")
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

}