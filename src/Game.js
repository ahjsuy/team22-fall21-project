import React from "react";

import Card from "./Card"
import Table from "./Table"
import Player from "./Player"

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
//Some constants
const DECK = orderedDeck()
const roundName = ["PreFlop", "Flop", "Turn", "River", "Showdown"]
const smallestBet = 50 //the smallest amount of chips small blind has to bet
const NUM_PLAYERS = 5
const positionNames = ["Button", "SB", "BB"]

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
        }
        //activate class functions that use setState
        this.playerResponded = this.playerResponded.bind(this)
        this.newRound = this.newRound.bind(this)

        this.initializeGame()
    }

    getTwoCards(id, deck) {return [deck[id]["image"], deck[51-id]["image"]]} //get two cards from the top and bottom of the ramdomized deck.

    initializeGame() {
        //initialize players
        const playersData = []
        const numPlayers = this.state.numPlayers

        for (let i=0; i<numPlayers; i++) {   
            let pos = null
            let initialBet = 0
            let chips = 1000
            const button = this.state.button
            if (button===i) pos=positionNames[0]
            if (button+1===i || button+1-numPlayers===i) {
                pos=positionNames[1]
                initialBet=smallestBet
                chips -= initialBet
            }
            if (button+2===i || button+2-numPlayers===i) {
                pos=positionNames[2]  
                initialBet=smallestBet*2   
                chips -= initialBet     
            }
            playersData.push({id: i, position: pos, chips: chips, bet: initialBet, message: null, 
                cards: this.getTwoCards(i, this.state.deck), turn: false, action: this.playerResponded, folded: false,
            })
        }

        //populate nowPlaying array starting from currPlayer
        for (let i=this.state.currPlayer; i<playersData.length; i++) {this.state.nowPlaying.push(i)}
        for (let i=0; i<this.state.currPlayer; i++) {this.state.nowPlaying.push(i)}

        playersData[this.state.currPlayer]["turn"] = true
        this.state.playersData = playersData

        //initialize table
        const tableCards = []
        for (let i=0; i<5; i++) {
            tableCards.push(this.state.deck[52/2+i*Math.pow(-1,i)]["image"])
        }     
        this.state.tableData = {cards: tableCards, pot: smallestBet*3, numRevealed: 0}
    } 

    
    //a new round (not a new betting round), new deck, but only players who haven't busted remain 
    newRound() {
        const deck = shuffledDeck()
        const playersData = [...this.state.playersData]
        let nowPlaying = []
        const tableData = {...this.state.tableData} //need new cards, reset numRevealed
        let button = null
        playersData[this.state.button]["position"] = null //null current button
        //Find the next button
        for (let i=this.state.button+1; i<playersData.length; i++) {
            if (playersData[i]["chips"] !== 0) {
                button = i
                break
            }
        } if (!button) { //if not found in the second half of the array, find in the first half
            for (let i=0; i<this.state.button; i++) {
                if (playersData[i]["chips"] !== 0) {
                    button = i
                    break
                }
            }
        }
        //populate nowPlaying with remaining players 
        for (let i=button; i<playersData.length; i++) {
            if (playersData[i]["chips"] !== 0) nowPlaying.push(playersData[i]["id"])
        } for (let i=0; i<button; i++) {
            if (playersData[i]["chips"] !== 0) nowPlaying.push(playersData[i]["id"])
        }

        //find who's first to act
        let firstToAct //the index of the first player to act in nowPlaying array
        //positions are named differently for certain number of players remaining
        if (nowPlaying.length > 3) {
            firstToAct = 3
            playersData[nowPlaying[0]]["position"] = positionNames[0]
            playersData[nowPlaying[1]]["position"] = positionNames[1]
            playersData[nowPlaying[2]]["position"] = positionNames[2]
        } else if (nowPlaying.length > 1) {
            firstToAct = 0
            if (nowPlaying.length===3) {
                playersData[nowPlaying[0]]["position"] = positionNames[0]
                playersData[nowPlaying[1]]["position"] = positionNames[1]
                playersData[nowPlaying[2]]["position"] = positionNames[2]
            } else { //when there are only two players, the button becomes the small blind, and the other player is the big blind
                playersData[nowPlaying[0]]["position"] = positionNames[1]
                playersData[nowPlaying[1]]["position"] = positionNames[2]               
            } 
        } else { } //game ends when there is only one player with chips remaining
        

        //rearrange nowPlaying by having first to act player stay at index 0
        const nowPlayingCopy = []
        for (let i=firstToAct; i<nowPlaying.length; i++) nowPlayingCopy.push(nowPlaying[i])
        for (let i=0; i<firstToAct; i++) nowPlayingCopy.push(nowPlaying[i])
        nowPlaying = nowPlayingCopy
        
        //update remaining players' other properties
        for (const id of nowPlaying) {
            
            playersData[id]["cards"] = this.getTwoCards(id, deck)
            playersData[id]["message"] = null
            playersData[id]["turn"] = id === nowPlaying[0] ? true : false
            playersData[id]["folded"] = false
            playersData[id]["bet"] = 0
            if (playersData[id]["position"]==="SB") {
                playersData[id]["bet"] = smallestBet
                playersData[id]["chips"] -= smallestBet
            } else if (playersData[id]["position"]==="BB") {
                playersData[id]["bet"] = smallestBet*2
                playersData[id]["chips"] -= smallestBet*2          
            }
        }

        //update table data
        tableData["numRevealed"] = 0
        const tableCards = []
        for (let i=0; i<5; i++) {
            tableCards.push(deck[52/2+i*Math.pow(-1,i)]["image"])
        }
        tableData["cards"] = tableCards
        tableData["pot"] = smallestBet*3

        this.setState({
            numPlayers: NUM_PLAYERS,
            round: 0,
            playersData: playersData,
            nowPlaying: nowPlaying,
            tableData: tableData,
            highestBet: 0,
            deck: deck,
            currPlayer: nowPlaying[firstToAct],
        })
    }

    playerResponded(id, choice) {
        const playersData = [...this.state.playersData] //assigned by value
        const player = playersData[id] //assigned by reference 

        if (choice === "Increase") { //increase bet
            if (player["bet"] < player["chips"]) {
                player["bet"] += 50
                if (player["bet"] === player["chips"]) player["message"] = "All in"
            }
            let highest = this.state.highestBet
            if (player["bet"]>highest) highest = player["bet"] 
            else player["bet"] = highest
            this.setState({
                playersData: playersData,
                highestBet: highest,
            })
        }
        
        else { 
            const tableData = {...this.state.tableData} //assigned by value
            const nowPlaying = [...this.state.nowPlaying]
            let round = this.state.round

            //search next player's id
            const playingIndex = nowPlaying.indexOf(id)
            let nextId
            if (playingIndex === nowPlaying.length-1) {
                nextId = nowPlaying[0]
                round += 1
            }
            else nextId = nowPlaying[playingIndex+1]

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

                    tableData["pot"] = 0
                    this.setState({playersData: playersData, tableData: tableData, currPlayer: nextId, nowPlaying: nowPlaying, round: round})
                    this.newRound()
                    return
                }
            } else { 
                if (choice === "Check/Call") {
                    //set current player's bet to match highest bet
                    let difference = this.state.highestBet - player["bet"] 
                    if (difference + player["bet"] >= player["chips"]) { //if proposed bet amount is greater than the amount of the chips the player has
                        difference = player["chips"] - player["bet"]
                        player["message"] = "All in"
                    }
                    //collect bet
                    player["bet"] += difference
                    tableData["pot"] += difference 
                    player["chips"] -= difference
                } else {
                    tableData["pot"] += player["bet"] 
                    player["chips"] -= player["bet"]
                }
            }
            
            //end current player's turn and start next player's turn
            player["turn"] = false
            playersData[nextId]["turn"] = true

            function resetBets() { 
                for (const index of nowPlaying) {
                    let bet = 0
                    if (playersData[index]["position"] === "SB") bet = smallestBet
                    else if (playersData[index]["position"] === "BB") bet = smallestBet*2
                    playersData[index]["bet"] = bet
                    playersData[index]["chips"] -= bet
                    tableData["pot"] += bet
                }
            }
    
            //check if the next round should begin
            if (round !== this.state.round) {
                resetBets()
                if (round === 1) { //Flop
                    tableData["numRevealed"] = 3
                }
                else if (round === 2) { //Turn
                    tableData["numRevealed"] = 4       
                }
                else if (round === 3) { //River
                    tableData["numRevealed"] = 5        
                }
                else { //calculate winner 

                }
            }

            this.setState({playersData: playersData, tableData: tableData, currPlayer: nextId, nowPlaying: nowPlaying, round: round})
        }
    }


    render()  {
        //use playerData to map an array of Player Components
        const playerComponents = this.state.playersData.map(player => <Player id={player.id} 
            position={player.position}
            chips={player.chips}
            bet={player.bet}
            message={player.message}
            cards={player.cards}
            turn={player.turn}
            action={player.action}
            folded={player.folded}
        />)
        const table = this.state.tableData
        const tableComponent = <Table cards={table["cards"]} pot={table["pot"]} numRevealed={table.numRevealed}/>
        return (
            <div>
                {tableComponent}
                <hr/>
                <h4>Current Player:{this.state.currPlayer} Round:{roundName[this.state.round]}</h4>
                <hr/>
                {playerComponents}
                {tableComponent}
            </div>
        )
    }
}

export default Game;