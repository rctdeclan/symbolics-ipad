import { useState } from "react";
import useAnimationFrame from "./useAnimationFrame";
import { Dragon } from "./Dragon";
import { Composition } from "./components/scene/Composition.jsx";
import { Layer } from "./components/scene/Layer.jsx";
import { Stage } from "./components/scene/Stage.jsx";
import { Camera } from "./components/spatial/index.js";
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
//     <Composition camera={camera}>
//       <Layer continuous={true}>
//         {d.renderBodies()}
//       </Layer>
//     </Composition>
//   </Stage>
//   //instance of d has rnderBodies method (defined in body function) that can be accessed.
// );
// }
*/



const camera = new Camera({ position: { x: 0, y: 0, z: 0 }, focalLength: 10 });

export const App = () => {
  const timeline = useTimeline();
  //console.log("App render");

  return (
    <Stage width={1280} height={720}>
      <Composition camera={camera}>
        <Layer continuous={true}>
          <Dragon time={timeline.time} delta={timeline.delta} />
        </Layer>
      </Composition>
    </Stage>
  );
};

const useTimeline = () => {
  const [timeline, setTimeline] = useState({ time: 0, delta: 0 });

  useAnimationFrame((event) => {
    setTimeline({
      time: event.time,
      delta: event.delta
    });
  });

  return timeline;
};
