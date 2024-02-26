import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import * as icons from "react-icons/gi";
import { Tile } from "./Tile";
import CustomProgressBar from "./CustomProgressBar";

export const possibleTileContents = [
  icons.GiHearts,
  icons.GiWaterDrop,
  icons.GiDiceSixFacesFive,
  icons.GiUmbrella,
  icons.GiCube,
  icons.GiBeachBall,
  icons.GiDragonfly,
  icons.GiHummingbird,
  icons.GiFlowerEmblem,
  icons.GiOpenBook,
  icons.GiAbacus,
  icons.GiHalberdShuriken,
  icons.Gi3DStairs,
  icons.GiKaleidoscopePearls,
  icons.GiJasmine,
  icons.GiYinYang,
  icons.GiFireTail,
  icons.GiBoltCutter,
  icons.GiBowieKnife,
  icons.GiJetpack,
];

export const possibleBacks = [
  icons.GiMaze,
  icons.GiCrystalize,
  icons.GiForestCamp,
  icons.GiTribalGear,
  icons.GiFlowerPot,
  icons.GiAxeInLog,
  icons.GiBamboo,
  icons.GiCliffCrossing,
  icons.GiCaduceus,
];

export const levels = {
  easy: {
    tiles: 16,
    match: 2,
    timer: 40,
  },
  medium: {
    tiles: 24,
    match: 3,
    timer: 50,
  },
  hard: {
    tiles: 32,
    match: 4,
    timer: 60,
  },
};


