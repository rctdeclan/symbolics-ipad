import { coordsToPath } from "./math.js";

export const createInitialDragonState = () => {
  const lineCoords = [
    [0, 0, 0]
  ];

  return {
    lineCoords,
    speed: 1,
    b: 0,
    a: 0, //current angle
    n: 0, //current number of addition
    amtBodies: 40,
    spacing: 1,
    latterAngle: 90, //target angle
    latterX: 100, //target x
    latterY: 100, //target y
    d: 0,
    startShift: false,
    displayPath: coordsToPath(lineCoords)
  };
};
