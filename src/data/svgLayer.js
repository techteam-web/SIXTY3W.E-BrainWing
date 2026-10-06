// Reads a traced SVG layer — the building elevation's floors, a plan's units or amenities —
// into plain data the screens can render as React elements.
//
// The supplied SVGs carry no drawing of their own. Each is a set of named shapes traced
// over a 1920×1080 render in a 460.8×259.2 frame, and those shapes ARE the interactive
// layer: their ids are what the app keys on, their geometry is what the pointer hits. So
// nothing here is redrawn or re-measured. The geometry attributes are copied across
// verbatim; the authoring styles (the beige fill and black hairline the tracer worked in)
// are dropped, because the screen draws its own highlight over the render instead.

const GEOMETRY = new Set([
  'd',
  'points',
  'x',
  'y',
  'width',
  'height',
  'rx',
  'ry',
  'cx',
  'cy',
  'r',
  'x1',
  'y1',
  'x2',
  'y2',
  'transform',
]);

const SHAPES = 'path, polygon, polyline, rect, circle, ellipse, line';

export function parseSvgLayer(raw) {
  const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
  const svg = doc.documentElement;
  const [minX = 0, minY = 0, width = 0, height = 0] = (svg.getAttribute('viewBox') ?? '')
    .trim()
    .split(/[\s,]+/)
    .map(Number);

  const shapes = [];
  for (const el of svg.querySelectorAll(SHAPES)) {
    // A shape without an id is tracing the tracer left behind — it names nothing, so
    // nothing can be said about it and it is not offered as a target.
    const id = el.getAttribute('id');
    if (!id) continue;
    const attrs = {};
    for (const { name, value } of el.attributes) {
      if (GEOMETRY.has(name)) attrs[name] = value;
    }
    const tag = el.tagName.toLowerCase();
    shapes.push({
      id,
      tag,
      // Illustrator's own label for the layer, entity-decoded. Kept for fallbacks only:
      // several are letter-spaced ("F I T N E S S C E N T R E") and one is double-escaped.
      name: el.getAttribute('data-name') ?? id,
      attrs,
      // Computed once here rather than measured from a mounted node — see shapeBBox.
      bbox: shapeBBox(tag, attrs),
    });
  }

  return { viewBox: [minX, minY, width, height], shapes };
}

// A shape's own bounding box, in its artboard units — its centre is what a view can be
// framed or aimed on (the Floor Plans radar's per-room camera point, among other uses).
// Computed from the raw geometry rather than a mounted element's getBBox(): these shapes
// are parsed once, at import time, off the live DOM, and detached-SVG getBBox() support
// is inconsistent across browsers.
//
// Only `polygon` and `path` occur among the ids this app ever selects a room by — every
// plan's rooms and amenities are one or the other. For a path it is an approximation:
// every command's end point AND every curve's control points are sampled, which is exact
// for the straight segments these plans are built from and close enough for the small
// corner fillets they round with — none of them draws a wide, sweeping curve.
function shapeBBox(tag, attrs) {
  const pts = tag === 'polygon' ? polygonPoints(attrs.points) : tag === 'path' ? pathPoints(attrs.d) : [];
  if (!pts.length) return null;
  let minPx = Infinity;
  let minPy = Infinity;
  let maxPx = -Infinity;
  let maxPy = -Infinity;
  for (const [px, py] of pts) {
    if (px < minPx) minPx = px;
    if (px > maxPx) maxPx = px;
    if (py < minPy) minPy = py;
    if (py > maxPy) maxPy = py;
  }
  return { x: minPx, y: minPy, width: maxPx - minPx, height: maxPy - minPy };
}

export const bboxCenter = (bbox) => [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];

function polygonPoints(points) {
  const n = (points ?? '').trim().split(/[\s,]+/).filter(Boolean).map(Number);
  const pts = [];
  for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]);
  return pts;
}

// A minimal path tokenizer: enough to sample every point an M/L/H/V/C/S/Q/T/Z command
// touches. An 'A' (arc) falls through to the generic end-point case — none of this app's
// shapes use one, so a slightly loose bbox there would never actually happen.
const ARITY = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
const CURVE = new Set(['c', 's', 'q', 't']);

function pathPoints(d) {
  const toks = (d ?? '').match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  const pts = [];
  let i = 0;
  let cmd = '';
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  const num = () => parseFloat(toks[i++]);

  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    const lower = cmd.toLowerCase();
    if (lower === 'z') {
      x = sx;
      y = sy;
      pts.push([x, y]);
      continue;
    }
    const arity = ARITY[lower];
    if (arity == null) break; // an unrecognised command — stop rather than misread it

    const rel = cmd === lower;
    const args = [];
    for (let k = 0; k < arity; k++) args.push(num());

    if (CURVE.has(lower)) {
      for (let k = 0; k + 1 < args.length; k += 2) {
        pts.push([rel ? x + args[k] : args[k], rel ? y + args[k + 1] : args[k + 1]]);
      }
    }

    if (lower === 'h') x = rel ? x + args[0] : args[0];
    else if (lower === 'v') y = rel ? y + args[0] : args[0];
    else {
      x = rel ? x + args[args.length - 2] : args[args.length - 2];
      y = rel ? y + args[args.length - 1] : args[args.length - 1];
    }
    pts.push([x, y]);

    // An implicit M…M L sequence: a second coordinate pair after a moveto is a lineto.
    if (lower === 'm') {
      sx = x;
      sy = y;
      cmd = rel ? 'l' : 'L';
    }
  }
  return pts;
}
