var os = require('os');
var fs = require('fs');
var http = require('http');
var spawn = require('child_process').spawn;
var express = require('express');
var bodyparser = require('body-parser');

// in c9 we need to use port and env from the environment..
var PORT = process.env.PORT;
var IP = process.env.IP;
console.log("port=" + PORT + " ip=" + IP);

var app = express();

// initialize bodyparser to get the data from POST
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

// start listening http service on the port
var httpserver = http.createServer(app);
httpserver.listen(PORT, IP, function() {
    console.log("--- start ---");
});



// -- helper for simple read file getters below ---
function servefile(res, ctype, fname) {
    res.header("Content-Type", ctype);
    // todo: fine tune cache control
    //res.header('Cache-Control', 'public, max-age=3600');
    try {
        res.send(fs.readFileSync(fname));
        console.log("serving file " + fname);
    }
    catch (e) {
        res.send("");
        console.log("serving file " + fname + " failed");
    }
}

// main ui page
app.get("/", function(req, res) {
    servefile(res, "text/html", "./index.html");
});

// client javascript
app.get("/client.js", function(req, res) {
    servefile(res, "text/javascript", "./client.js");
});

// Generate speech with espeak
app.get("/say", function(req, res) {

    var speech = req.param("text");
    console.log("speak:" + speech);

    res.header("Content-Type", "audio/mpeg");

    // spawn a task
    var espeak = spawn("espeak", ["-ven-scottish+f2", speech, "--stdout"]);
    // TODO: further optimizations
    var ffmpeg = spawn("./bin/ffmpeg", ["-i", "-", "-ab", "32k", "-f", "mp3", "-"]);

    ffmpeg.on('close', function(code) {
        console.log("ffmpeg exited with " + code);
    });

    espeak.on('close', function(code) {
        console.log("espeak exited with " + code);
    });

    espeak.stdout.pipe(ffmpeg.stdin); // pipe espeak to ffmpeg
    ffmpeg.stdout.pipe(res); // pipe ffmpeg to response
});
