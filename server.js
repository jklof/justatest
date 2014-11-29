var os = require('os');
var fs = require('fs');
var http = require('http');
var spawn = require('child_process').spawn;
var express = require('express');
var bodyparser = require('body-parser');



// initialize express and bodyparser
var app = express();
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());


// start listening http service on the port
var httpserver = http.createServer(app);
httpserver.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = httpserver.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
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

    var speech  = req.param("text", "");
    var pitch   = req.param("pitch");
    var speed   = req.param("speed");
    var gap     = req.param("gap");
    var voice   = req.param("voice");
    var variant = req.param("variant");

    var args = [speech, "--stdout"];

    if (variant)
        voice = (voice || "") + "+" + variant;
    if (voice)
        args.push("-v" + voice);
    if (pitch)
        args.push("-p"+pitch);
    if (speed)
        args.push("-s"+speed);
    if (gap)
        args.push("-g"+gap);

    console.log("args" + JSON.stringify(args));

    res.header("Content-Type", "audio/mpeg");

    // spawn a task
    var espeak = spawn("espeak", args);
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
