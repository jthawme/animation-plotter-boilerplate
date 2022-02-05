import { AnimationBase, AnimationOptions, DrawEvent } from "../base";
import { makeNoise2D } from "fast-simplex-noise";
import { c, p } from "../utilities/abstractions";
import { AnimationValueObject, keyframeValue } from "../utilities/animations";

const PARTS = 15;
const ROWS = 15;

class DashLines extends AnimationBase {
  noise: any;

  constructor(opts: Partial<AnimationOptions>) {
    super({
      ...opts,
      debug: true,
      totalFrames: 300,
    });

    this.noise = makeNoise2D();
  }

  preload() {
    const { milliseconds, paper } = this.utils();

    const round = keyframeValue(0, [{ value: 1 }, { value: 0 }], {
      easing: "linear",
      autoplay: false,
      duration: milliseconds(1),
    });
    this.store("round", round);

    return Promise.resolve();
  }

  draw({ percentage, group, frame }: DrawEvent) {
    const { w, h, paper, asset } = this.utils();

    const round: AnimationValueObject = asset("round");
    round.seek(percentage);
    const modFrame = frame % this.options.totalFrames;

    for (let y = 0; y < ROWS; y++) {
      const lineArr = new Array(PARTS).fill(0).map((v, idx) => {
        const l = new paper.Path.Line(
          p(w(idx * (1 / PARTS)), 0),
          p(
            w(
              (idx + this.noise(idx / 150 + modFrame / 500, y / 50)) *
                (1 / PARTS)
            ),
            0
          )
        );

        l.rotate(this.noise(idx / 150 + modFrame / 500, y / 50) * 180);

        return l;
      });

      const cp = new paper.CompoundPath({
        strokeColor: c("blue"),
        children: lineArr,
      });

      cp.position = p(w(0.5), h(y / ROWS + 0.5 / ROWS));
      group.addChild(cp);
    }
  }
}

export default DashLines;
