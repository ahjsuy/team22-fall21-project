import React from "react";

//Player Component
//props={id, position, chips, bet, message, cards, turn, action, folded, strengths, round, highestBet}
function Player(props) {
    if (!props.folded) {
        return (
            <div>
                <h3>Player{props.id} [{props.position}] {props.message} [Chips:{props.chips-props.bet}] [Bet:{props.bet}] {(props.raised>0) && <div>Raise bet to:{props.raised+props.bet}</div>}</h3> 
                {
                    props.turn &&
                    <div>
                    <div>
                        {props.cards} {props.strengths[props.round]}
                    </div>
                    {
                        props.round!==4 &&
                        <div>
                            <button onClick={() => props.action(props.id, "Check/Call")}>Check/Call</button>
                            <button onClick={() => props.action(props.id, "Fold")}>Fold</button>
                            {(props.bet+props.raised > props.highestBet) && <button onClick={() => props.action(props.id, "Raise")}>Raise</button>}
                            <button onClick={() => props.action(props.id, "Increase")}>Increase bet</button>
                        </div>
                    }
                    </div>
                }
                <hr/>
            </div>
        )
    }
    return (
        <div>
            <h3>Player{props.id} [{props.position}] {props.message} [Chips:{props.chips}] [Bet:{props.bet}]</h3>
            <hr/>
        </div>
    );
}

export default Player