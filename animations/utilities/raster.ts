import paper from "paper/dist/paper-core";
import { p } from "./abstractions";

const DEFAULT_HALFTONE_OPTIONS = {
  size: 10,
  dotSize: 1,
  replace: true,
};

export const halftone = (item: paper.Item, options = {}) => {
  const { size, dotSize, replace } = {
    ...DEFAULT_HALFTONE_OPTIONS,
    ...options,
  };

  let startingX = Math.floor(item.bounds.x);
  let startingY = Math.floor(item.bounds.y);
  let width = item.bounds.width;
  let height = item.bounds.height;

  const g = new paper.Group();
  g.fitBounds(item.bounds);
  const outer = new paper.Path.Rectangle(item.bounds);
  g.addChild(outer);

  let remainderX = startingX - (startingX % size);
  let remainderY = startingY - (startingY % size);

  for (let x = remainderX; x < startingX + width; x += size) {
    for (let y = remainderY; y < startingY + height; y += size) {
      if (item.contains(p(x, y))) {
        g.addChild(new paper.Path.Circle(p(x, y), dotSize));
      }
    }
  }

  g.position = item.bounds.center;

  outer.remove();

  if (replace) {
    item.replaceWith(g);
  }

  return g;
};

export function cutInGroup(idx: number, group: paper.Group) {
  if (idx >= group.children.length - 1) {
    return;
  }

  const totalLength = group.children.length;
  const current = group.children[idx].clone({
    insert: false,
  });
  let above = group.children[idx + 1].clone({
    insert: false,
  });

  for (let i = idx + 2; i < totalLength; i++) {
    if (group.children[i].visible) {
      above = (above as any).unite(group.children[i]);
    }
  }

  const last = (current as any).subtract(above);
  last.style.fillColor = current.style.fillColor;
  last.style.strokeColor = current.style.strokeColor;

  group.children[idx].replaceWith(last);
}
