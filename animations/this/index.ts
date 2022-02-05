import { AnimationBase, AnimationOptions, DrawEvent } from "../base";
import { c, loadSvg, p } from "../utilities/abstractions";
import {
  animationValue,
  AnimationValueObject,
  keyframeValue,
} from "../utilities/animations";
import T from "!!raw-loader!./assets/t.svg";
import H from "!!raw-loader!./assets/h.svg";
import I from "!!raw-loader!./assets/i.svg";
import S from "!!raw-loader!./assets/s.svg";
import { halftone } from "../utilities/raster";
import { clamp, mapRange } from "../utilities/utils";

class ThisAnimation extends AnimationBase {
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
      1,
      [
        { value: 0, easing: "easeInOutCubic", duration: milliseconds(0.2) },
        { value: 0, easing: "easeOutSine", duration: milliseconds(0.45) },
        { value: 1, easing: "easeInOutCubic", duration: milliseconds(0.1) },
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

    this.store(
      "len1",
      keyframeValue(
        0,
        [
          { value: 1, easing: "easeInOutCubic", duration: milliseconds(0.35) },
          { value: 1, easing: "easeInOutCubic", duration: milliseconds(0.4) },
          { value: 2, easing: "easeInOutCubic" },
        ],
        {
          // easing: 'easeInOutBounce',
          autoplay: false,
          duration: milliseconds(1),
          // delay: milliseconds(0.5),
        }
      )
    );

    this.store(
      "scale1",
      keyframeValue(
        0,
        [
          { value: 1, easing: "easeInOutCubic" },
          { value: 1, easing: "easeInOutCubic" },
          { value: 0, easing: "easeInOutCubic" },
        ],
        {
          // easing: 'easeInOutBounce',
          autoplay: false,
          duration: milliseconds(0.5),
          delay: milliseconds(0.2),
          endDelay: milliseconds(0.2),
        }
      )
    );

    return Promise.all([
      loadSvg(paper, T),
      loadSvg(paper, H),
      loadSvg(paper, I),
      loadSvg(paper, S),
    ]).then(([t, h, i, s]) => {
      this.store("letterT", t.children[1]);
      this.store("letterH", h.children[1]);
      this.store("letterI", i.children[1]);
      this.store("letterS", s.children[1]);
    });
  }

  draw({ percentage, group }: DrawEvent) {
    const { asset, w, h, paper } = this.utils();

    const scaleX1: AnimationValueObject = asset("scaleX1");
    scaleX1.seek(percentage);

    const letterT: paper.PathItem = asset("letterT").clone();
    letterT.fitBounds(new paper.Rectangle(p(0, 0), p(w(0.25), h(0.25))));
    letterT.position = p(w(0.2), h(0.5 + scaleX1.get() * 0.1));
    if (percentage > 0 && percentage < 0.7) {
      group.addChild(letterT);
    }

    scaleX1.seek(percentage - 0.1);
    const letterH: paper.PathItem = asset("letterH").clone();
    letterH.fitBounds(new paper.Rectangle(p(0, 0), p(w(0.25), h(0.25))));
    letterH.position = p(w(0.4), h(0.5 + scaleX1.get() * 0.1));
    if (percentage > 0.1 && percentage < 0.8) {
      group.addChild(letterH);
    }

    scaleX1.seek(percentage - 0.2);
    const letterI: paper.PathItem = asset("letterI").clone();
    letterI.fitBounds(new paper.Rectangle(p(0, 0), p(w(0.25), h(0.25))));
    letterI.position = p(w(0.6), h(0.5 + scaleX1.get() * 0.1));
    if (percentage > 0.2 && percentage < 0.9) {
      group.addChild(letterI);
    }

    scaleX1.seek(percentage - 0.3);
    const letterS: paper.PathItem = asset("letterS").clone();
    letterS.fitBounds(new paper.Rectangle(p(0, 0), p(w(0.25), h(0.25))));
    letterS.position = p(w(0.8), h(0.5 + scaleX1.get() * 0.1));
    if (percentage > 0.3 && percentage < 1) {
      group.addChild(letterS);
    }

    const circle = new paper.Path.Ellipse(
      new paper.Rectangle(p(0, 0), p(w(0.75), h(0.45)))
    );
    circle.position = p(w(0.5), h(0.5));
    circle.strokeColor = c("black");

    const len1: AnimationValueObject = asset("len1");
    len1.seek(percentage);

    const l = len1.get();
    const pa = new paper.Path();
    const amt = 100;
    for (let i = 0; i < amt + 1; i++) {
      let o = (i / amt) * circle.length;

      // const upper = mapRange(l, 0, 2, 0, 1);
      const lower = clamp(l - 1, 0, 1);

      if (i / amt <= l && i / amt >= lower) {
        // if (i / amt <= l) {
        pa.add(circle.getPointAt(o));
      }
    }
    pa.strokeColor = c("red");

    circle.remove();

    const scale1: AnimationValueObject = asset("scale1");

    const masterRect = new paper.Path.Rectangle(p(0, 0), p(w(0.1), h(0.1)));

    scale1.seek(percentage);
    const rect1 = masterRect.clone();
    rect1.scale(scale1.get());
    rect1.rotate(percentage * 180);
    rect1.position = p(w(0.6), h(0.12));
    rect1.strokeColor = c("black");
    const rect1Fill = halftone(rect1, {
      size: 16,
    });
    rect1Fill.fillColor = c("black");

    scale1.seek(percentage - 0.05);
    const rect2 = masterRect.clone();
    rect2.scale(scale1.get() * 1.5);
    rect2.rotate(percentage * 180);
    rect2.position = p(w(0.35), h(0.85));
    rect2.strokeColor = c("black");
    const rect2Fill = halftone(rect2, {
      size: 16,
    });
    rect2Fill.fillColor = c("black");

    scale1.seek(percentage - 0.1);
    const rect3 = masterRect.clone();
    rect3.scale(scale1.get() * 0.75);
    rect3.rotate(percentage * 180);
    rect3.position = p(w(0.8), h(0.8));
    rect3.strokeColor = c("black");
    const rect3Fill = halftone(rect3, {
      size: 16,
    });
    rect3Fill.fillColor = c("black");

    scale1.seek(percentage - 0.15);
    const rect4 = masterRect.clone();
    rect4.scale(scale1.get() * 0.75);
    rect4.rotate(percentage * 180);
    rect4.position = p(w(0.15), h(0.25));
    rect4.strokeColor = c("black");
    const rect4Fill = halftone(rect4, {
      size: 16,
    });
    rect4Fill.fillColor = c("black");

    masterRect.remove();

    group.addChildren([
      pa,
      rect1,
      rect2,
      rect3,
      rect4,
      rect1Fill,
      rect2Fill,
      rect3Fill,
      rect4Fill,
    ]);
  }
}

export default ThisAnimation;
