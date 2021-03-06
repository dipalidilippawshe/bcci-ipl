const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const morgan = require("morgan")
const config = require("../config/default.json")
// const movies = require("../src/api/routes/movies_route")
// const users = require("../src/api/routes/users_route")

const pages = require("../src/api/routes/pages_route")
const iplMatches = require("../src/api/routes/ipl_match_route")
const iplVideos = require("../src/api/routes/ipl_videos_route")
const bios = require("../src/api/routes/bios_route");
const promos = require('../src/api/routes/promos_route');
const iplArticles = require("./api/routes/ipl_articles_routes")
const iplPhotos = require("../src/api/routes/ipl_photos_route")
const playlists = require("../src/api/routes/playlist_route");
const menus = require("../src/api/routes/menu_route");
const auctions = require("../src/api/routes/auction_route");
const document = require("../src/api/routes/document_route");
const static_url_route = require("../src/api/routes/static_url_route");
const { request } = require("express")
const app = express()

app.use(cors())
process.env.NODE_ENV !== "prod" && app.use(morgan("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function (req, res, next) {
   if(req.url.includes("/app/")){
    var auth_token = req.body.x_access_auth_token || req.query.auth_token || req.headers['x-access-auth-token'];
    if (!auth_token) {
      return res.status(403).send(JSON.stringify({ success: false, message: "Auth Token Not Provided" }));
    } else if (typeof config.auth_token[auth_token] === 'undefined') {
      return res.status(403).send(JSON.stringify({ success: false, message: "Invalid Auth Token" }));
    }
    next();
   }else{
       next();
   }
    
});

app.use("/api/v1/bios", bios);
app.use("/api/v1/promos", promos);

app.use("/api/v1/pages", pages);
app.use("/api/v1/ipl_matches", iplMatches);
app.use("/api/v1/ipl_videos", iplVideos);
app.use("/api/v1/ipl_articles", iplArticles);
app.use("/api/v1/ipl_photos", iplPhotos);
app.use("/api/v1/playlists", playlists);
app.use("/api/v1/menu", menus)
app.use("/api/v1/auction", auctions)
app.use("/api/v1/document", document)
app.use("/api/v1/staticUrl/data",static_url_route)
app.use("*", (req, res) => res.status(404).json({ error: "api not found" }))

module.exports = app
