import { useId, useLayoutEffect } from "react";
import { useSpatialContext } from "./SpatialContext.jsx";
import { combinePose, pose as makePose } from "./position.js";

// One Spatial = one indivisible flat graphic at one depth.
export const Spatial = ({
  position = { x: 0, y: 0, z: 0 },
  rotation = 0,
  scale = 1,
  children
}) => {
  const id = useId();
  const parent = useSpatialContext();
  const worldPose = combinePose(parent.pose, makePose(position, rotation, scale));

  useLayoutEffect(
    () => parent.register({ id, pose: worldPose, element: children }),
    [id, worldPose.position.x, worldPose.position.y, worldPose.position.z,
      worldPose.rotation, worldPose.scale, children, parent.register]
  );

  return null;
};
