export const degToRad = (deg) => (deg * Math.PI) / 180;
export const radToDeg = (rad) => (rad * 180) / Math.PI;

//helper functions
const angleDiff = (a, b) => {
  let d = Math.abs(a - b);
  if (d > Math.PI) d = 2 * Math.PI - d;
  return d;
};

export const closestAngle3 = (a1, a2, a3, target) => {
  const d1 = angleDiff(a1, target);
  const d2 = angleDiff(a2, target);
  const d3 = angleDiff(a3, target);

  if (d1 <= d2 && d1 <= d3) return a1;
  if (d2 <= d3) return a2;
  return a3;
};

export const clamp = (num, min, max) =>
  num <= min
    ? min
    : num >= max
      ? max
      : num;

export const coordsToPath = (coords) => {
  if (!coords.length) return "";

  let path = `M ${coords[0][0]} ${coords[0][1]}`;
  for (let index = 1; index < coords.length; index += 1) {
    path += ` L ${coords[index][0]} ${coords[index][1]}`;
  }
  return path;
};

export const shiftPolylinePath = (path) => {
  // Match the first M + coords, then the next command
  return path.replace(/^M\s*-?\d*\.?\d+\s*-?\d*\.?\d+\s*L/, "M");
};

export const appendLastPoint = (path, coords) => {
  const [x, y] = coords[coords.length - 1];
  return `${path} L ${x} ${y}`;
};
