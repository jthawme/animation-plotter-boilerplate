import { AnimationBase, AnimationOptions, DrawEvent } from "../base";
import { c, loadSvg, p } from "../utilities/abstractions";
import {
  animationValue,
  AnimationValueObject,
  keyframeValue,
} from "../utilities/animations";
import { halftone } from "../utilities/raster";
import Y from "!!raw-loader!./assets/y.svg";
import O from "!!raw-loader!./assets/o.svg";
import U from "!!raw-loader!./assets/u.svg";
import { clipBounds } from "../utilities/printing";

class TestAnimation extends AnimationBase {
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

    const yPos = keyframeValue(
      -0.5,
      [
        { value: 0.5, easing: "easeOutCubic" },
        { value: -0.5, easing: "easeInCubic" },
      ],
      {
        easing: "easeOutCubic",
        autoplay: false,
        duration: milliseconds(0.7),
      }
    );
    this.store("yPos", yPos);

    const yPos2 = keyframeValue(
      -0.5,
      [
        { value: 0.5, easing: "easeOutCubic" },
        { value: -0.5, easing: "easeInCubic" },
      ],
      {
        easing: "easeOutCubic",
        autoplay: false,
        duration: milliseconds(0.7),
        delay: milliseconds(0.15),
      }
    );
    this.store("yPos2", yPos2);

    const yPos3 = keyframeValue(
      -0.5,
      [
        { value: 0.5, easing: "easeOutCubic" },
        { value: -0.5, easing: "easeInCubic" },
      ],
      {
        easing: "easeOutCubic",
        autoplay: false,
        duration: milliseconds(0.7),
        delay: milliseconds(0.3),
      }
    );
    this.store("yPos3", yPos3);

    const rotatePos = animationValue(0, 10, {
      easing: "linear",
      autoplay: false,
      duration: milliseconds(0.75),
    });
    this.store("rotatePos", rotatePos);

    const rotatePos2 = animationValue(0, -20, {
      easing: "linear",
      autoplay: false,
      duration: milliseconds(1),
    });
    this.store("rotatePos2", rotatePos2);

    return Promise.all([
      loadSvg(paper, Y),
      loadSvg(paper, O),
      loadSvg(paper, U),
    ]).then(([y, o, u]) => {
      this.store("letterY", y.children[1]);
      this.store("letterO", o.children[1]);
      this.store("letterU", u.children[1]);
    });
  }

  draw({ percentage, group }: DrawEvent) {
    const { asset, w, h, paper } = this.utils();

    const yPos: AnimationValueObject = asset("yPos");
    yPos.seek(percentage);
    const yPos2: AnimationValueObject = asset("yPos2");
    yPos2.seek(percentage);
    const yPos3: AnimationValueObject = asset("yPos3");
    yPos3.seek(percentage);

    const rotatePos: AnimationValueObject = asset("rotatePos");
    rotatePos.seek(percentage);

    const rotatePos2: AnimationValueObject = asset("rotatePos2");
    rotatePos2.seek(percentage);

    const letterY: paper.PathItem = asset("letterY").clone();

    letterY.fitBounds(new paper.Rectangle(p(0, 0), p(w(0.4), h(0.4))));
    letterY.position = p(w(0.25), h(1 - yPos.get()));
    letterY.rotate(rotatePos.get());

    const letterO: paper.PathItem = asset("letterO").clone();

    letterO.fitBounds(new paper.Rectangle(p(0, 0), p(w(0.4), h(0.4))));
    letterO.position = p(w(0.5), h(1 - yPos2.get()));
    letterO.rotate(rotatePos2.get());

    const letterU: paper.PathItem = asset("letterU").clone();

    letterU.fitBounds(new paper.Rectangle(p(0, 0), p(w(0.4), h(0.4))));
    letterU.position = p(w(0.75), h(1 - yPos3.get()));
    letterU.rotate(rotatePos.get());

    group.addChildren([letterY, letterO, letterU]);
  }
}

export default TestAnimation;
