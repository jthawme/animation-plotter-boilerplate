import { AnimationBase, AnimationOptions, DrawEvent } from "../base";
import { makeNoise2D } from "fast-simplex-noise";
import { c, p } from "../utilities/abstractions";
import { AnimationValueObject, keyframeValue } from "../utilities/animations";
import { clamp } from "../utilities/utils";

const ROWS = 30;
const YPERC = 0.8;

const randomBetween = (max: number, min = 0) => {
  return Math.random() * (max - min) + min;
};

const splitLineOut = (
  path: paper.Path,
  percentageStart: number,
  percentageEnd: number
) => {
  const keep = path.clone();
  const end = keep.splitAt(path.length * percentageEnd);

  const middle = keep.splitAt(path.length * percentageStart);
  // .splitAt(path.length * percentageEnd);
  const start = keep.clone();

  if (start) {
    start.strokeColor = c("blue");
  }

  if (middle) {
    middle.strokeColor = c("orange");
  }

  if (end) {
    end.strokeColor = c("blue");
  }

  return { start, middle, end };
};

class LineChase extends AnimationBase {
  constructor(opts: Partial<AnimationOptions>) {
    super({
      ...opts,
      debug: true,
      totalFrames: 350,
      withMark: false,
    });
  }

  preload() {
    const { w, h, paper, milliseconds } = this.utils();

    const linePerc = keyframeValue(
      0,
      [
        { value: 0.5, easing: "easeOutCubic" },
        { value: 1, easing: "easeInCubic" },
      ],
      {
        easing: "easeOutCubic",
        autoplay: false,
        duration: milliseconds(0.7),
        endDelay: milliseconds(0.3),
      }
    );
    this.store("linePerc", linePerc);

    const space = h(YPERC / ROWS);

    const main = new paper.Path();
    main.add(p(w(randomBetween(0, 0.25)), 0));

    const HANDLE_OFFSET = (1 / ROWS) * 0.5;

    for (let y = 0; y < ROWS; y++) {
      if (y % 2 === 0) {
        const r = randomBetween(0.75, 0.95);
        main.add(p(w(r), y * space));
        main.cubicCurveTo(
          p(w(r + HANDLE_OFFSET), y * space),
          p(w(r + HANDLE_OFFSET), (y + 1) * space),
          p(w(r), (y + 1) * space)
        );
      } else {
        const r = randomBetween(0.05, 0.25);
        main.add(p(w(r), y * space));

        if (y !== ROWS - 1) {
          main.cubicCurveTo(
            p(w(r - HANDLE_OFFSET), y * space),
            p(w(r - HANDLE_OFFSET), (y + 1) * space),
            p(w(r), (y + 1) * space)
          );
        }
      }
    }

    main.strokeColor = c("blue");
    main.remove();
    main.position.y = h(0.5);

    this.store("line", main);

    return Promise.resolve();
  }

  draw({ percentage, group, frame }: DrawEvent) {
    const { w, h, paper, asset } = this.utils();

    const linePerc: AnimationValueObject = asset("linePerc");
    linePerc.seek(percentage);

    const endPerc = clamp(linePerc.get(), 0, 1);

    linePerc.seek(percentage - 0.2);
    const startPerc = clamp(linePerc.get(), 0, 1);

    const main: paper.Path = asset("line");

    const { start, middle, end } = splitLineOut(main, startPerc, endPerc);

    group.addChildren([start, middle, end]);
    // group.addChildren([start, end]);
    // group.addChild(end);
  }
}

export default LineChase;
