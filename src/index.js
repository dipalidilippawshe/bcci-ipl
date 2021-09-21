const app = require("./server")
const config = require("config")
const { MongoClient } = require("mongodb")
/* const MoviesDAO = require("../src/dao/movies_dao")
const UsersDAO = require("./dao/users_dao")
const CommentsDAO = require("./dao/comments_dao") */

const PagesDAO = require("./dao/pages_dao")
const MatchesDAO = require("./dao/matches_dao")
const MatchDAO = require("./dao/ipl_match_dao")
const IplVideosDAO = require("./dao/ipl_videos_dao")
const BiosDAO = require("./dao/bios_dao")
const PromosDAO = require('./dao/promos_dao')
const PlaylistDAO = require('./dao/playlist_dao')
const IplArticlesDao = require("./dao/ipl_articles_dao");
const IplPhotosDAO = require("./dao/ipl_photos_dao")
const RecordDAO = require("./dao/ipl_records_dao")
const playlistDAO = require("./dao/playlist_dao")
const iplPagesDAO = require("./dao/ipl_pages_dao");

const port = 5001
console.log("config: ", config.mongodb_uri);
MongoClient.connect(
  config.mongodb_uri,
  { poolSize: 50, writeConcern: { w: 2, wtimeout: 5000 }, useUnifiedTopology: true, wtimeout: 2500, useNewUrlParser: true }
).catch(err => {
  console.error(err.stack)
  process.exit(1)
}).then(async client => {
  /*  await MoviesDAO.injectDB(client)
   await UsersDAO.injectDB(client)
   await CommentsDAO.injectDB(client) */

  await PagesDAO.injectDB(client)
  await MatchDAO.injectDB(client)
  await IplVideosDAO.injectDB(client)
  await BiosDAO.injectDB(client)
  await PromosDAO.injectDB(client)
  await PlaylistDAO.injectDB(client);
  await IplArticlesDao.injectDB(client)
  await MatchesDAO.injectDB(client)
  await IplPhotosDAO.injectDB(client)
  await RecordDAO.injectDB(client)
  await playlistDAO.injectDB(client)
  await iplPagesDAO.injectDB(client);
  app.listen(port, () => {
    console.log(`listening on port ${port}`)
  })
})
