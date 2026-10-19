import { useCallback, useMemo, useState } from "react";
import { SpatialContext } from "./SpatialContext.jsx";
import { pose } from "./position.js";

// Spatial leaves register as independent pieces. Camera projection and
// far-to-near ordering happen here, globally across every SpatialGroup.
export const SpatialScene = ({ camera, children }) => {
  const [pieces, setPieces] = useState(() => new Map());
  const rootPose = useMemo(() => pose({ x: 0, y: 0, z: 0 }), []);

  const register = useCallback((piece) => {
    setPieces((current) => {
      const next = new Map(current);
      next.set(piece.id, piece);
      return next;
    });
    return () => setPieces((current) => {
      const next = new Map(current);
      next.delete(piece.id);
      return next;
    });
  }, []);

  const rendered = [...pieces.values()]
    .map((piece) => ({ ...piece, projected: camera.project(piece.pose.position) }))
    .filter((piece) => piece.projected)
    .sort((a, b) => b.projected.depth - a.projected.depth);

  return (
    <SpatialContext.Provider value={{ pose: rootPose, register }}>
      {children}
      {rendered.map((piece) => {
        const { x, y, scale: perspectiveScale } = piece.projected;
        const scale = perspectiveScale * piece.pose.scale;
        const transform = `translate(${x},${y}) scale(${scale}) rotate(${piece.pose.rotation})`;
        return <g key={piece.id} transform={transform}>{piece.element}</g>;
      })}
    </SpatialContext.Provider>
  );
};
