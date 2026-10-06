import { createElement } from 'react';

// One shape from a traced SVG layer (see src/data/svgLayer.js), drawn with its original
// tag and geometry and whatever interaction the caller hangs on it.
export function SvgShape({ shape, ...props }) {
  return createElement(shape.tag, { ...shape.attrs, ...props });
}
