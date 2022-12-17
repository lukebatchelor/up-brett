/* eslint-disable @next/next/no-img-element */
import styles from "./index.module.css";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>What&apos;s UP Brett?</title>
        <meta
          name="description"
          content="Not much, what's up with you? 😂😂😂"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles["main-container"]}>
          <Avatar />
          <div className="flex-col">
            <h1 className={styles.title}>
              What&apos;s <span className={styles.highlight}>Up</span> Brett?
            </h1>
            <h3 className="">Reckon you&apos;ve been everywhere man?</h3>
            <p className="">
              Your goal is to name as many West Australian towns that end in
              &quot;up&quot; as you can.
            </p>
            <p>See if you can beat the Otter like no other!</p>
          </div>
          <div>
            <Link className={styles.playButton} href="/play">
              Play
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

const FACES = [
  "face-01.png",
  "face-02.png",
  "face-03.png",
  "face-04.png",
  "face-05.png",
  "face-06.png",
  "face-07.png",
  "face-08.png",
];
function Avatar() {
  const [curFaceIdx, setCurFaceIdx] = useState<number>(0);
  const imgUrl = `/faces/${FACES[curFaceIdx]}`;

  // preload all the faces when we mount
  useEffect(() => {
    FACES.forEach((face) => {
      const img = new Image();
      img.src = `/faces/${face}`;
    });
  }, []);

  const onClick = () => {
    setCurFaceIdx(Math.floor(Math.random() * FACES.length));
  };

  return (
    <img
      className={styles.avatar}
      src={imgUrl}
      alt="What's up Brett?"
      onClick={onClick}
      style={{ height: "200px", width: "200px" }}
    ></img>
  );
}

export default Home;
