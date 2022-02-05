import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimationBase, AnimationOptions } from "../../animations/base";

import styles from "./MainCanvas.module.scss";

interface MainCanvasProps {
  animation: string;
  className?: string;
}

const MainCanvas = React.forwardRef<AnimationBase, MainCanvasProps>(
  ({ animation, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const debugRef = useRef<HTMLDivElement | null>(null);
    const animationRef = useRef<AnimationBase | null>(null);
    const unlistenRef = useRef<Array<() => void>>([]);

    const onCanvasRef = useCallback(
      (el: null | HTMLCanvasElement) => {
        if (el) {
          canvasRef.current = el;

          import(`../../animations/${animation}`)
            .then(({ default: AnimationModule }) => {
              const options: Partial<AnimationOptions> = {
                canvas: el,
              };

              const animation: AnimationBase = new AnimationModule(options);
              animation.start();

              if (debugRef.current) {
                animation.setDebugElement(debugRef.current);
              }

              animationRef.current = animation;
              // eslint-disable-next-line react-hooks/exhaustive-deps
              if (typeof ref === "function") {
                ref(animation);
              }
            })
            .catch((e) => console.log("is it an error here?"));
        }
      },
      [animation, ref]
    );

    useEffect(() => {
      return () => {
        animationRef.current?.destroy();
        unlistenRef.current.forEach((cb) => cb());
      };
    }, []);

    return (
      <>
        <canvas ref={onCanvasRef} className={className} />
        <div className={styles.debug} ref={debugRef} />
      </>
    );
  }
);

MainCanvas.displayName = "MainCanvas";

export { MainCanvas };
