import { SpatialContext, useSpatialContext } from "./SpatialContext.jsx";
import { combinePose, pose as makePose } from "./position.js";

// A SpatialGroup is a coordinate system, not an SVG <g>.
// It repositions all descendant Spatial leaves while keeping those leaves
// independently sortable by depth.
export const SpatialGroup = ({
  position = { x: 0, y: 0, z: 0 },
  rotation = 0,
  scale = 1,
  children
}) => {
  const parent = useSpatialContext();
  const worldPose = combinePose(parent.pose, makePose(position, rotation, scale));

  return (
    <SpatialContext.Provider value={{ pose: worldPose, register: parent.register }}>
      {children}
    </SpatialContext.Provider>
  );
};
