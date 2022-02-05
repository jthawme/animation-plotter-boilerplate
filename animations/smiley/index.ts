import { AnimationBase, AnimationOptions, DrawEvent } from "../base";
import { c, p, r } from "../utilities/abstractions";
import { AnimationValueObject, keyframeValue } from "../utilities/animations";

class Smiley extends AnimationBase {
  constructor(opts: Partial<AnimationOptions>) {
    super({
      ...opts,
      debug: true,
      totalFrames: 300,
      withMark: false,
    });
  }

  preload() {
    const { milliseconds, paper } = this.utils();

    const round = keyframeValue(-1, [{ value: 1 }, { value: -1 }], {
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

    const smileyGroup = new paper.Group();
    const outer = new paper.Path.Circle(p(w(0.5), h(0.5)), w(0.5));

    const eyes = new paper.Group();
    const eye = new paper.Path.Ellipse(r(0, 0, w(0.05), h(0.05)));
    const leftEye = eye.clone();
    const rightEye = eye.clone();
    leftEye.position = p(0, 0);
    rightEye.position = p(w(0.25), 0);
    eyes.addChildren([leftEye, rightEye]);
    eyes.position = p(w(0.5), h(0.35));
    eye.remove();

    const MOUTH_WIDTH = 0.6;
    const MOUTH_HEIGHT = 0.2;
    const mouthLine = new paper.Path([
      new paper.Segment(p(0, 0)),
      new paper.Segment(p(w(0.3 * MOUTH_WIDTH), h(round.get() * MOUTH_HEIGHT))),
      new paper.Segment(p(w(0.7 * MOUTH_WIDTH), h(round.get() * MOUTH_HEIGHT))),
      new paper.Segment(p(w(1 * MOUTH_WIDTH), 0)),
    ]);
    mouthLine.position = p(w(0.5), h(0.65));
    mouthLine.smooth({
      type: "continuous",
    });

    smileyGroup.addChildren([outer, eyes, mouthLine]);
    smileyGroup.strokeColor = c("red");

    group.addChild(smileyGroup);
  }
}

export default Smiley;
