import React from "react";
import './App.css';
import Card from "./Card"
import Table from "./Table"
import Player from "./Player"

//return an organized deck of 52 cards
function orderedDeck() {
    const deck=[]
    const ranks=["2","3","4","5","6","7","8","9","10","jack","queen","king","ace"]
    const suits=["clubs","hearts","diamonds","spades"]
    const bitwiseRanks = [2,3,4,5,6,7,8,9,10,11,12,13,14]
    const bitwiseSuits = [1,4,2,8] 
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({image: <Card rank={rank} suit={suit}/>, rank: bitwiseRanks[ranks.indexOf(rank)], suit: bitwiseSuits[suits.indexOf(suit)]})
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

//hand rank calculator(algorithm I found online. Not Readable. know how to use it) 
function evaluateHand(cs, ss) {  //usage: evaluateHand([A,10,J,K,Q],[C,C,C,C,C]), return the name of the hand
    var pokerHands = ["4 of a Kind", "Straight Flush","Straight","Flush","High Card","1 Pair","2 Pair","Royal Flush", "3 of a Kind","Full House"];
    var v,i,o,s = 1 << cs[0] | 1 << cs[1] | 1 << cs[2] | 1 << cs[3] | 1 << cs[4];
    for (i = -1, v = o = 0; i < 5; i++, o = Math.pow(2, cs[i] * 4)) {v += o * ((v / o & 15) + 1);}
    v = v % 15 - ((s / (s & -s) == 31) || (s == 0x403c) ? 3 : 1);
    v -= (ss[0] == (ss[1] | ss[2] | ss[3] | ss[4])) * ((s == 0x7c00) ? -5 : 1);
    return pokerHands[v];
}

const strengthValues = {"High Card":0, "1 Pair":1, "2 Pair":2, "3 of a Kind":3, "Straight":4, "Flush":5, "Full House":6, "4 of a Kind":7, "Straight Flush":8, "Royal Flush":9}

//return an array containing a player's highest hand strength in each betting round
function getStrengthArray(playerCards, tableCards) {
    const strengthArray = [] 

    const playerRanks = [playerCards[0]["rank"], playerCards[1]["rank"]]
    const playerSuits = [playerCards[0]["suit"], playerCards[1]["suit"]]
    const tableRanks = [tableCards[0]["rank"], tableCards[1]["rank"], tableCards[2]["rank"], tableCards[3]["rank"], tableCards[4]["rank"]]
    const tableSuits = [tableCards[0]["suit"], tableCards[1]["suit"], tableCards[2]["suit"], tableCards[3]["suit"], tableCards[4]["suit"]]
    
    strengthArray.push(playerRanks[0]===playerRanks[1] ? "1 Pair" : "High Card") //pre-flop: only check if player has pair
    let highestRank = evaluateHand(playerRanks.concat(tableRanks.slice(0,3)), playerSuits.concat(tableSuits.slice(0,3)))
    strengthArray.push(highestRank) //flop: one possible combination of player cards and table cards
    const threeOutFour = [[0,1,3],[0,2,3],[1,2,3]] //possible combinations of 3 elements out of 4 elements, excluding [0, 1, 2]
    const threeOutFive = [[0,1,4],[0,2,4],[0,3,4],[1,2,4],[1,3,4],[2,3,4]] //possible combinations of 3 elements out of 5 elements, excluding previous 4 combinations
    for (const combination of threeOutFour) {  
        const rank = evaluateHand(playerRanks.concat([tableRanks[combination[0]],tableRanks[combination[1]],tableRanks[combination[2]]]), playerSuits.concat([tableSuits[combination[0]],tableSuits[combination[1]],tableSuits[combination[2]]]))
        if (strengthValues[rank]>strengthValues[highestRank]) highestRank = rank
    }
    strengthArray.push(highestRank) //Turn
    for (const combination of threeOutFive) {
        const rank = evaluateHand(playerRanks.concat([tableRanks[combination[0]],tableRanks[combination[1]],tableRanks[combination[2]]]), playerSuits.concat([tableSuits[combination[0]],tableSuits[combination[1]],tableSuits[combination[2]]]))
        if (strengthValues[rank]>strengthValues[highestRank]) highestRank = rank       
    }
    strengthArray.push(highestRank) //River
    strengthArray.push(highestRank) //Showdown

    return strengthArray
}

//return an integer to represent the strength for ease of comparison between hands 
function getStrengthValue(strength, cards, tableCards) {
    const base = 10*(cards[0]["rank"]+cards[1]["rank"]+tableCards[0]["rank"]+tableCards[1]["rank"]+tableCards[2]["rank"]+tableCards[3]["rank"]+tableCards[4]["rank"])
    return base+10**strengthValues[strength]
}

//Some game constants
const DECK = orderedDeck()
const roundName = ["PreFlop", "Flop", "Turn", "River", "Showdown"]
const smallestBet = 60 //the smallest amount of chips small blind has to bet
const NUM_PLAYERS = 5
const positionNames = ["Button", "SB", "BB"]

const initialChips = 1200

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
            nextPlayer: false,
        }
        //activate class functions that use setState
        this.playerResponded = this.playerResponded.bind(this)
        this.newRound = this.newRound.bind(this)
        this.onNextPlayer = this.onNextPlayer.bind(this)
        this.initializeGame()
    }

    getTwoCards(id, deck) {return [deck[id], deck[51-id]]} //get two cards from the top and bottom of the ramdomized deck.

    //return a list of player/players who can win the pot
    findWinner(playing, data) {
        const nowPlaying = playing
        const playersData = data
        //find highest strength value
        let highestValue = playersData[nowPlaying[0]]["strengthValue"]
        for (const id of nowPlaying) {
            if (playersData[id]["strengthValue"] > highestValue) highestValue = playersData[id]["strengthValue"] 
        }
        //find which players have the highest value
        const winnerIDs = []
        for (const id of nowPlaying) {
            if (playersData[id]["strengthValue"] === highestValue) winnerIDs.push(id)
        }
        return winnerIDs
    }

    initializeGame() {
        //initialize table
        const tableCardImages = []
        const tableCards = []
        for (let i=0; i<5; i++) {
            const card = this.state.deck[52/2+i*Math.pow(-1,i)]
            tableCardImages.push(card["image"])
            tableCards.push(card)
        }     
        this.state.tableData = {cards: tableCardImages, pot: smallestBet*3, numRevealed: 0}

        //initialize players
        const playersData = []
        const numPlayers = this.state.numPlayers
        for (let i=0; i<numPlayers; i++) {   
            let pos = null
            let initialBet = 0
            let chips = initialChips
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
            const cards = this.getTwoCards(i, this.state.deck)
            const cardImages = [cards[0]["image"], cards[1]["image"]]
            const strengths = getStrengthArray(cards, tableCards)

            playersData.push({id: i, position: pos, chips: chips, bet: initialBet, message: null, 
                cards: cardImages, turn: false, action: this.playerResponded, folded: false, strengths: strengths, 
                strengthValue: getStrengthValue(strengths[4], cards, tableCards), raised: 0
            })
        }
        //populate nowPlaying array starting from currPlayer
        for (let i=this.state.currPlayer; i<playersData.length; i++) {this.state.nowPlaying.push(i)}
        for (let i=0; i<this.state.currPlayer; i++) {this.state.nowPlaying.push(i)}

        playersData[this.state.currPlayer]["turn"] = true
        this.state.playersData = playersData
    } 

    
    //a new round (not a new betting round), new deck, but only players who haven't busted remain 
    newRound() {
        const deck = shuffledDeck()
        const playersData = [...this.state.playersData]
        let nowPlaying = []
        const tableData = {...this.state.tableData} //need new cards, reset numRevealed
        let button = null
        playersData[this.state.button]["position"] = null //null current button

        //update table data
        tableData["numRevealed"] = 0
        const tableCardImages = []
        const tableCards = []
        for (let i=0; i<5; i++) {
            const card = this.state.deck[52/2+i*Math.pow(-1,i)]
            tableCardImages.push(card["image"])
            tableCards.push(card)
        }     
        tableData["cards"] = tableCardImages
        tableData["pot"] = smallestBet*3

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
            const cards = this.getTwoCards(id, deck)
            const cardImages = [cards[0]["image"], cards[1]["image"]]
            playersData[id]["cards"] = cardImages
            playersData[id]["message"] = null
            playersData[id]["turn"] = id === nowPlaying[0] ? true : false
            playersData[id]["folded"] = false
            playersData[id]["bet"] = 0
            const strengths = getStrengthArray(cards, tableCards)
            playersData[id]["strengths"] = strengths
            playersData[id]["strengthValue"] = getStrengthValue(strengths, cards, tableCards)
            playersData[id]["raised"] = 0
            if (playersData[id]["position"]==="SB") {
                playersData[id]["bet"] = smallestBet
                playersData[id]["chips"] -= smallestBet
            } else if (playersData[id]["position"]==="BB") {
                playersData[id]["bet"] = smallestBet*2
                playersData[id]["chips"] -= smallestBet*2          
            }
        }

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
                }
            }

            this.setState({playersData: playersData, tableData: tableData, currPlayer: nextId, nowPlaying: nowPlaying, round: round, message: message, highestBet: highestBet, nextPlayer: true})
        }
    }

    render()  {
        //use playersData to map an array of Player Components
        const playerComponents = this.state.playersData.map(player => <Player id={player.id} 
            position={player.position}
            chips={player.chips}
            bet={player.bet}
            highestBet={this.state.highestBet}
            message={player.message}
            cards={player.cards}
            turn={player.turn}
            action={player.action}
            folded={player.folded}
            strengths={player.strengths}
            round={this.state.round}
            raised={player.raised}
        />)
        const table = this.state.tableData
        const tableComponent = <Table cards={table["cards"]} pot={table["pot"]} numRevealed={table.numRevealed}/>
        const newDeckButton = <div><h1>{this.state.message}</h1><button onClick={this.newRound}>New Deck</button></div>
        const gameStatus = <h4>Current Player:{this.state.currPlayer} Betting Round:{roundName[this.state.round]}</h4>

        return (
            <div>
                <hr/>
                {tableComponent}
                <hr/>
                {playerComponents}
                {this.state.round===4 ? newDeckButton : gameStatus}
                {this.state.nextPlayer &&  <button onClick={this.onNextPlayer}>Next Player</button>}
            </div>
        )
    }
}

export default Game;