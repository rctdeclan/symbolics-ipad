import React, { useState } from "react";
import Path from "react-svg-path";
import useAnimationFrame from "../useAnimationFrame";
import useMousePosition from "../useMousePosition";
import { spline, pos, vector } from "../bezier-spline";
import { Dragon } from "../Dragon";
/*
const composedF = (targetF,inF) =>
{
  return targetF(inF)
}

const composedF2 = (targetF,inF) =>
[

]


const Composed = (Base, parts, body) => {
  return class extends Base {

    constructor(props) {
      super(props);
      this.parts = parts;
      this.body = body
      body.call(this);
    }
  }
}

//a compound function, gives a copmposition of functionality in the first function, and functionality in the second function.
//shared functionality is produced as a returned function.

//a composed class can be based on all types of classes, like React.Component, or other custom classes.
const SnakeDragon = Composed(React.Component, { "head": HeadPart }, function () {
  this.renderBodies = () => {
  }
  //this (referring to SnakeDragon) can be accessed.
  this.useBodies = (inF) => {
    let a = 1;
    return () => {
      console.log("before: " + a)
      //inF can access this (referring to SnakeDragon)
      inF(a);

      //after:
      console.log("after: " + a)
    }

    this.useBodies = composedF2()
  }

});
//parts can be classes or functions.

// export const App2 = () => {
//   let d = new SnakeDragon();

//   const useDragon = d.useBodies((a) => {
//     let b = 2;
//     console.log("inside composed function: a=" + a + ", b=" + b);
//   })

  
//   useDragon();

// }

// useDragon();

// return (
//   <Stage width={1280} height={720}>
//     <Composition>
//       <Layer continuous={true}>
//         {d.renderBodies()}
//       </Layer>
//     </Composition>
//   </Stage>
//   //instance of d has rnderBodies method (defined in body function) that can be accessed.
// );
// }
*/



export const App = () => {
  const [time, setTime] = useState(0);
  const [delta, setDelta] = useState(0);
  //console.log("App render");
  useAnimationFrame(e => {
    setTime(e.time);
    setDelta(e.delta);
  });
  return (
    <Stage width={1280} height={720}>
      <Composition>
        <Layer continuous={true}>
          <Dragon time={time} delta={delta} />
        </Layer>
      </Composition>
    </Stage>
  );
};

const Composition = (props) => {
  let { children } = props;

  const [time, setTime] = useState(0);
  const [delta, setDelta] = useState(0);

  useAnimationFrame(e => {
    setTime(e.time);
    setDelta(e.delta);
  });




  let newChildren = React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      time: time,
      delta: delta
    })
  }
  )

  return newChildren;
}

const Layer = (props) => {

  let { begin = 0, end = 0, time = 0, delta = 0, children, continuous = false } = props;

  let active = false;
  if (continuous) {
    active = true;
  } else {
    if (time >= begin && time <= end) {
      active = true;
    }
  }
  let newChildren = [];

  if (active) {

    newChildren = React.Children.map(children, (child) => {
      return React.cloneElement(child, {
        time: time,
        delta: delta
      })
    }
    )
  }
  return newChildren;
}

const Stage = (props) => {

  let { width, height, children } = props;

  let mid = { x: width / 2, y: height / 2 };
  let s = "translate(" + mid.x + "," + mid.y + ")";

  return (
    <svg height={height} width={width} style={{ overflow: "visible", position: "relative", display: "block", margin: "auto" }}>
      <defs>
        <clipPath id="cut">
          <rect x="-640" y="-360" width="1280" height="720" />
        </clipPath>
      </defs>

      <rect stroke="black" fill="white" width={width} height={height}>
      </rect>
      <g transform={s} clipPath="url(#cut)">
        {children}
      </g>
    </svg>

  );
}





export const G3 = (props) => {
  let { x = 0, y = 0, z = 0, rotation = 0, scale = 1, children, ...other } = props;
  if (z == 0) { z = 1; }
  let b = 2;
  let zf = 1 / z * 10;
  let sc = zf * scale;
  let newx = x * zf;
  let newy = y * zf;
  let s = "translate(" + newx + "," + newy + ") scale(" + sc + ") rotate(" + rotation + ")";
  return (
    <g transform={s}>
      {children}
    </g>
  )
}

const Frame = (props) => {

  let { x = 0, y = 0, z = 10, rotation = 0, color } = props;

  return (
    <G3 x={x} y={y} z={z} rotation={rotation} >
      <path d="M261.294 104.443L256.697 1075.5L1823.36 1074.11L1816.51 96.7465L261.294 104.443ZM954.519 312.863C1001.69 312.177 1235.69 343.365 1250.68 349.804C1266.16 356.451 1394.08 418.973 1397.74 450.965C1401.4 482.956 1490.58 727.346 1365.1 752.377C1239.61 777.409 1104.54 692.573 1064.34 699.582C1024.15 706.592 661.672 749.742 633.662 744.279C605.651 738.817 535.268 586.771 539.299 542.745C543.33 498.718 596.994 350.035 596.994 350.035C596.994 350.035 721.684 360.622 752.096 355.687C782.507 350.753 914.731 315.926 950.543 313.034C951.662 312.944 952.998 312.885 954.519 312.863Z" fill={color} fill-rule="nonzero" opacity="1" stroke="none" />
    </G3>
  )
}