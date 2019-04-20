import React from 'react';
import ReactDOM from 'react-dom'
import axios from 'axios';
import moment from 'moment'
import './css/index.css'


class App extends React.Component {
    state = {
      clientID: 'cfb15400',
      clientSecret: '71a16dfc020018afa4631c61123143e4',
      selectedSong: {},
      searchResult: {},
      album: [],
      isLoading: true,
      musicPlaying: true,
      musicMuted: false,
      musicVolume: 0.1,
      loopTrack: false
    }
  
    componentDidMount () {
      this.initialFetch()
    }

    initialFetch() {
      axios.get(`https://api.jamendo.com/v3.0/tracks/?client_id=${this.state.clientID}&format=jsonpretty&limit=10&include=musicinfo&groupby=artist_id&search=jaime`)
        .then(res => {
        this.setState({ 
          album: res.data.results,
          selectedSong: res.data.results[0],
          isLoading: false
        })
        this.setDefaults(this.state.album)
      })
    }
    setDefaults = () => {
      let audioPlayer = document.querySelector('#audioPlayer')
      audioPlayer.volume = 0.1
    }
    selectedTrack = (track) => {
      this.setState({ 
        selectedSong: track,
        musicPlaying: false,
        musicMuted: false 
      }, this.playSelectedTrack())
    }
    playSelectedTrack = () => {
      this.refs.audio.pause()
      this.refs.audio.load()
      this.refs.audio.play()
    } 
    onPlay = () => {
      let audioPlayer = document.querySelector('#audioPlayer')
      audioPlayer.play()
      this.setState({ musicPlaying: false })
    }
    onPause = () => {
      let audioPlayer = document.querySelector('#audioPlayer')
      audioPlayer.pause()
      this.setState({ musicPlaying: true })
    }
    onMute = () => {
      let audioPlayer = document.querySelector('#audioPlayer')
      audioPlayer.volume = 0
      this.setState({ musicMuted: true })
    }
    onUnmute = () => {
      let audioPlayer = document.querySelector('#audioPlayer')
      audioPlayer.volume = this.state.musicVolume
      this.setState({ musicMuted: false })
    }
    timeUpdate = (e) => {
      let timeElapsed = document.querySelector('.timeElapsed')
      timeElapsed.innerHTML = moment(0).seconds(e.target.currentTime).format('m:ss')
      let time = document.querySelector('.time')
      time.style.width = ((e.target.currentTime / e.target.duration).toFixed(2) * 100 + "%")
      if (e.target.ended) {
        this.nextSong()
      }
    }
    timeChange = (e) => {
      let audioPlayer = document.querySelector('#audioPlayer')
      let percentage = ((e.pageX - e.target.getBoundingClientRect().left) / 100).toFixed(2) / 2
      audioPlayer.currentTime = audioPlayer.duration * percentage
    }
    volChange = (e) => {
      let audioPlayer = document.querySelector('#audioPlayer')
      let percentage = ((e.pageX - e.target.getBoundingClientRect().left) / 100).toFixed(2)
      audioPlayer.volume = percentage
      this.setState({ musicVolume: percentage })
    }
    volumeChange = (e) => {
      let barFill =  document.querySelector('.volume')
      barFill.style.width = (e.target.volume * 100) + 'px'
      let volumePercentage =  document.querySelector('.volumePercentage')
      volumePercentage.innerHTML = (e.target.volume * 100).toFixed() + "%"
    }
    loopTrack = (e) => {
      let audioPlayer = document.querySelector('#audioPlayer')
      audioPlayer.loop = this.state.loopTrack
      if ( this.state.loopTrack === false) {
        e.target.style.opacity = 0.4
        this.setState({ loopTrack: true })
      } else {
        e.target.style.opacity = 1
        this.setState({ loopTrack: false })
      }
    }
    previousSong = (e) => {
      let previousSong = this.state.album[this.state.album.indexOf(this.state.selectedSong) - 1]
      if(previousSong) {
        this.setState({ selectedSong: previousSong,
          musicPlaying: false,
          musicMuted: false  
        }, this.playSelectedTrack())
      }
    }
    nextSong = () => {
      let nextSong = this.state.album[this.state.album.indexOf(this.state.selectedSong) + 1]
      if(nextSong) {
        this.setState({ selectedSong: nextSong,
          musicPlaying: false,
          musicMuted: false  
        }, this.playSelectedTrack())
      }
    }
    searchTracks = (e) => {
      e.preventDefault()
      let searchWord = document.querySelector('.searchInput')
      axios.get(`https://api.jamendo.com/v3.0/tracks/?client_id=${this.state.clientID}&format=jsonpretty&limit=10&include=musicinfo&groupby=artist_id&search=${searchWord}`)
        .then(res => {
          this.setState({ 
            album: res.data.results,
            selectedSong: res.data.results[0],
            isLoading: false
          })
        })
    }


