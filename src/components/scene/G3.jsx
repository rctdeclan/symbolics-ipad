import { Spatial } from "../spatial/index.js";

// v2 compatibility adapter. New code should use Spatial directly.
export const G3 = ({ x = 0, y = 0, z = 1, rotation = 0, scale = 1, children }) => (
  <Spatial position={{ x, y, z }} rotation={rotation} scale={scale}>
    {children}
  </Spatial>
);
