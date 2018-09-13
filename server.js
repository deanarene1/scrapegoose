var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

//Scraping tool
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();


// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


mongoose.connect("mongodb://localhost");
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");



// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with request
    request("https://www.nytimes.com/search?query=nasa", function (err, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);

        // Save an empty result object
        var results = [];

        // Now, we grab every h2 within an article tag, and do the following:
        $("li.SearchResults-item--3k02W").each(function (i, element) {

            // Add the text and href of every link, and save them as properties of the result object
            const title = $(this).children().children().children("a").children("h4").text();
            const link = $(this).children().children().children("a").attr("href");
            const summary = $(this).children().children().children("a").children("p").text();

            results.push({
                title: title,
                link: link,
                summary: summary

            });

        });

        console.log(results);
        res.json(results);

    });
});


// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});