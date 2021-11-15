
import React from 'react';
import './App.css';
import Game from './Game';

class App extends React.Component {
  render()  {
    return (
      <div>
        <h1>Poker</h1>
        <hr />
        <Game />
      </div>
    )
  }
}

export default App;
