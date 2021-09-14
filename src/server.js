const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const morgan = require("morgan")
// const movies = require("../src/api/routes/movies_route")
// const users = require("../src/api/routes/users_route")

const iplMatches = require("../src/api/routes/ipl_match_route")
const iplVideos = require("../src/api/routes/ipl_videos_route")
const iplArticles =  require("./api/routes/ipl_articles_routes")
const app = express()

app.use(cors())
process.env.NODE_ENV !== "prod" && app.use(morgan("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Register api routes
//app.use("/api/v1/movies", movies);
//app.use("/api/v1/user", users);

app.use("/api/v1/ipl_matches", iplMatches);
app.use("/api/v1/ipl_videos", iplVideos);
app.use("/api/v1/ipl_Articles",iplArticles);
app.use("*", (req, res) => res.status(404).json({ error: "api not found" }))

module.exports = app
