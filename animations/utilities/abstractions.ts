import paper from "paper/dist/paper-core";

export const p = (x: number, y: number) => new paper.Point(x, y);
export const r = (x: number, y: number, w: number, h: number) =>
  new paper.Rectangle(x, y, w, h);

export const c = (color: string) => new paper.Color(color);

export const loadSvg = (
  ps: paper.PaperScope,
  file: string,
  insert = false
): Promise<paper.Item> => {
  return new Promise((resolve, reject) => {
    ps.project.importSVG(file, {
      onLoad: (item: paper.Item) => resolve(item),
      insert,
    });
  });
};

export const svgToBlob = (ps: paper.PaperScope): Blob => {
  return new Blob([ps.project.exportSVG({ asString: true }).toString()], {
    type: "image/svg+xml;charset=utf-8",
  });
};
