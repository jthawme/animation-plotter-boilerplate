import { AnimationBase, AnimationOptions, DrawEvent } from "../base";
import { makeNoise2D } from "fast-simplex-noise";
import { c, p } from "../utilities/abstractions";

const COLS = 30;
const ROWS = 30;
const LOWER_THRESHOLD = 0.1;

class GradientAnimation extends AnimationBase {
  noiseR: any;
  noiseG: any;
  noiseB: any;

  constructor(opts: Partial<AnimationOptions>) {
    super({
      ...opts,
      debug: true,
      totalFrames: 280,
      withMark: false,
    });

    this.noiseR = makeNoise2D();
    this.noiseG = makeNoise2D();
    this.noiseB = makeNoise2D();
  }

  // preload() {
  // }

  draw({ percentage, group, frame }: DrawEvent) {
    const { w, h, paper } = this.utils();

    const modFrame = frame % this.options.totalFrames;

    const r = new paper.Group();
    const g = new paper.Group();
    const b = new paper.Group();

    const rads = [
      (x: number, y: number) => this.noiseR(x / 100 + modFrame / 300, y / 50),
      (x: number, y: number) => this.noiseG(x / 100 + modFrame / 200, y / 50),
      (x: number, y: number) => this.noiseB(x / 100 + modFrame / 100, y / 50),
    ];
    // const groups = [r, g, b];
    const groups = [r, g, b];

    groups.forEach((gr, idx) => {
      const circs = [];

      for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
          const rad = w(1 / COLS) / 2;
          const actualRad = rad * rads[idx](x, y);

          if (actualRad > LOWER_THRESHOLD) {
            const circ = new paper.Path.Circle(
              p(w(x / COLS) + rad, h(y / ROWS) + rad),
              actualRad
            );
            circs.push(circ);
          }
        }
      }

      gr.addChild(
        new paper.CompoundPath({
          children: circs,
        })
      );
    });

    r.strokeColor = c("cyan");
    r.strokeWidth = 3;
    g.strokeColor = c("magenta");
    g.strokeWidth = 3;
    b.strokeColor = c("yellow");
    b.strokeWidth = 3;

    group.addChildren([r, g, b]);
  }
}

export default GradientAnimation;
