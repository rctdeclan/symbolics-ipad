export class Camera {
  constructor({ position = { x: 0, y: 0, z: 0 }, focalLength = 10, near = 0.01 } = {}) {
    this.position = { ...position };
    this.focalLength = focalLength;
    this.near = near;
  }

  depth(point) {
    return point.z - this.position.z;
  }

  project(point) {
    const depth = this.depth(point);
    if (depth <= this.near) return null;

    const scale = this.focalLength / depth;
    return {
      x: (point.x - this.position.x) * scale,
      y: (point.y - this.position.y) * scale,
      scale,
      depth
    };
  }
}
