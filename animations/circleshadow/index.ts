import { AnimationBase, AnimationOptions, DrawEvent } from "../base";
import { c, p, r } from "../utilities/abstractions";
import { AnimationValueObject, keyframeValue } from "../utilities/animations";
import { halftone } from "../utilities/raster";

class CircleShadow extends AnimationBase {
  constructor(opts: Partial<AnimationOptions>) {
    super({
      ...opts,
      debug: true,
      totalFrames: 300,
      withMark: true,
    });
  }

  // preload() {
  //   const { milliseconds, paper } = this.utils();

  //   const round = keyframeValue(-1, [{ value: 1 }, { value: -1 }], {
  //     easing: "easeInOutCubic",
  //     autoplay: false,
  //     duration: milliseconds(1),
  //   });
  //   this.store("round", round);

  //   return Promise.resolve();
  // }

  draw({ percentage, group, frame }: DrawEvent) {
    const { w, h, paper, asset } = this.utils();

    // const round: AnimationValueObject = asset("round");
    // round.seek(percentage);

    const outer = new paper.Path.Circle(p(w(0.5), h(0.5)), w(0.3));
    outer.strokeWidth = 2;
    outer.strokeColor = c("black");

    const t = percentage * (Math.PI * 2);
    const x = Math.cos(t);
    const y = Math.sin(2 * t) / 2;

    const inner = new paper.Path.Circle(
      p(w(x * 0.4 + 0.5), h(y * 0.4 + 0.5)),
      w(0.1)
    );
    inner.strokeWidth = 2;
    inner.strokeColor = c("black");

    const shape = inner.clone();
    shape.position.y += h(0.05);
    shape.strokeColor = c("red");
    const shadowStep1 = shape.subtract(inner);
    shape.remove();

    const shadowStep2 = shadowStep1.intersect(outer);
    shadowStep1.remove();
    shadowStep2.fillColor = c("red");

    outer.remove();

    const fill = halftone(shadowStep2, { replace: false, size: 5 });
    shadowStep2.remove();
    fill.fillColor = c("red");

    group.addChildren([inner, fill]);
  }
}

export default CircleShadow;
