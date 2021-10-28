import React from "react";

//return an organized deck of 52 cards
function orderedDeck() {
const deck=[]
const ranks=["2","3","4","5","6","7","8","9","10","jack","queen","king","ace"]
const suits=["clubs","hearts","diamonds","spades"]
for (const suit of suits) {
    for (const rank of ranks) {
    deck.push(<Card rank={rank} suit={suit}/>)
    }
}
return deck
}
//return an array of randomized 52 cards
function shuffledDeck() {
const shuffledDeck = DECK
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
const DECK = orderedDeck()


//Card Component: <GetCard rank="" suit=""/> (ranks: 1,2...jack,queen,king,ace; suits: clubs,spades,hearts,diamonds)
function Card(props) {
    return (
      <img src={"./cards/" + props.rank + "_of_" + props.suit + ".png"}  width="100" height="150"/>
    )
}

//Table Component
function Table (props) {
    return (
        <div>
            <h2>Table</h2>
            <div>
                {props.cards}
            </div>
            <h3>Pot: {props.pot}</h3>
        </div>
    )
}

//Player Component
//props={id, position, chips, message, cards, action}
function Player(props) {
    return (
        <div>
            <h3>Player {props.id} {props.position} Chips:{props.chips} {props.message}</h3> 
            <div>
                {props.cards}
            </div>
            <button onClick={() => props.action(props.id, "Check/Call")}>Check/Call</button>
            <button onClick={() => props.action(props.id, "Fold")}>Fold</button>
            <button onClick={() => props.action(props.id, "Raise")}>Raise</button>
            <hr/>
        </div>
    )
}

//Game Component
class Game extends React.Component {
    constructor() {
        super()
        this.state={
            numPlayers: 6,
            button: 0,
            playerPositions: [],
            currPlayer: 0,
            deck: shuffledDeck(),
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
        this.initializeGame = this.initializeGame.bind(this)
        this.initializeGame()
    }


    getTwoCards(id) {return [this.state.deck[id], this.state.deck[51-id]]}

    createPlayer(id, message=null) {
        return <Player id={id} position={this.state.playerPositions[id]} chips={1000} message={message} cards={this.getTwoCards(id)} action={this.playerResponded}/>
    }

    playerResponded(id, choice) {
        //remember to use key
        //to copy array by value, use [...array]
        const players = [...this.state.playerComponents]
        players[id] = this.createPlayer(id, choice)
        this.setState({
            playerComponents: players
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
        this.state.tableComponent = <Table cards={tableCards} pot={0}/>
    } 

    render()  {
        const data = this.state
        return (
        <div>
            {data.tableComponent}
            <hr/>
            {data.playerComponents}
        </div>
        )
    }
}

export default Game;