    render() {
      const album = this.state.album
      const {audio, duration, name: song_name, image: song_image, artist_name: song_artist, album_name: song_album} = this.state.selectedSong
      return (
        <div className='mainContainer container'>
          <div className='row search'>
            <div className='col-sm-12'>
              <form className="form-inline md-form form-sm active-purple-2 mt-2" onSubmit={this.searchTracks}>
                <input className="form-control form-control-sm mr-3 searchInput" maxLength="30" type="text" placeholder="Search" aria-label="Search" />
                <i className="fas fa-search searchIcon" aria-hidden="true"></i>
              </form>
            </div>
          </div>
          {!this.state.isLoading ? (
            <div className='row trackContainer selectedSong'>
              <div className='container'>
                <div className='row'>
              <div className='col-sm-4 selectedImage'>
                <img alt='album_image' src={song_image} />
              </div>
              <div className='col-sm-8 songDetails'>
                <p className='songName'>{song_name.slice(0, 20)}</p>
                <p className='artistName'>{song_artist}</p>
                <p className='albumName'>{song_album}</p>
                <audio id='audioPlayer' ref='audio' onTimeUpdate={this.timeUpdate} onVolumeChange={this.volumeChange}>
                  <source src={audio}/>  
                </audio>
                <div className="volumeContainer">
                  <span className="volumeMute">
                    {this.state.musicMuted ? (
                      <i className="fas fa-volume-mute" onClick={this.onUnmute}></i>
                    ) : (
                      <i className="fas fa-volume-up" onClick={this.onMute}></i>
                    )}
                  </span>
                  <div className="volumeBar" onClick={(e) => this.volChange(e)}>
                    <div className="volume"><div className="volumeDot"></div></div>
                  </div>
                  <span className="volumePercentage">10%</span>
                  <i className="fas fa-sync-alt" onClick={(e) => this.loopTrack(e)}></i>
                </div>
              </div>
              </div>
              <div className='row'>
                <div className='col-sm-4 songButtons'>
                  <i className="fas fa-step-backward" onClick={(e) => this.previousSong(e)}></i>
                  {this.state.musicPlaying ? (
                      <i className="fas fa-play" onClick={this.onPlay}></i>
                      ) : (
                      <i className="fas fa-pause" onClick={this.onPause}></i>)}
                  <i className="fas fa-step-forward" onClick={this.nextSong}></i>
                  </div>
                  <div className='col-sm-8 songTime'>
                    <span className="timeElapsed">0:00</span>
                    <div className="timeBar" onClick={(e) => this.timeChange(e)}>
                      <div className="time"><div className="timeDot"></div></div>
                    </div>
                    <span className="timeFull">{moment(0).seconds(duration).format('m:ss')}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>Loading...</div> 
          )}
          <div className='otherSongs'>
            {!this.state.isLoading && album ? (
              album.map(track => (
                <div key={track.id} className='row trackContainer otherSong'
                  onClick={() => this.selectedTrack(track)}>
                  <div className='col-sm-3'>
                    <img alt="album_image" className='otherSongs_image' src={track.album_image} />
                  </div>
                  <div className='col-sm-9 otherSong_info'>
                    <p className='songName'>{track.name}</p>
                    <p className='artistName'>{track.artist_name}</p>
                    <p className='albumName'>{track.album_name}</p>
                    {track.name === song_name ? <span className='currentSong'>Playing</span> : ''}
                  </div>
                </div>
              ))
            ) : (
              <div>Loading...</div>
            )
            }
          </div> 
        </div>
      );
    }
  }
  
  ReactDOM.render(
    <App />,
    document.getElementById('root')
  );