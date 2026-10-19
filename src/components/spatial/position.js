export const position = (x = 0, y = 0, z = 1) => ({ x, y, z });

export const pose = (positionValue = position(), rotation = 0, scale = 1) => ({
  position: positionValue,
  rotation,
  scale
});

export const combinePose = (parent, child) => {
  const radians = (parent.rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const x = child.position.x * cos - child.position.y * sin;
  const y = child.position.x * sin + child.position.y * cos;

  return {
    position: {
      x: parent.position.x + x * parent.scale,
      y: parent.position.y + y * parent.scale,
      z: parent.position.z + child.position.z
    },
    rotation: parent.rotation + child.rotation,
    scale: parent.scale * child.scale
  };
};
