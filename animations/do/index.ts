import { AnimationBase, AnimationOptions, DrawEvent } from "../base";
import { c, loadSvg, p } from "../utilities/abstractions";
import {
  animationValue,
  AnimationValueObject,
  keyframeValue,
} from "../utilities/animations";
import D from "!!raw-loader!./assets/d.svg";
import O from "!!raw-loader!./assets/o.svg";
import { halftone } from "../utilities/raster";
import { mapRange } from "../utilities/utils";

class DoAnimation extends AnimationBase {
  compoundPath: paper.CompoundPath | null = null;

  constructor(opts: Partial<AnimationOptions>) {
    super({
      ...opts,
      debug: true,
      totalFrames: 150,
      withMark: false,
    });
  }

  preload() {
    const { milliseconds, paper } = this.utils();

    const scaleX1 = keyframeValue(0, [{ value: 1 }, { value: 0 }], {
      easing: "easeOutCubic",
      autoplay: false,
      duration: milliseconds(0.1),
      // delay: milliseconds(0.5),
    });
    this.store("scaleX1", scaleX1);

    return Promise.all([loadSvg(paper, D), loadSvg(paper, O)]).then(
      ([d, o]) => {
        this.store("letterD", d.children[1]);
        this.store("letterO", o.children[1]);
      }
    );
  }

  draw({ percentage, group }: DrawEvent) {
    const { asset, w, h, paper } = this.utils();

    const letterD: paper.PathItem = asset("letterD").clone();
    const letterO: paper.PathItem = asset("letterO").clone();

    const getGroup = (alt = false, mod = 0) => {
      const g = new paper.Group();
      g.addChildren(
        new Array(10)
          .fill(0)
          .map((v, i, arr) => {
            const ip = (i / arr.length) * 0.25;

            if (
              percentage > (i / arr.length) * 0.4 + mod &&
              percentage < 0.4 + mod + (i / arr.length) * 0.4
            ) {
              const r = new paper.Path.Rectangle(
                p(w(0.5 * ip), h(1 * ip)),
                p(w(0.5 * (1 - ip)), h(1 * (1 - ip)))
              );

              r.pivot = p(w(0), h(0));
              r.position.y = alt ? ip * h(0.75) : -ip * h(0.75);

              return r;
            }

            return null;
          })
          .filter((i) => i) as paper.PathItem[]
      );
      g.strokeColor = c("red");
      return g;
    };

    const g1 = getGroup();
    const g2 = getGroup(true, 0.1);

    // const g2 = g.clone();
    g2.position.x = w(0.75);

    group.addChildren([g1, g2]);

    if (percentage > 0.4 && percentage < 0.8) {
      const scaleX1: AnimationValueObject = asset("scaleX1");
      scaleX1.seek(mapRange(percentage, 0.4, 0.8, 0, 1));
      letterD.fitBounds(new paper.Rectangle(p(0, 0), p(w(0.3), h(0.3))));
      letterD.position = p(w(0.25), h(0.35 - scaleX1.get() * 0.05));
      group.addChild(letterD);
    }

    if (percentage > 0.5 && percentage < 0.9) {
      const scaleX1: AnimationValueObject = asset("scaleX1");
      scaleX1.seek(mapRange(percentage, 0.5, 1, 0, 1));
      letterO.fitBounds(new paper.Rectangle(p(0, 0), p(w(0.3), h(0.3))));
      letterO.position = p(w(0.75), h(0.65 + scaleX1.get() * 0.05));
      group.addChild(letterO);
    }
  }
}

export default DoAnimation;
