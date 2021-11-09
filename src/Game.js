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
//props={cards, pot, numRevealed}
function Table (props) {
    const cards = []
    for (let i=0; i<props.numRevealed; i++) {cards.push(props.cards[i])}

    return (
        <div>
            <h2>Table</h2>
            <div>
                {cards}
            </div>
            <h3>Pot: {props.pot}</h3>
        </div>
    )
}

//Player Component
//props={id, position, chips, bet, message, cards, turn, action, folded}
function Player(props) {
    if (!props.folded) {
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
    return (
        <div>
            <h3>Player{props.id} {props.position} {props.message} Chips:{props.chips} Bet:{props.bet}</h3>
            <hr/>
        </div>
    );
}


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
            playersData.push({
                id: i,
                position: pos,
                chips: chips,
                bet: initialBet,
                message: null,
                cards: this.getTwoCards(i, this.state.deck),
                turn: false,
                action: this.playerResponded,
                folded: false,
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

        //Find the next button and count how many players still remain
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
        } else { } //game ends when there is only one player remaining

        //rearrange nowPlaying by having first to act player stay at index 0
        const nowPlayingCopy = []
        for (let i=firstToAct; i<nowPlaying.length; i++) nowPlayingCopy.push(nowPlaying[i])
        for (let i=0; i<firstToAct; i++) nowPlayingCopy.push(nowPlaying[i])
        nowPlaying = nowPlayingCopy
        
        //update remaining players' other properties
        for (const playerId of nowPlaying) {
            playersData[playerId]["cards"] = this.getTwoCards(playerId, deck)
            playersData[playerId]["message"] = null
            playersData[playerId]["turn"] = playerId === nowPlaying[firstToAct] ? true : false
            playersData[playerId]["folded"] = false
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
                tableData["pot"] += player["bet"] 
                player["chips"] -= player["bet"]       
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

    //props={id, position, chips, bet, message, cards, turn, action, folded}
    render()  {
        //use playerData to create an array of Player Components
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
        return (
            <div>
                <Table cards={table["cards"]} pot={table["pot"]} numRevealed={table.numRevealed}/>
                <hr/>
                <h4>Current Player:{this.state.currPlayer} Round:{roundName[this.state.round]}</h4>
                <hr/>
                {playerComponents}
            </div>
        )
    }
}

export default Game;