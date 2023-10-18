import './App.css';
import { useState, useRef, useEffect } from "react";

function Column({values, columnId}) {
  return values.map((value, i) => 
      <div className={'rounded-full w-12 h-12 border-2 border-black ' + (value === 1 ? 'bg-red-600' :  (value === 2 ? 'bg-yellow-600' : 'bg-white')) } key={`piece-${columnId}-${i}`}></div>
  )
}

function Grid({columns}) {
  return (
    <div className="flex gap-2 px-4 py-2">
      {columns.map((column, i) => {
        return(
            <div className="flex flex-col-reverse gap-2" key={`column-container-${i}`}>
              <Column values={column} columnId={i}></Column>
            </div>
        )
      })}
    </div>
  )
}

export default function Game() {
  const [columns, setColumns] = useState(Array(7).fill().map(()=>Array(6).fill()));
  const [redIsNext, setRedIsNext] = useState(true);
  const [status, setStatus] = useState("Red player's turn")
  const [gameOver, setGameOver] = useState(false);

  const [seconds, setSeconds] = useState(10);

  const timerId = useRef();
  const countdownId = useRef();

  useEffect(() => { 
    startCountdown();
  }, []);

  const startCountdown = () => {
    clearInterval(countdownId.current);
    countdownId.current = setInterval(() => {
      endGame();
    }, 10000);

    setSeconds(10);
    clearInterval(timerId.current);
    timerId.current = setInterval(() => {
      setSeconds(prev => prev - 1)
    }, 1000)
  }

  const endGame = () => {
    clearInterval(countdownId.current);
    clearInterval(timerId.current);
    if (checkWinner(columns, (redIsNext ? 1 : 2))) {
      setStatus(`Player ${redIsNext ? "red" : "yellow"} is a winner!`);
    } else {
      setStatus('Game is over because time expired')
    }
    setGameOver(true);
  }

  // insert a piece into a column
  function handleInsert(i) {
    const newColumns = columns.slice();
    for(let j = 0; j < columns[i].length; j++ ){
      if(!columns[i][j]) {
        if (gameOver) {
          return;
        }

        newColumns[i][j] = redIsNext ? 1 : 2;

        if (checkWinner(columns, (redIsNext ? 1 : 2))) {
          endGame();
          return
        }

        setRedIsNext(!redIsNext);
        if (!redIsNext) {
          setStatus("Red player's turn")
        } else {
          setStatus("Yellow player's turn")
        }

        startCountdown();
        setColumns(newColumns);

        return;
      }
    }
  }

  const resetGame = () => {
    setColumns(Array(7).fill().map(()=>Array(6).fill()));
    setGameOver(false);
    setRedIsNext(true);
    setStatus("Red player's turn");
    startCountdown();
  }

  let buttonRow = columns.map((col, i) => 
    <button 
      className='bg-black text-white p-2 w-12'
      onClick={() => handleInsert(i)}
      key={`insertBtn-${i}`}
      >↓
    </button>
  )

  return (
    <div className="App max-w-md mx-auto">
      <h2>{status} {!gameOver && '(' + seconds + ')'}</h2>
      <div className='flex gap-2 px-6 py-2'>
        {buttonRow}
      </div>
      {/* Board */}
      <section className="bg-sky-500 px-2 py-2 rounded-lg border-4 border-black">
        <Grid columns={columns} onPlay={handleInsert}></Grid>
      </section>
      <section>
        <button className='bg-red-600 px-3 py-2 mx-auto block mt-5' onClick={resetGame}>Start Over</button>
      </section>
    </div>
  );
}

function checkWinner(board, player) {
  // vertical check
  for(let i = 0; i < board.length; i++) {
    for(let j = 0; j < board[0].length-3; j++) {
      if(board[i][j] === player && board[i][j+1] === player && board[i][j+2] === player && board[i][j+3] === player) {
        return true
      }
    }
  }
  
  // horizontal check
  for(let i = 0; i < board.length-3; i++) {
    for(let j = 0; j < board[0].length; j++) {
      if(board[i][j] === player && board[i+1][j] === player && board[i+2][j] === player && board[i+3][j] === player) {
        return true
      }
    }
  }

  // ascending diagonal check
  for(let i = 0; i < board.length-3; i++) {
    for(let j = 0; j < board[0].length-3; j++) {
      if(board[i][j] === player && board[i+1][j+1] === player && board[i+2][j+2] === player && board[i+3][j+3] === player) {
        return true
      }
    }
  }

  // descending diagonal check
  for(let i = 0; i < board.length-3; i++) {
    for(let j = board[0].length-1; j > 2; j--) {
      if(board[i][j] === player && board[i+1][j-1] === player && board[i+2][j-2] === player && board[i+3][j-3] === player) {
        return true
      }
    }
  }

  return false;
}