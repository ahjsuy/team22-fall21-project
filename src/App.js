
import React from 'react';
import './App.css';


class App extends React.Component {

  //return image source given its rank and suit in string(ex. getCardSrc("3", "hearts"))
  getCardSrc(rank, suit) {
    return "./cards/" + rank + "_of_" + suit + ".png" 
  }

  render()  {
    return (
      <div>
        <h1>HAHA</h1>
        <img src={this.getCardSrc("2", "hearts")} width="100" height="150"/>
      </div>
    )
  }
}

export default App;
