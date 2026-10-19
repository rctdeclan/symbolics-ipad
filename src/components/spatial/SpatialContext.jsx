import { createContext, useContext } from "react";
import { pose } from "./position.js";

export const SpatialContext = createContext({
  pose: pose({ x: 0, y: 0, z: 0 }),
  register: () => () => {}
});
export const useSpatialContext = () => useContext(SpatialContext);
