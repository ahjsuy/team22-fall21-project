import React from 'react';
import './App.css';
import Game from './Game';
import background from './poker-table.jpg'

class App extends React.Component {
  render()  {
    return (
      <div style={{ backgroundImage: `url(${background})` }}>
        <h1>POKER</h1>
        <Game/>
      </div>
    )
  }
}

export default App;
