import { p, c } from "./abstractions";

export const getMark = (paper: paper.PaperScope, size = 40) => {
  const mark = new paper.Group();

  const line = new paper.Path.Line(p(0, size * 0.5), p(size, size * 0.5));

  const line2 = line.clone();
  line2.rotate(90);

  // const circ = new paper.Path.Circle(p(size / 2, size / 2), size * 0.35);

  mark.addChildren([line, line2]);
  mark.strokeColor = c("black");

  return mark;
};

export const clipBounds = (
  paper: paper.PaperScope,
  item: paper.PathItem,
  width: number,
  height: number
) => {
  const clipRect = new paper.Path.Rectangle(p(0, 0), p(width, height));
  return clipRect.intersect(item, {
    trace: true,
  });
};
