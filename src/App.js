
import React from 'react';
import './App.css';


//Card Component: <GetCard rank="" suit=""/> (ranks: 1,2...jack,queen,king,ace; suits: clubs,spades,hearts,diamonds)
function Card(props) {
  return (
    <img src={"./cards/" + props.rank + "_of_" + props.suit + ".png"}  width="100" height="150"/>
  )
}

//initialize an organized deck of 52 cards
const deck=[]
const ranks=["2","3","4","5","6","7","8","9","10","jack","queen","king","ace"]
const suits=["clubs","hearts","diamonds","spades"]
for (const suit of suits) {
  for (const rank of ranks) {
    deck.push(<Card rank={rank} suit={suit}/>)
  }
}

//return an array of randomized 52 cards
function newDeck() {
  const shuffledDeck = deck
  //shuffling algorithm I found online
  let currentIndex = shuffledDeck.length,  randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [shuffledDeck[currentIndex], shuffledDeck[randomIndex]] = [
      shuffledDeck[randomIndex], shuffledDeck[currentIndex]];
  }
  return shuffledDeck;
}


class Table extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      pot: 0,
      cards: props.cards
    }
  }
  render() {
    return (
      <div>
        <h3>Table</h3>
        <div>
          {this.state.cards}
        </div>
        <p1>Pot: {this.state.pot}</p1>
      </div>
    )
  }
}

class Player extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      chips: 1000,
      cards: this.props.cards,
      id: this.props.id,
      handStrength: "high card",
      position: this.props.position,
      action: this.props.action,
      message: this.props.message,
    }
  }
  render() {
    return (
      <div>
        <h3>Player ID:{this.state.id}           Chips: {this.state.chips} {this.state.position} {this.state.message}</h3> 
        <div>
          {this.state.cards}
        </div>
        <button onClick={() => this.state.action(this.state.id, "raise")}>Check/Call</button>
        <button onClick={() => this.state.action(this.state.id, "raise")}>Fold</button>
        <button onClick={() => this.state.action(this.state.id, "raise")}>Raise</button>
        <hr/>
      </div>
    )
  }
}


class App extends React.Component {
  constructor() {
    super()
    this.state={
      numPlayers: 6,
      button: 2,
      playerPositions: [],
      currPlayer: 0,
      deck: newDeck(),
      playerComponents: [],
      tableComponent: null,
    }
    
    //initialize playerPositions
    for (let i=0; i<this.state.numPlayers; i++) {
      let position = null
        if (this.state.button===i) position="Button"
        if (this.state.button+1===i || this.state.button+1-this.state.numPlayers===i) position="Small Blind"
        if (this.state.button+2===i || this.state.button+2-this.state.numPlayers===i) position="Big Blind"
      this.state.playerPositions.push(position)
    }

    //activate class functions
    this.playerResponded = this.playerResponded.bind(this)
    this.createPlayer = this.createPlayer.bind(this)
    this.initializeGame = this.initializeGame.bind(this)

    this.initializeGame()
  }
    
  createPlayer(id) {
    return <Player id={id} cards={[this.state.deck[id], this.state.deck[51-id]]} 
      position={this.state.playerPositions[id]} action={this.playerResponded}/>
  }

  playerResponded(PlayerID, choice) {
    const players = []
    for (let i=0; i<this.state.numPlayers; i++) {
      if (PlayerID!==i) players.push(this.createPlayer(i))
      else players.push(<Player id={i} cards={[this.state.deck[i], this.state.deck[51-i]]} 
        position={this.state.playerPositions[i]} action={this.playerResponded} message={"clicked"}/>)
    }

    this.setState({
      playerComponents: players,
    })
  }


  initializeGame() {
       //initialize players
      const players = []
      const tableCards = []
      for (let i=0; i<this.state.numPlayers; i++) {       
        players.push(this.createPlayer(i))
      }
      //initialize table
      for (let i=0; i<5; i++) {
        tableCards.push(this.state.deck[52/2+i*Math.pow(-1,i)])
      }     
      this.state.playerComponents = players
      this.state.tableComponent = <Table cards={tableCards}/>
 } 
 
  render()  {
    const data = this.state
    return (
      <div>
        <h2>Poker</h2>
        <hr/>
        {data.tableComponent}
        <hr/>
        {data.playerComponents}
      </div>
    )
  }
}


export default App;
