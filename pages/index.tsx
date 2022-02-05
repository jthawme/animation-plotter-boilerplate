import Head from "next/head";
import router, { useRouter } from "next/router";
import Image from "next/image";
import { ChangeEventHandler, useCallback, useRef, useState } from "react";
import { AnimationBase } from "../animations/base";
import { MainCanvas } from "../components/MainCanvas";
import styles from "../styles/Home.module.scss";

const listen = (
  el: Window | HTMLElement,
  evtType: string,
  cb: (...args: any) => void
) => {
  el.addEventListener(evtType, cb);

  return () => el.removeEventListener(evtType, cb);
};

export default function Home() {
  const animation = useRef<AnimationBase | null>(null);
  const unlisten = useRef<Array<() => void>>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [everyN, setEveryN] = useState(10);

  const router = useRouter();

  const onAnimationRef = useCallback((anim: AnimationBase) => {
    animation.current = anim;

    if (animation.current.el) {
      unlisten.current.push(
        listen(animation.current.el, "start", () => {
          setIsPlaying(true);
        })
      );
      unlisten.current.push(
        listen(animation.current.el, "stop", () => {
          setIsPlaying(false);
        })
      );
      unlisten.current.push(
        listen(animation.current.el, "frame", ({ detail }) => {
          setPercentage(detail.percentage);
        })
      );
    }
  }, []);

  const onSeek = useCallback<ChangeEventHandler<HTMLInputElement>>((e) => {
    animation.current?.seek(parseFloat(e.target.value));
  }, []);

  const onToggle = useCallback(() => {
    if (!isPlaying) {
      animation.current?.start();
    } else {
      animation.current?.stop();
    }
  }, [isPlaying]);

  const onDownload = useCallback(() => {
    animation.current?.saveOut(everyN);
  }, [everyN]);

  const onDownloadFrame = useCallback(() => {
    animation.current?.saveFrame();
  }, []);

  const onChangeEveryN = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setEveryN(parseInt(e.target.value));
    },
    []
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>Animation Boilerplate</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {router.query.anim && (
          <MainCanvas
            className={styles.canvas}
            animation={router.query.anim?.toString()}
            ref={onAnimationRef}
          />
        )}

        <div className={styles.controls}>
          <label>
            <span>Seek</span>
            <input type="range" min="0" max="1" step="0.01" onChange={onSeek} />
          </label>
          <label>
            <span>Every N frames (for saving): {everyN}</span>
            <input
              type="range"
              min="1"
              max="60"
              step="1"
              onChange={onChangeEveryN}
              value={everyN}
            />
          </label>

          <button onClick={onToggle}>{isPlaying ? "Pause" : "Play"}</button>
          <button onClick={onDownload} disabled={isPlaying}>
            Download
          </button>
          <button onClick={onDownloadFrame} disabled={isPlaying}>
            Download Frame
          </button>
        </div>
      </main>
    </div>
  );
}
