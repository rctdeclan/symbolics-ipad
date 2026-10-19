export const Stage = ({ width, height, children }) => {
  const mid = { x: width / 2, y: height / 2 };
  const transform = `translate(${mid.x},${mid.y})`;

  return (
    <svg
      height={height}
      width={width}
      style={{ overflow: "visible", position: "relative", display: "block", margin: "auto" }}
    >
      <defs>
        <clipPath id="cut">
          <rect x="-640" y="-360" width="1280" height="720" />
        </clipPath>
      </defs>

      <rect stroke="black" fill="white" width={width} height={height} />
      <g transform={transform} clipPath="url(#cut)">
        {children}
      </g>
    </svg>
  );
};
