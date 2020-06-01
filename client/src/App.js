import React, { Component } from 'react';

import logo from './logo.png';

import { Player } from 'video-react';

import './App.css';

class App extends Component {
  state = {
    response: '',
    post: '',
    platformIngestUrl: '',
    playbackURL: '',
  };

  handleSubmit = async e => {
    e.preventDefault();
    const response = await fetch('/api/new_ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post: this.state.post }),
    });
    const body = await response.text();

    var streamResponse = JSON.parse(body)
    console.log(streamResponse);
    this.setState({ platformIngestUrl: streamResponse["platformIngestUrl"]});
    this.setState({ playbackURL: streamResponse["playbackUrl"]});
    var watchPlayerLoop = setInterval(function() {
      fetch(streamResponse["playbackUrl"]).then(
        function(res) {
          if (res.ok) {
            res.text().then(function (text) {
              if (text.search("Stream open failed") == -1) {
                //Found playlist. Show Video Player and Hide Load Msg.
                setTimeout(function(){
                  var player = document.getElementById('player');
                  player.src = "https://media.livepeer.org/embed?aspectRatio=16%3A9&maxWidth=100%25&url= "+ encodeURIComponent(streamResponse["playbackUrl"]);
                }, 3000);

                setTimeout(function() {
                  var player = document.getElementById('player');
                  player.className = "show";
                }, 3500);

                //terminate wait
                clearInterval(watchPlayerLoop);
              }
            });
          } else {
            console.log(res);
          }
        }
      )
    }, 3000);
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <p>{this.state.response}</p>
        <form onSubmit={this.handleSubmit}>
          <button type="submit">Get New RTMP Ingest</button>
        </form>
        <p>Ingest URL: {this.state.platformIngestUrl}</p>
        <p>playback URL: {this.state.playbackURL}</p>
        <div className="player-container">
          <iframe id="player" muted={false} className="hide" width="640" height="360" live="true" src="" allowFullScreen></iframe>
        </div>
      </div>
    );
  }
}

export default App;
