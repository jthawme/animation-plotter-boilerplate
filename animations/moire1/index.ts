import { AnimationBase, AnimationOptions, DrawEvent } from "../base";
import { makeNoise2D } from "fast-simplex-noise";
import { c, p } from "../utilities/abstractions";
import { AnimationValueObject, keyframeValue } from "../utilities/animations";

const PARTS = 25;
const ROWS = 15;

class Moire1 extends AnimationBase {
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

    const round = keyframeValue(-0.25, [{ value: 1.25 }], {
      easing: "easeInOutCubic",
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

    const boundingRectangle = new paper.Path.Rectangle(p(0, 0), p(w(1), h(1)));

    const circleGroup = new Array(PARTS).fill(0).map((v, idx) => {
      // const c = new paper.Path.Circle(p(0, 0), w(2 * (idx / PARTS)));
      const c = new paper.Path.Circle(
        p(w(round.get()), h(round.get())),
        w(2 * (idx / PARTS))
      );

      return c.intersect(boundingRectangle);
    });

    const circleGroup2 = new Array(PARTS).fill(0).map((v, idx) => {
      // const c = new paper.Path.Circle(p(0, 0), w(2 * (idx / PARTS)));
      const c = new paper.Path.Circle(
        p(w(1 - round.get()), h(1 - round.get())),
        w(2 * (idx / PARTS))
      );

      return c.intersect(boundingRectangle);
    });

    const g = new paper.Group();
    g.addChildren(circleGroup);
    g.addChildren(circleGroup2);
    g.strokeColor = c("black");
    g.strokeWidth = 10;

    // const cp1 = new paper.CompoundPath({
    //   children: circleGroup,
    //   strokeColor: c("black"),
    //   strokeWidth: 10,
    // });

    // const cp2 = new paper.CompoundPath({
    //   children: circleGroup2,
    //   strokeColor: c("black"),
    //   strokeWidth: 10,
    // });

    // const circ1 = cp.clone();
    // const circ2 = cp.clone();

    // circ1.position = p(w(round.get()), h(round.get()));
    // circ2.position = p(w(1 - round.get()), h(1 - round.get()));

    // cp.remove();

    // group.addChildren([circ1, circ2]);
    group.addChildren(circleGroup);
    group.addChildren(circleGroup2);
    group.strokeColor = c("black");
  }
}

export default Moire1;
