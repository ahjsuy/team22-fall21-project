import React from "react";

//Card Component: <Card rank="" suit=""/> (ranks: 1,2...jack,queen,king,ace; suits: clubs,spades,hearts,diamonds)
function Card(props) {
    return (
      <img src={"./cards/" + props.rank + "_of_" + props.suit + ".png"}  width="100" height="150"/>
    )
}

export default Card