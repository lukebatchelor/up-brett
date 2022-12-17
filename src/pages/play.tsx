/* eslint-disable @next/next/no-img-element */
import styles from "./play.module.css";
import { type NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";

const ROUND_TIME_SECS = 10;

type Guess = {
  type: "correct" | "incorrect" | "repeat";
  word: string;
};

type PlayingState = "Playing" | "Stopped";
type HighScore = { name: string; score: number };

const Play: NextPage = () => {
  const [upTowns, setUpTowns] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [playingState, setPlayingState] = useState<PlayingState>("Playing");
  const [secsRemaining, setSecsRemaining] = useState<number>(ROUND_TIME_SECS);
  const userInputRef = useRef<HTMLInputElement>(null);
  const [highScoreTable, setHighScoreTable] = useState<HighScore[] | null>(
    null
  );

  const displayMins = String(Math.floor(secsRemaining / 60)).padStart(2, "0");
  const displaySecs = String(secsRemaining - Number(displayMins) * 60).padStart(
    2,
    "0"
  );
  const correctGuesses = guesses.filter((g) => g.type === "correct");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (playingState === "Stopped") {
      if (!!highScoreTable) return;
      const name = userInputRef.current?.value || "anonymous";
      const score = correctGuesses.length;
      // set it to something to prevent double sending
      setHighScoreTable([]);
      postHighScore(name, score).then((highScores) =>
        setHighScoreTable(highScores)
      );
      return;
    }
    if (!userInputRef.current) return;
    const guess = userInputRef.current.value.toLowerCase().trim();
    userInputRef.current.value = "";
    if (guesses.some((prevGuess) => prevGuess.word === guess)) {
      setGuesses([...guesses, { type: "repeat", word: guess }]);
      return;
    }
    if (!upTowns.includes(guess)) {
      setGuesses([...guesses, { type: "incorrect", word: guess }]);
      return;
    }
    setGuesses([...guesses, { type: "correct", word: guess }]);
  }

  useEffect(() => {
    fetch("/up-towns.txt")
      .then((r) => r.text())
      .then((r) => setUpTowns(r.split("\n").map((line) => line.toLowerCase())));
  }, []);

  useInterval(
    () => {
      setSecsRemaining(secsRemaining - 1);
      if (secsRemaining === 1) {
        setPlayingState("Stopped");
        if (userInputRef.current) {
          userInputRef.current.value = "";
        }
      }
    },
    playingState === "Playing" ? 1000 : null
  );

  function addEl() {
    const type = ["correct", "incorrect", "repeat"][
      Math.floor(Math.random() * 3)
    ];
    if (type === "incorrect") {
      setGuesses([...guesses, { type, word: "incorrect" }]);
    } else if (type === "repeat") {
      const correct = guesses.filter((g) => g.type === "correct");
      const word = (
        correct[Math.floor(Math.random() * correct.length)] as Guess
      ).word;
      setGuesses([
        ...guesses,
        {
          type,
          word,
        },
      ]);
    } else if (type === "correct") {
      const word = upTowns[
        Math.floor(Math.random() * upTowns.length)
      ] as string;
      setGuesses([
        ...guesses,
        {
          type,
          word,
        },
      ]);
    }
  }

  function restart() {
    if (!!highScoreTable) {
      setHighScoreTable(null);
      setPlayingState("Playing");
      setGuesses([]);
      setSecsRemaining(ROUND_TIME_SECS);
      if (userInputRef.current) {
        userInputRef.current.value = "";
        userInputRef.current.click();
      }
    }
  }

  return (
    <>
      <Head>
        <title>What&apos;s UP Brett?</title>
        <meta
          name="description"
          content="Not much, what's up with you? 😂😂😂"
        />
        <meta name="HandheldFriendly" content="true" />
        <meta
          name="viewport"
          content="width=device-width, height=device-height, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main} onClick={restart}>
        {playingState === "Playing" && (
          <h2 className={styles.timerText}>
            {displayMins}:{displaySecs}
          </h2>
        )}
        {playingState === "Stopped" && (
          <h2 className={styles.timerText}>Game Over</h2>
        )}
        <h2 className={styles.scoreText}>
          {correctGuesses.length}/{upTowns.length}
        </h2>

        {!!highScoreTable && (
          <>
            <h4 style={{ marginTop: "20px", color: "gold" }}>High Scores</h4>
            <div
              className={styles.answersContainer}
              style={{
                marginTop: "20px",
                textAlign: "center",
                fontSize: "14px",
                gap: "6px",
              }}
            >
              {highScoreTable.map((row, idx) => (
                <li
                  key={idx}
                  style={{
                    fontWeight: row.name === "Brett" ? "800" : "normal",
                    fontSize: row.name === "Brett" ? "16px" : "14px",
                    color: row.name === "Brett" ? "gold" : "white",
                  }}
                >
                  {row.name} - {row.score}
                </li>
              ))}
            </div>
            <p style={{ color: "white", marginTop: "20px" }}>
              Click anywhere to play again
            </p>
          </>
        )}

        {!highScoreTable && (
          <div className={styles.answersContainer}>
            {guesses.map((guess, idx) => (
              <li
                key={idx}
                className={styles.answer}
                style={{
                  color:
                    guess.type === "correct"
                      ? "green"
                      : guess.type === "incorrect"
                      ? "red"
                      : "orange",
                }}
              >
                {guess.word}
              </li>
            ))}
          </div>
        )}
        {/* <div style={{ marginBlock: "40px", flexGrow: 1 }}>
          <p>Go!</p>
        </div> */}

        {!highScoreTable && (
          <form onSubmit={onSubmit} autoComplete="new-password">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                name="input"
                id="input"
                autoComplete="off"
                ref={userInputRef}
                className={styles.inputBox}
                placeholder={
                  playingState === "Playing"
                    ? "Enter town name..."
                    : "Enter your name"
                }
              />
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default Play;

// source: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current && savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => {
        clearInterval(id);
      };
    }
  }, [delay]);
}

async function postHighScore(name: string, score: number) {
  // const url = 'https://script.google.com/macros/s/AKfycbxAC1PhOcrDPLpvZpAmYu9aweQqYPKawn4aRsLm5nOA/dev';
  const url =
    "https://script.google.com/macros/s/AKfycbzKZHsVizQZYShLe7u7n7wmS0MldEaglBlb9BBZb5teYSqG6vT-_bzfYyaR__JfjZkE9Q/exec";
  return fetch(url, {
    method: "POST",
    redirect: "follow",
    body: JSON.stringify({ name, score }),
  })
    .then((r) => r.json())
    .then((r) => r.highscores)
    .catch((err) => alert(err));
}
