var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get("/Create", function(req, res) {
    try{
        console.log("Create");
        var mongodb = require('mongodb');
        var MongoClient = mongodb.MongoClient;
        res.header("Access-Control-Allow-Origin", "*");
        
        var highscore = {
            "Username": req.query.username,
            "Time": req.query.time
        }
        console.log(highscore);
        var url = 'mongodb://localhost:27017';
        MongoClient.connect(url, function(err, client) {
            if(err) {
                console.log(err);
                return res.send({"result" : "failed"});
            } else {
                var db = client.db('team-e');
                var collection = db.collection('highscores');
                collection.insertOne(highscore, function(err, res) {
                    if(err) throw err;
                    client.close();
                });
                return res.send({"result" : "passed"});
            };
        });
    } catch (error) {
        console.error(error);
    }
});

app.get("/ReadAll", function(req, res) {
    try {
        var mongodb = require('mongodb');
        var MongoClient = mongodb.MongoClient;
        res.header("Access-Control-Allow-Origin", "*");
        var url = 'mongodb://localhost:27017';
        MongoClient.connect(url, function(err, client) {
            if (err) {
                return res.send({"result" : "failed"});
            } else {
                var db = client.db('team-e');
                var collection = db.collection('highscores');
                collection.find({}).sort({ Time: -1 }).toArray(function(err, highscores){
                    if(err) throw err;
                    client.close();
                    console.log(highscores);
                    return res.send(highscores);
                });
            }
        });
    } catch (error) {
        console.error(error);
    }
});

try {
    var server = app.listen(3520, function() {
        console.log("Listening on port %$...", server.address().port);
    })
} catch (error) {
    console.error(error);
}