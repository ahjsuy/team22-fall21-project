import React from "react";

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

export default Player