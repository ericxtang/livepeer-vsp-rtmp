const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { exec } = require("child_process");
const config = require('config');

const app = express();
const port = process.env.PORT || 5000;
let livepeerAPIKey = config.get('livepeerAPIKey');
let livepeerUsername = config.get('livepeerUsername');
let livepeerIngestBaseURL = config.get('livepeerIngestBaseURL');
let livepeerPlaybackBaseURL = config.get('livepeerPlaybackBaseURL');
let platformIngestBaseURL = config.get('platformIngestBaseURL');
let listener = null;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/new_ingest', (req, res) => {
  console.log(req.body);
  
  streamID = randomString()
  platformIngest = platformIngestBaseURL + "/" + streamID
  livepeerIngest = livepeerIngestBaseURL + "/" + livepeerAPIKey + "/" + livepeerUsername + "+" + streamID 
  cmd = listenToRTMP(platformIngest, livepeerIngest)

  playbackUrl = livepeerPlaybackBaseURL + "/" + livepeerUsername + "+" + streamID + "/index.m3u8"
  res.send({platformIngestUrl: platformIngest, playbackUrl: playbackUrl});
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));

function randomString() {
  return Math.random().toString(36).substring(2, 15) 
};

function listenToRTMP(platformIngest, livepeerIngest) {
  command = "ffmpeg -f flv -listen 1 -re -i " + platformIngest + " -c copy -f flv " + livepeerIngest
  if (listener != null) {
    listener.kill('SIGINT')
  }
  listener = exec(command, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
  });
}