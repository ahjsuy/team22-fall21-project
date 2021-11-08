import React from "react";

//return an organized deck of 52 cards
function orderedDeck() {
    const deck=[]
    const ranks=["2","3","4","5","6","7","8","9","10","jack","queen","king","ace"]
    const suits=["clubs","hearts","diamonds","spades"]
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({image: <Card rank={rank} suit={suit}/>, rank: ranks.indexOf(rank), suit: suit})
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


//Card Component: <Card rank="" suit=""/> (ranks: 1,2...jack,queen,king,ace; suits: clubs,spades,hearts,diamonds)
function Card(props) {
    return (
      <img src={"./cards/" + props.rank + "_of_" + props.suit + ".png"}  width="100" height="150"/>
    )
}

//Table Component
//props={cards, pot}
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
//props={id, position, chips, bet, message, cards, turn, action, playing}
function Player(props) {
    if (props.playing) {
        return (
            <div>
                <h3>Player{props.id} {props.position} Chips:{props.chips} Bet:{props.bet} {props.message}</h3> 
                <div>
                    {props.cards}
                </div>
                {
                    props.turn &&
                    <div>
                        <button onClick={() => props.action(props.id, "Check/Call")}>Check/Call</button>
                        <button onClick={() => props.action(props.id, "Fold")}>Fold</button>
                        <button onClick={() => props.action(props.id, "Raise")}>Raise</button>
                        <button onClick={() => props.action(props.id, "Increase")}>Increase bet amount</button>
                    </div>
                }
                <hr/>
            </div>
        )
    }
    return null;
}


//Game Component
class Game extends React.Component {
    constructor() {
        super()
        this.state={
            numPlayers: 6, //number of players
            button: 0, //the id of the button of a poker game
            currPlayer: 0, //who's turn
            deck: shuffledDeck(), //a list of obj = {image: <Card .../>, rank: 0~12, suit: string}
            
            playersData: [], // a list of obj = {id:, position:, chips:, bet:, message:, cards:, turn:, action:, playing:}
            tableComponent: null, 
        }
        //activate class functions that use setState
        this.playerResponded = this.playerResponded.bind(this)
 
        this.initializeGame()
    }

    getTwoCards(id) {return [this.state.deck[id]["image"], this.state.deck[51-id]["image"]]}
    
    initializeGame() {
        //initialize players
        const playersData = []
        const numPlayers = this.state.numPlayers
        for (let i=0; i<numPlayers; i++) {   
            let pos = null
            const button = this.state.button
            if (button===i) pos="Button"
            if (button+1===i || button+1-numPlayers===i) pos="Small Blind"
            if (button+2===i || button+2-numPlayers===i) pos="Big Blind"           

            playersData.push({
                id: i,
                position: pos,
                chips: 1000,
                bet: 50,
                message: null,
                cards: this.getTwoCards(i),
                turn: false,
                action: this.playerResponded,
                playing: true,
            })
        }
        playersData[this.state.currPlayer]["turn"] = true
        this.state.playersData = playersData

        //initialize table
        const tableCards = []
        for (let i=0; i<5; i++) {
            tableCards.push(this.state.deck[52/2+i*Math.pow(-1,i)]["image"])
        }     
        this.state.tableComponent = <Table cards={tableCards} pot={0}/>
        
    } 

    playerResponded(id, choice) {
        

        const playersData = [...this.state.playersData]
    }

    //props={id, position, chips, bet, message, cards, turn, action, playing}
    render()  {
        const playerComponents = this.state.playersData.map(player => <Player id={player.id} 
            position={player.position}
            chips={player.chips}
            bet={player.bet}
            message={player.message}
            cards={player.cards}
            turn={player.turn}
            action={player.action}
            playing={player.playing}
        />)
        return (
            <div>
                {this.state.tableComponent}
                <hr/>
                <h4>Current Player: {this.state.currPlayer}</h4>
                <hr/>
                {playerComponents}
            </div>
        )
    }
}

export default Game;