
import React from 'react';
import './App.css';


//Card Component: <GetCard rank="" suit=""/> (ranks: 1,2...jack,queen,king,ace; suits: clubs,spades,hearts,diamonds)
function Card(props) {
  return (
    <img src={"./cards/" + props.rank + "_of_" + props.suit + ".png"}  width="100" height="150"/>
  )
}

class App extends React.Component {
  render()  {
    return (
      <div>
        <h2>lol</h2>
        <Card rank="2" suit="hearts"/><Card rank="ace" suit="clubs"/>
      </div>
    )
  }
}

export default App;