export function StartScreen({ start, select }) {
  const [selectLevel, setSelectLevel] = useState(false);
  const levels = ["easy", "medium", "hard"];

  return (
    <div className="grid gap-8 justify-center p-12 items-center w-fit m-auto text-center bg-pink-50 text-pink-500 rounded-lg my-16">
      <h1 className="text-4xl font-bold">Memory</h1>
      <p>Flip over tiles looking for pairs</p>
      <button
        disabled={!selectLevel}
        onClick={start}
        className="bg-gradient-to-t from-pink-600 to-pink-400 p-2 w-fit px-12 rounded-full text-white m-auto shadow-md active:bg-pink-600 my-4 mb-12 text-xl disabled:from-pink-300 disabled:to-pink-300 disabled:shadow-none disabled:cursor-not-allowed"
      >
        Play
      </button>

      <p className="font-medium text-lg text-violet-500">Select difficulty</p>
      <div className="flex flex-row gap-4">
        {levels.map((level, i) => (
          <button
            onClick={() => {
              setSelectLevel(true);
              select(level);
            }}
            key={i}
            className={`rounded-md px-4 py-2 capitalize text-white bg-violet-500 font-semibold`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PlayScreen({ end, cards, level }) {
  const [tiles, setTiles] = useState(null);
  const [tryCount, setTryCount] = useState(0);
  const [resetProgress, setResetProgress] = useState(false);
  const [hintIndices, setHintIndices] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [timeScore, setTimeScore] = useState({ seconds: 0, minutes: 0 })
  const [status, setStatus] = useState('started')

  useEffect(() => {
    let calculateScore = null

    if (status === 'started') {
      calculateScore = setInterval(() => {
        setTimeScore(prevTimeScore => ({
          seconds: prevTimeScore.seconds >= 59 ? 0 : prevTimeScore.seconds + 1,
          minutes: prevTimeScore.seconds >= 59 ? prevTimeScore.minutes + 1 : prevTimeScore.minutes
        }))
      }, 1000)
    } else {
      clearInterval(calculateScore)
    }

    return () => clearInterval(calculateScore)
  }, [status])

  const highScores = JSON.parse(localStorage.getItem('highScores'))
  const highScore = highScores !== null ? highScores.find(highScore => highScore.level === level) : null
  // const highScore = Number(localStorage.getItem('highScore') || 0)
  console.log(highScores, highScore)

  const calculateHighScore = () => {
    const arr = new Array()
    arr
    if (highScores !== null && highScores.some(highScore => highScore.level === level)) {
      console.log('I made it')
      const highScoreMin = Math.floor(highScore.score / 60)
      const highScoreSec = highScoreMin > 0 ? ((highScore.score / 60) - highScoreMin) * 60 : highScore.score
      console.log(highScoreSec, highScoreMin)
      return { seconds: highScoreSec, minutes: highScoreMin}
    } else {
      return { seconds: 0, minutes: 0 }
    }
  }

  const [newHighScore, setNewHighScore] = useState(calculateHighScore())

  const changeCardBacks = useCallback(() => {
    let newCardBack =
      possibleBacks[Math.floor(Math.random() * possibleBacks.length)];

    while (tiles.some((tile) => tile.back === newCardBack)) {
      newCardBack =
        possibleBacks[Math.floor(Math.random() * possibleBacks.length)];
    }

    setTiles((prevTiles) =>
      prevTiles.map((tile) => ({ ...tile, back: newCardBack }))
    );
  }, [tiles]);

  useEffect(() => {
    if (tryCount % 5 === 0) {
      setShowHint(true);
      changeCardBacks();
    } else {
      setShowHint(false);
    }
  }, [tryCount]);

  const handleHintClick = () => {
    const randomIndices = [];
    while (randomIndices.length < 2) {
      const randomIndex = Math.floor(Math.random() * 16);
      if (
        !randomIndices.includes(randomIndex) &&
        tiles[randomIndex].state !== "matched"
      ) {
        randomIndices.push(randomIndex);
      }
    }

    setHintIndices(randomIndices);
    setTimeout(() => {
      setShowHint(false), setHintIndices([]);
    }, 2000);
  };

  const selectedLevel = levels[level];
  const matchCount = selectedLevel.match;
  const tileCount = selectedLevel.tiles;

  console.log(level, selectedLevel);

  const getTiles = (tileCount) => {
    console.log('ran')
    // Throw error if count is not even.
    if (tileCount % 2 !== 0) {
      throw new Error("The number of tiles must be even.");
    }

    // Use the existing list if it exists.
    if (tiles) return tiles;

    const pairCount = tileCount / matchCount;

    // Take only the items we need from the list of possibilities.
    const usedTileContents = cards.slice(0, pairCount);

    // Multiply the Array by the match count
    const modifiedTileContents = [];

    for (const tileContent of usedTileContents) {
      for (let i = 0; i < matchCount; i++) {
        modifiedTileContents.push(tileContent);
      }
    }

    console.log(modifiedTileContents, usedTileContents);

    // Double the array and shuffle it.
    const shuffledContents = modifiedTileContents
      .sort(() => Math.random() - 0.5)
      .map((content) => ({ content, back: null, state: "start" }));

    console.log(shuffledContents);

    setTiles(shuffledContents);
    return shuffledContents;
  };

  const flip = (i) => {
    // Is the tile already flipped? We don’t allow flipping it back.
    if (tiles[i].state === "flipped") return;

    // How many tiles are currently flipped?
    const flippedTiles = tiles.filter((tile) => tile.state === "flipped");
    const flippedCount = flippedTiles.length;

    // // Don't allow more than 2 tiles to be flipped at once.
    // if (flippedCount === 2) return;

    if (flippedCount === matchCount) return;

    // On the second flip, check if the tiles match.
    if (flippedCount === matchCount - 1) {
      setTryCount((c) => c + 1);

      // const alreadyFlippedTile = flippedTiles[0];
      const justFlippedTile = tiles[i];

      let newState = "start";

      if (
        flippedTiles.every((tile) => tile.content === justFlippedTile.content)
      ) {
        confetti({
          ticks: 100,
        });
        newState = "matched";
        setResetProgress(true);
      }

      // After a delay, either flip the tiles back or mark them as matched.
      setTimeout(() => {
        setTiles((prevTiles) => {
          const newTiles = prevTiles.map((tile) => ({
            ...tile,
            state: tile.state === "flipped" ? newState : tile.state,
          }));

          setResetProgress(false);
          // If all tiles are matched, the game is over.
          if (newTiles.every((tile) => tile.state === "matched")) {
            setStatus('stopped')
            const totalTimeScore = {
              level,
              score: timeScore.minutes * 60 + timeScore.seconds
            }
            if (highScore === null) {
              localStorage.setItem('highScores', JSON.stringify([totalTimeScore]))
            } else if (highScore === undefined || totalTimeScore < highScore.score) {
              localStorage.setItem('highScores', JSON.stringify([...highScores, totalTimeScore]))
            }
            setTimeout(end, 0);
          }

          return newTiles;
        });
      }, 1000);
    }

    setTiles((prevTiles) => {
      return prevTiles.map((tile, index) => ({
        ...tile,
        state: i === index ? "flipped" : tile.state,
      }));
    });
  };

  return (
    <div className="grid gap-8 justify-center items-center my-12 m-auto text-center text-indigo-500 w-fit">
      <div className="flex justify-between items-center">
        <p>
          Tries:{" "}
          <span className="bg-indigo-200 px-2 py-px rounded-md text-indigo-600">
            {tryCount}
          </span>
        </p>
        <p>
          Best Time:{" "}
          <span className="px-2 py-px bg-indigo-100 text-indigo-600 rounded-md">
            {newHighScore.minutes.toString().padStart(2, '0')}:{newHighScore.seconds.toString().padStart(2, '0')}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        <CustomProgressBar onReset={resetProgress} timer={selectedLevel.timer} end={end} />
        <p className="font-medium">{timeScore.minutes.toString().padStart(2, '0')}:{timeScore.seconds.toString().padStart(2, '0')}</p>
      </div>

      <div className="grid grid-cols-4 gap-3 rounded-lg p-4 w-fit bg-indigo-50">
        {getTiles(tileCount).map((tile, i) => (
          <Tile
            key={i}
            flip={() => flip(i)}
            {...tile}
            hint={showHint && hintIndices.includes(i)}
          />
        ))}
      </div>
      <button
        disabled={!showHint}
        onClick={handleHintClick}
        className={`w-fit bg-indigo-400 text-white rounded-md mx-auto text-xl px-12 py-3 disabled:opacity-50 disabled:cursor-not-allowed ${
          showHint ? "animate__animated animate__rubberBand" : ""
        }`}
      >
        Hint
      </button>
    </div>
  );
}

export function CardScreen({ play, getCards }) {
  const [selectedCards, setSelectedCards] = useState([]);

  const selectCard = (index) => {
    const newCard = possibleTileContents[index];
    if (!selectedCards.includes(newCard)) {
      setSelectedCards([...selectedCards, newCard]);
    }
  };

  useEffect(() => {
    if (selectedCards.length === 8) {
      setTimeout(() => {
        getCards(selectedCards);
        play();
      }, 0);
    }
  }, [selectedCards]);

  return (
    <div className="grid justify-center items-center gap-8 text-center my-12">
      <p className="text-purple-500">Select 8 Cards</p>
      <div className="grid grid-cols-4 gap-4 bg-purple-100 text-white p-4 rounded-lg">
        {possibleTileContents.map((card, i) => (
          <Card key={i} content={card} select={() => selectCard(i)} />
        ))}
      </div>
    </div>
  );
}

function Card({ content: Content, select }) {
  const [selected, setSelected] = useState(false);

  return (
    <div
      className={`w-16 h-16 p-2 rounded-lg ${
        selected ? "bg-purple-300" : "bg-purple-500"
      }`}
      onClick={() => {
        select();
        setSelected(true);
      }}
    >
      <Content
        style={{
          display: "inline-block",
          width: "100%",
          height: "100%",
          verticalAlign: "top",
        }}
      />
    </div>
  );
}
