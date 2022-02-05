import paper from "paper/dist/paper-core";
import Loop from "raf-loop";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { AssetManager } from "./assets";
import { c, p, svgToBlob } from "./utilities/abstractions";
import { getMark } from "./utilities/printing";

const DEFAULT_OPTIONS = {
  width: 500,
  height: 500,
  canvas: null,
  totalFrames: 60,
  debug: false,
  withMark: true,
};

export interface AnimationOptions {
  width: number;
  height: number;
  canvas: HTMLCanvasElement | null;
  totalFrames: number;
  debug?: boolean;
  withMark?: boolean;
}

export interface DrawEvent {
  frame: number;
  percentage: number;
  group: paper.Group;
  count: number;
  time: number;
}

class AnimationBase {
  _assetManager: AssetManager;
  options: AnimationOptions;
  ps: paper.PaperScope;
  debugEl: HTMLDivElement | null = null;
  _oldFrameGroup: paper.Group | null = null;
  engine: any;

  private _running: boolean = false;
  private _preloaded: boolean = false;
  private _frame: number = 0;
  private _startTime: number = 0;

  constructor(options: Partial<AnimationOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    this._assetManager = new AssetManager();

    if (!this.options.canvas) {
      throw new Error("No Canvas element passed");
    }

    this._resize(this.options.width, this.options.height);
    this.ps = new paper.PaperScope();
    this.ps.setup(this.options.canvas);

    this.engine = Loop(this.queueDraw.bind(this));
  }

  get el() {
    return this.options.canvas;
  }

  private _resize(width: number, height: number) {
    if (!this.options.canvas) {
      return;
    }

    this.options.canvas.width = width;
    this.options.canvas.height = height;
    this.options.canvas.style.width = `${width}px`;
    this.options.canvas.style.height = `${height}px`;
  }

  setDebug(debug: boolean) {
    this.options.debug = debug;
  }

  setDebugElement(el: HTMLDivElement) {
    this.debugEl = el;
  }

  store(key: string, value: any) {
    this._assetManager.set(key, value);
  }

  start() {
    if (this._running) {
      return;
    }

    const pre = this._preloaded ? Promise.resolve() : this.preload();

    pre.then(() => {
      this._preloaded = true;
      this._startLoop();
      // this.ps.view.onFrame = this.queueDraw.bind(this);
    });
  }

  private _startLoop() {
    this._running = true;
    this.options.canvas?.dispatchEvent(new Event("start"));
    this._startTime = performance.now();
    this.engine.start();
  }

  preload() {
    return Promise.resolve();
  }

  utils() {
    return {
      paper: this.ps,
      w: (perc: number, width?: number) => {
        return perc * (width || this.options.width);
      },
      h: (perc: number, height?: number) => {
        return perc * (height || this.options.height);
      },
      asset: this._assetManager.get.bind(this._assetManager),
      milliseconds: (perc: number) => perc * (this.options.totalFrames * 60),
    };
  }

  draw(evt: DrawEvent) {}

  queueDraw(advance = true) {
    if (this._oldFrameGroup) {
      this._oldFrameGroup.remove();
    }

    const frameGroup = new this.ps.Group();
    frameGroup.fitBounds(
      new this.ps.Rectangle(p(0, 0), p(this.options.width, this.options.height))
    );

    // frameGroup.addChild(drawMarker());
    // frameGroup.addChild(new paper.Path.Rectangle(p(0, 0), p(width, height)));

    frameGroup.pivot = p(0, 0);
    this._oldFrameGroup = frameGroup;

    const frame = this._frame % this.options.totalFrames;
    const sinceStart = performance.now() - this._startTime;
    const pass = {
      count: this._frame,
      time: sinceStart,
      frame,
      percentage: frame / this.options.totalFrames,
      group: frameGroup,
    };

    this.options.canvas?.dispatchEvent(
      new CustomEvent("frame", {
        detail: {
          ...pass,
          group: undefined,
        },
      })
    );

    if (advance) {
      this._frame++;
    }

    if (this.options.debug) {
      this._writeDebugInfo(pass);
    }

    if (this.options.withMark) {
      frameGroup.addChild(getMark(this.ps));
    }

    this.draw(pass);
  }

  _writeDebugInfo(evt: DrawEvent) {
    if (this.debugEl) {
      const { group, ...rest } = evt;
      const str = Object.entries(rest)
        .map(([k, v]) => {
          return `${k}: ${typeof v === "number" ? v.toFixed(2) : v}`;
        })
        .join("<br/>");

      this.debugEl.innerHTML = str;
    }
  }

  stop() {
    this._running = false;
    this.options.canvas?.dispatchEvent(new Event("stop"));
    this.engine.stop();
  }

  seek(perc: number, frameSet = false) {
    this.stop();
    this._frame = frameSet ? perc : Math.floor(perc * this.options.totalFrames);
    this.queueDraw(false);
  }

  saveFrame(name?: string) {
    const blob = new Blob(
      [this.ps.project.exportSVG({ asString: true }).toString()],
      { type: "image/svg+xml;charset=utf-8" }
    );
    saveAs(blob, name || `frame-${this._frame}.svg`, {
      autoBom: false,
    });
  }

  saveOut(everyN = 10) {
    this.stop();

    const saver = () => {
      const zip = new JSZip();
      let num = 1;

      return new Promise<JSZip>((resolve) => {
        const run = (frame: number = 0) => {
          if (frame > this.options.totalFrames) {
            resolve(zip);
            return;
          }

          zip.file(
            `${num.toString().padStart(4, "0")}.svg`,
            svgToBlob(this.ps)
          );

          this.seek(frame, true);
          num++;

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              run(frame + everyN);
            });
          });
        };

        run();
      });
    };

    return saver().then((zip) => {
      zip.generateAsync({ type: "blob" }).then((blob) => {
        saveAs(blob, "frames.zip");
      });
    });
  }

  destroy() {
    this.stop();
    // (this.ps as any).remove();
  }
}

export { AnimationBase };
