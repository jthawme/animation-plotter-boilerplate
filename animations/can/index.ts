import { AnimationBase, AnimationOptions, DrawEvent } from "../base";
import { c, loadSvg, p } from "../utilities/abstractions";
import {
  animationValue,
  AnimationValueObject,
  keyframeValue,
} from "../utilities/animations";
import C from "!!raw-loader!./assets/c.svg";
import A from "!!raw-loader!./assets/a.svg";
import N from "!!raw-loader!./assets/n.svg";
import { halftone } from "../utilities/raster";

class CanAnimation extends AnimationBase {
  compoundPath: paper.CompoundPath | null = null;

  constructor(opts: Partial<AnimationOptions>) {
    super({
      ...opts,
      debug: true,
      totalFrames: 150,
    });
  }

  preload() {
    const { milliseconds, paper } = this.utils();

    const scaleX1 = keyframeValue(
      0,
      [
        { value: 1, easing: "easeOutElastic", duration: milliseconds(0.65) },
        { value: 0, easing: "easeInSine" },
      ],
      {
        // easing: 'easeInOutBounce',
        autoplay: false,
        duration: milliseconds(0.7),
        endDelay: milliseconds(0.3),
        // delay: milliseconds(0.5),
      }
    );
    this.store("scaleX1", scaleX1);

    const scaleX2 = keyframeValue(
      0,
      [
        { value: 1, easing: "easeOutElastic", duration: milliseconds(0.65) },
        { value: 0, easing: "easeInSine" },
      ],
      {
        // easing: 'easeInOutBounce',
        autoplay: false,
        duration: milliseconds(0.7),
        endDelay: milliseconds(0.15),
        delay: milliseconds(0.15),
      }
    );
    this.store("scaleX2", scaleX2);

    const scaleX3 = keyframeValue(
      0,
      [
        { value: 1, easing: "easeOutElastic", duration: milliseconds(0.65) },
        { value: 0, easing: "easeInSine" },
      ],
      {
        // easing: 'easeInOutBounce',
        autoplay: false,
        duration: milliseconds(0.7),
        // endDelay: milliseconds(0.5),
        delay: milliseconds(0.3),
      }
    );
    this.store("scaleX3", scaleX3);

    const scaleC1 = keyframeValue(0, [{ value: 1 }, { value: 0 }], {
      easing: "easeInOutCubic",
      autoplay: false,
      duration: milliseconds(0.6),
      endDelay: milliseconds(0.2),
      delay: milliseconds(0.2),
    });
    this.store("scaleC1", scaleC1);

    const scaleC2 = keyframeValue(0, [{ value: 1 }, { value: 0 }], {
      easing: "easeInOutCubic",
      autoplay: false,
      duration: milliseconds(0.6),
      endDelay: milliseconds(0.1),
      delay: milliseconds(0.3),
    });
    this.store("scaleC2", scaleC2);

    return Promise.all([
      loadSvg(paper, C),
      loadSvg(paper, A),
      loadSvg(paper, N),
    ]).then(([c, a, n]) => {
      this.store("letterC", c.children[1]);
      this.store("letterA", a.children[1]);
      this.store("letterN", n.children[1]);
    });
  }

  draw({ percentage, group }: DrawEvent) {
    const { asset, w, h, paper } = this.utils();

    const scaleX1: AnimationValueObject = asset("scaleX1");
    scaleX1.seek(percentage);
    const scaleX2: AnimationValueObject = asset("scaleX2");
    scaleX2.seek(percentage);
    const scaleX3: AnimationValueObject = asset("scaleX3");
    scaleX3.seek(percentage);

    const scaleC1: AnimationValueObject = asset("scaleC1");
    scaleC1.seek(percentage);

    const scaleC2: AnimationValueObject = asset("scaleC2");
    scaleC2.seek(percentage);

    const letterC: paper.PathItem = asset("letterC").clone();
    const letterA: paper.PathItem = asset("letterA").clone();
    const letterN: paper.PathItem = asset("letterN").clone();

    letterC.fitBounds(new paper.Rectangle(p(0, 0), p(w(0.2), h(0.2))));
    letterC.position = p(w(0.25), h(0.25));
    letterC.scale(scaleX1.get());

    letterA.fitBounds(new paper.Rectangle(p(0, 0), p(w(0.2), h(0.2))));
    letterA.position = p(w(0.5), h(0.5));
    letterA.scale(scaleX2.get());

    letterN.fitBounds(new paper.Rectangle(p(0, 0), p(w(0.2), h(0.2))));
    letterN.position = p(w(0.75), h(0.75));
    letterN.scale(scaleX3.get());

    const circle1 = new paper.Path.Circle(
      p(w(0.65), h(0.15)),
      w(0.1 * scaleC1.get())
    );
    const circle1Fill = halftone(circle1);
    circle1.strokeColor = c("black");
    circle1Fill.fillColor = c("black");

    const circle2 = new paper.Path.Rectangle(p(w(0), h(0)), p(w(0.2), h(0.2)));
    circle2.position = p(w(0.22), h(0.75));
    circle2.scale(scaleC2.get());
    circle2.rotate(percentage * 180);
    const circle2Fill = halftone(circle2);
    circle2.strokeColor = c("black");
    circle2Fill.fillColor = c("black");

    group.addChildren([
      letterC,
      letterA,
      letterN,
      circle1,
      circle1Fill,
      circle2,
      circle2Fill,
    ]);
  }
}

export default CanAnimation;
