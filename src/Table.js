import React from "react";

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

export default Table