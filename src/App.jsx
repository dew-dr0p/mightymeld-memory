import { useState } from "react";
import { StartScreen, PlayScreen, CardScreen } from "./Screens";

function App() {
  const [gameState, setGameState] = useState("start");
  const [cards, setCards] = useState(null);
  const [level, setLevel] = useState('');

  switch (gameState) {
    case "start":
      return <StartScreen start={() => setGameState("card")} select={(level) => setLevel(level)} />;
    case "card":
      return <CardScreen play={() => setGameState("play")} getCards={cards => setCards(cards)} />
    case "play":
      return <PlayScreen end={() => setGameState("start")} cards={cards} level={level} />;
    default:
      throw new Error("Invalid game state " + gameState);
  }
}

export default App;
