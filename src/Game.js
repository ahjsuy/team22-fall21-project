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
            <button onClick={() => checkOrBet()}>Check/Call</button>
            <button onClick={() => fold()}>Fold</button>
            <button onClick={() => raise()}>Raise</button>
            <hr/>
        </div>
    )
}

//Game Component
class Game extends React.Component {
    constructor() {
        super()
        this.state={
            numPlayers: NUM_PLAYERS, //number of players
            button: 0, //the player id of the button of a poker game
            currPlayer: 3, //who's turn (probably unnecessary)
            deck: shuffledDeck(), //a list of obj = {image: <Card .../>, rank: 0~12, suit: string}
            round: 0,
            nowPlaying: [], //a list of ids of players who haven't folded or busted. Index 0 goes first at the start of a betting round.
            highestBet: smallestBet*2,
            
            playersData: [], // a list of obj = {id:, position:, chips:, bet:, message:, cards:, turn:, action:, folded:}
            tableData: null, //{cards: , pot: , numRevealed: } (numRevealed: number of cards revealed)
            winnerId: null,
            message: null,
            nextPlayer: false, //if true, show a button that can reveal next player's cards
        }
        //activate class functions that use setState
        this.playerResponded = this.playerResponded.bind(this)
        this.newRound = this.newRound.bind(this)
        this.onNextPlayer = this.onNextPlayer.bind(this)

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
            numPlayers: NUM_PLAYERS, round: 0, playersData: playersData, nowPlaying: nowPlaying, 
            tableData: tableData, highestBet: 0, deck: deck, currPlayer: nowPlaying[firstToAct], highestBet: 2*smallestBet
        })
    }

    onNextPlayer() {
        const playersData = [...this.state.playersData]
        playersData[this.state.currPlayer]["turn"] = true
        this.setState({playersData: playersData, nextPlayer: false})
    }

    playerResponded(id, choice) {
        const playersData = [...this.state.playersData] //assigned by value
        const player = playersData[id] //assigned by reference 
        let highestBet = this.state.highestBet

        if (choice === "Increase") { //increase bet
            if (player["bet"]+player["raised"] < player["chips"]) {
                player["raised"] += smallestBet
                if (player["bet"]+player["raised"] === player["chips"]) player["message"] = "All in"
            }
            if (player["bet"]+player["raised"]<highestBet) player["raised"] = highestBet - player["bet"] + smallestBet
            this.setState({playersData: playersData})
        } else { 
            const tableData = {...this.state.tableData} //assigned by value
            const nowPlaying = [...this.state.nowPlaying]
            let round = this.state.round
            

            //search next player's id
            const playingIndex = nowPlaying.indexOf(id)
            let nextId
            if (playingIndex === nowPlaying.length-1) {
                nextId = nowPlaying[0]
                round += 1
            } else nextId = nowPlaying[playingIndex+1]

            //these are actions that end a player's turn
            if (choice === "Fold") {
                player["folded"] = true 
                player["message"] = "folded"
                nowPlaying.splice(nowPlaying.indexOf(id), 1) //remove from player list
                //collect bet
                let fix = 0 //if one of the blinds folds, don't collect again the bet they already contribute at the beginning of the betting round
                if (player["position"]==="SB") fix = smallestBet
                else if (player["position"]==="BB") fix = smallestBet*2
                tableData["pot"] += player["bet"] - fix
                player["chips"] -= player["bet"] - fix
                
                if (nowPlaying.length === 1) { //end this game round early if all except one player folded
                    playersData[nowPlaying[0]]["chips"] += tableData["pot"] 
                    const message = "Player" + nowPlaying[0].toString() + " won the pot of " + tableData["pot"].toString() + " chips!!!"
                    tableData["pot"] = 0
                    this.setState({playersData: playersData, tableData: tableData, currPlayer: nextId, nowPlaying: nowPlaying, round: 4, message: message})
                    return
                }
            } else { 
                if (choice === "Check/Call") {
                    //set current player's bet to match highest bet
                    let difference = highestBet - player["bet"] 
                    if (difference + player["bet"] >= player["chips"]) { //if proposed bet amount is greater than the amount of the chips the player has
                        difference = player["chips"] - player["bet"]
                        player["message"] = "All in"
                    }
                    //collect bet
                    player["bet"] += difference
                    tableData["pot"] += difference 
                    player["chips"] -= difference
                } else {//Raise
                    player["chips"] -= player["raised"]
                    tableData["pot"] += player["raised"]
                    player["bet"] += player["raised"]  
                    highestBet = player["bet"]   
                }
                player.raised = 0   
            }
            //end current player's turn
            player["turn"] = false

            //check if the next round should begin
            let message = ""
            if (round !== this.state.round) { 
                if (round === 1) tableData["numRevealed"] = 3 //Flop
                else if (round === 2) tableData["numRevealed"] = 4 //Turn    
                else if (round === 3) tableData["numRevealed"] = 5 //River
                else { //Showdown, find winner, distribute pot
                    const winnerIDs = this.findWinner(nowPlaying, playersData) 
                    if (winnerIDs.length === 1) {
                        message = "Player" + winnerIDs[0].toString() + " won the pot of " + tableData["pot"].toString() + " chips!!!"
                        playersData[winnerIDs[0]]["chips"] += tableData["pot"]
                    } else { //split the pot if more than one player win
                        const share = tableData["pot"] / winnerIDs.length
                        for (const id of winnerIDs) {
                            playersData[id]["chips"] += share
                            message += "Player" + id.toString() + ", "
                        }
                        message += "share the pot of " + tableData["pot"].toString() + " chips!!!"
                    } 
                    tableData["pot"] = 0
                    playersData[nextId]["turn"] = false //game round ends, so it's no one's turn.
                }
            }

            this.setState({playersData: playersData, tableData: tableData, currPlayer: nextId, 
                nowPlaying: nowPlaying, round: round, message: message, highestBet: highestBet, nextPlayer: true})
        }
    }

    render()  {
        const data = this.state
        return (
            <div>
                {this.state.round===4 ? newDeckButton : gameStatus}
                {this.state.nextPlayer &&  <button onClick={this.onNextPlayer}>Next Player</button>}
                <hr/>
                {tableComponent}
                <hr/>
                {playerComponents}
                {tableComponent}
                <hr/>
                {this.state.round===4 ? newDeckButton : gameStatus}
                {this.state.nextPlayer &&  <button onClick={this.onNextPlayer}>Next Player</button>}
            </div>
        )
    }
}

export default Game;