import { degToRad } from "./math.js";

//debug drawing functions
const drawChart = () => {
  return (
    <>
      {/* X-axis */}
      <line
        x1={0}
        y1={0}
        x2={500}
        y2={0}
        stroke="black"
        strokeWidth={1}
      />

      {/* Y-axis */}
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={500}
        stroke="black"
        strokeWidth={1}
      />
    </>
  );
};

export const renderDragonDebug = (state) => {
  const {
    lineCoords,
    a,
    n,
    latterX,
    latterY,
    latterAngle
  } = state.value;

  return (
    <>
      {drawChart()}
      <path d={state.displayPath.value.toString()} stroke="black" strokeWidth="1" fill="none" />

      {/* lines for debugging: */}
      {/* difference rHeading */}

      {/*black target direction absolute latterAngle */}
      <line
        x1={latterX}
        y1={latterY}
        x2={latterX + Math.cos(degToRad(latterAngle)) * 10}
        y2={latterY + Math.sin(degToRad(latterAngle)) * 10}
        stroke="black"
        strokeWidth="1"
      />

      {/*green line direction a */}
      <line
        x1={lineCoords[n][0]}
        y1={lineCoords[n][1]}
        x2={lineCoords[n][0] + Math.cos(degToRad(a)) * 10}
        y2={lineCoords[n][1] + Math.sin(degToRad(a)) * 10}
        stroke="green"
        strokeWidth="1"
      />



      {/*red line diff */}
      <line
        x1={lineCoords[n][0]}
        y1={lineCoords[n][1]}
        x2={latterX}
        y2={latterY}
        stroke="red"
        strokeWidth="1"
      />

      {/*black correction d */}
      {/* <line x1={lineCoords[n][0]} y1={lineCoords[n][1]} x2={lineCoords[n][0] + Math.cos(degToRad(a + d)) * 10} y2={lineCoords[n][1] + Math.sin(degToRad(a + d)) * 10} stroke="black" strokeWidth="1" /> */}
    </>
  );
};
