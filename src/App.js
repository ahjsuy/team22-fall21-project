import React from 'react';
import './App.css';
import Game from './Game';
import PlaySound from './PlaySound';

class App extends React.Component {
  constructor() {
    super()
    this.state={
      gameStarted: false,
      numPlayers: 6,
    }
    this.startGame = this.startGame.bind(this)
    this.setNumPlayers = this.setNumPlayers.bind(this)
  }
  startGame() {
    this.setState({gameStarted: true})
  }
  setNumPlayers(event) {
    this.setState({numPlayers: event.target.value})
  }

  render()  {
    return (
      <div>
        <PlaySound />
        <h1>POKER</h1>
        {this.state.gameStarted ? <Game numPlayers={this.state.numPlayers}/> :
          <div>
            <p>Enter number of players(minimum 4, maximum 20)</p>
            <input type="number" value={this.state.numPlayers} onChange={this.setNumPlayers} />
            <button onClick={this.startGame}>START</button>
          </div>
        }
      </div>
    )
  }
}

export default App;
