export const mapRange = (
  val: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number
) => {
  return ((val - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

export const clamp = (num: number, min: number, max: number) => {
  return Math.min(Math.max(num, min), max);
};
