import { AnimationBase, AnimationOptions, DrawEvent } from "../base";
import { c, loadSvg, p } from "../utilities/abstractions";
import {
  animationValue,
  AnimationValueObject,
  keyframeValue,
} from "../utilities/animations";
import COOL from "!!raw-loader!./assets/cool.svg";
import { clipBounds } from "../utilities/printing";
import { cutInGroup } from "../utilities/raster";

const ITEMS = 15;

const LAYER_NAMES = ["RED", "ORANGE", "YELLOW", "GREEN", "BLUE"];

class TestAnimation extends AnimationBase {
  compoundPath: paper.CompoundPath | null = null;

  constructor(opts: Partial<AnimationOptions>) {
    super({
      ...opts,
      debug: true,
      totalFrames: 300,
    });
  }

  preload() {
    const { milliseconds, paper } = this.utils();

    const rotatePos = keyframeValue(0, [{ value: 1 }], {
      easing: "easeInOutElastic",
      autoplay: false,
      duration: milliseconds(0.9),
      endDelay: milliseconds(0.1),
    });
    this.store("rotatePos", rotatePos);

    return Promise.all([loadSvg(paper, COOL)]).then(([cool]) => {
      this.store("cool", cool.children[1]);
    });
  }

  draw({ percentage, group, frame }: DrawEvent) {
    const { asset, w, h, paper } = this.utils();

    const rotatePos: AnimationValueObject = asset("rotatePos");

    const cool: paper.PathItem = asset("cool").clone();

    cool.fitBounds(new paper.Rectangle(p(0, 0), p(w(0.65), h(0.65))));
    cool.position = p(w(0.5), h(0.5));

    const g = new paper.Group();
    for (let i = 0; i < ITEMS; i++) {
      const el = cool.clone();
      const elPerc = i / ITEMS;

      rotatePos.seek(percentage + 0.1 * elPerc);

      el.position = p(
        w(elPerc * 0.2 - 0.1 + 0.5),
        h(elPerc * 0.1 - 0.05 + 0.5)
      );
      el.rotate(rotatePos.get() * 360);

      g.addChild(el);
    }
    g.strokeColor = c("blue");
    g.fillColor = c("white");
    // g.fillColor = null;

    for (let i = g.children.length; i >= 0; i--) {
      cutInGroup(i, g);

      if (g.children[i]) {
        g.children[i].name = `${(i + frame) % LAYER_NAMES.length} layer-${i}-${
          LAYER_NAMES[(i + frame) % LAYER_NAMES.length]
        }`;
      }
    }

    g.fillColor = null;
    cool.remove();
    // cool.rotate(rotatePos.get());

    group.addChildren([g]);
  }
}

export default TestAnimation;
