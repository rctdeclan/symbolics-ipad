import React, { useState } from "react";
import useAnimationFrame from "../../useAnimationFrame.jsx";
import { Camera, SpatialScene } from "../spatial/index.js";

export const Composition = ({
  children,
  camera = new Camera({ position: { x: 0, y: 0, z: 0 }, focalLength: 10 })
}) => {
  const [time, setTime] = useState(0);
  const [delta, setDelta] = useState(0);

  useAnimationFrame((event) => {
    setTime(event.time);
    setDelta(event.delta);
  });

  const timedChildren = React.Children.map(children, (child) =>
    React.cloneElement(child, { time, delta })
  );

  return <SpatialScene camera={camera}>{timedChildren}</SpatialScene>;
};
