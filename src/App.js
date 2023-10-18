import './App.css';
import { useState, useRef, useEffect } from "react";

function Column({values, columnId, redIsNext, onPlay, gameOver}) {
  const [isHovered, setIsHovered] = useState(false);

  let discs = values.map((value, i) => 
    {
      let bgColor;
      
      switch(value) {
        case 1:
          bgColor = 'bg-red-600 animate-new-piece';
          break;
        case 2:
          bgColor = 'bg-yellow-500 animate-new-piece';
          break;
        default:
          if (isHovered && !value && (values[i-1] || i===0) && !gameOver) {
            if (redIsNext) {
              bgColor = 'bg-red-600';
            } else {
              bgColor = 'bg-yellow-500';
            }
          } else if (!value) {
            bgColor = 'bg-white';
          }
      }
      
      return <>
        <div className={'rounded-full w-14 h-14 m-3 ' + bgColor } 
        key={`piece-${columnId}-${i}`}></div>
      </>
    }
  )

  return(
    <div className={"flex flex-col-reverse rounded-3xl " + (isHovered && !gameOver && "bg-blue-500")} 
    onClick = {() => onPlay(columnId)}
    onMouseOver={() => {
      setIsHovered(true);
    }}
    onMouseLeave={() => {
      setIsHovered(false);
    }}
    >
      {discs}
    </div>
)
}

function Grid({columns, redIsNext, onPlay, gameOver}) {
  return (
    <div className={"flex " + (!gameOver && 'hover:cursor-pointer')}>
      {columns.map((column, i) => {
        return(
            <div className={"flex flex-col-reverse rounded-3xl "} 
            key={`column-container-${i}`}>
              <Column values={column} columnId={i} redIsNext={redIsNext} onPlay={onPlay} gameOver={gameOver}></Column>
            </div>
        )
      })}
    </div>
  )
}

export default function Game() {
  const [columns, setColumns] = useState(Array(7).fill().map(()=>Array(6).fill()));
  const [redIsNext, setRedIsNext] = useState(true);
  const [status, setStatus] = useState(0) // 0 -> in progress, 1 -> player 1 wins, 2 -> player 2 wins, 3 -> game over cuz time expired
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
      setStatus(redIsNext ? 1 : 2);
    } else {
      setStatus(3)
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
    setStatus(0);
    startCountdown();
  }

  return (
    <div className="App bg-zinc-300 min-h-screen pt-3">
      <div className='w-fit mx-auto '>
        <section className='my-3'>
          <button className='bg-zinc-400 rounded-3xl px-3 py-2 block ml-auto' onClick={resetGame}>RESTART</button>
        </section>

        <section className='flex justify-between my-3'>
          <div className='w-fit px-10 py-6 rounded-xl bg-red-600'>
            <span className='text-2xl'>PLAYER 1</span>
          </div>
          <div className='w-fit px-10 py-6 rounded-xl bg-yellow-500'>
          <span className='text-2xl'>PLAYER 2</span>
          </div>
        </section>

        {/* Board */}
        <section className="bg-blue-800 mx-auto rounded-3xl">
          <Grid columns={columns} onPlay={handleInsert} redIsNext={redIsNext} gameOver={gameOver}></Grid>
        </section>

        {/* Timer Section */}
        <section className={'w-max text-center mx-auto px-3 py-2 mt-5 ' + (redIsNext ? 'bg-red-300 ' : 'bg-yellow-500 ')}>
          {!gameOver &&
            <h2>PLAYER {redIsNext && " 1'S TURN"} {!redIsNext && " 2'S TURN"}</h2>
          }
          {
            (status===1) && <h2>PLAYER 1 WINS</h2>
          }
          {
            (status===2) && <h2>PLAYER 2 WINS</h2>
          }
          {
            (status===3) && <h2>GAME OVER</h2>
          }
          {!gameOver &&
            <>
              <span className="text-3xl">{seconds}</span>
              <span>s</span>
            </>
          }
        </section>
      </div>
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