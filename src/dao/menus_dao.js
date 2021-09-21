let menus
module.exports = class MenuDAO {
  static async injectDB(conn) {

    try {
      menus = await conn.db(process.env.BCCINS).collection("ipl-menus")
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

}