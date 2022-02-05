import anime from "animejs";

export interface AnimationValueObject {
  get: () => number;
  seek: (num: number) => void;
}

export const animationValue = (
  starting: number,
  target: number,
  opts: anime.AnimeParams
): AnimationValueObject => {
  const obj = { value: starting };

  const anim = anime({
    targets: obj,
    value: target,
    ...opts,
  });

  return {
    get: () => obj.value,
    seek: (num: number) => anim.seek(num * anim.duration),
  };
};

export const keyframeValue = (
  starting: number,
  target: readonly anime.AnimeAnimParams[],
  opts: anime.AnimeParams
): AnimationValueObject => {
  const obj = { value: starting };

  const anim = anime({
    targets: obj,
    value: target,
    ...opts,
  });

  return {
    get: () => obj.value,
    seek: (num: number) => anim.seek(num * anim.duration),
  };
};
