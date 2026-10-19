import React, { PureComponent, useState } from "react";
import useAnimationFrame from "./useAnimationFrame.jsx";
import { useTimeoutLoop } from "./useTimeoutLoop.jsx";
import useMousePosition from "./useMousePosition.jsx";
import useObjectProxyState from "./useObjectProxyState.jsx";
import { G3 } from "./App.jsx";
import Path, { Distance, Line } from "react-svg-path";
import { use } from "react";

/*
useObjectProxyState example usage:  

player.position.x.set(x => x + 1);

console.log(player.position.x.value);

player.inventory.items[1].count.set(c => c - 1);

console.log(player.stats.hp());

player.stats.hp.set(200);
*/

function coordsToPath(coords) {
  if (!coords.length) return "";

  let path = `M ${coords[0][0]} ${coords[0][1]}`;
  for (let i = 1; i < coords.length; i++) {
    path += ` L ${coords[i][0]} ${coords[i][1]}`;
  }
  return path;
}

function shiftPolylinePath(path) {
  // Match the first M + coords, then the next command
  return path.replace(/^M\s*-?\d*\.?\d+\s*-?\d*\.?\d+\s*L/, "M");
}


function appendLastPoint(path, coords) {
  const [x, y] = coords[coords.length - 1];
  return path + ` L ${x} ${y}`;
}

const generateMap = () => {

  function organicTriangleMesh(triCount = 50, step = 80, jitter = 0.6) {
    // A list of triangles, each is [A,B,C]
    const tris = [];

    // Start with one triangle at random
    const p = () => [Math.random() * 200 - 100, Math.random() * 200 - 100];
    let p1 = p(), p2 = p(), p3 = p();
    tris.push([p1, p2, p3]);

    // Active “frontier” edges where new triangles can grow
    const frontier = [
      [p1, p2],
      [p2, p3],
      [p3, p1]
    ];

    function addTriangle(edge) {
      const [a, b] = edge;

      // directional vector along edge
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len = Math.sqrt(dx * dx + dy * dy);

      // Perpendicular (normal) in random direction
      const nx = -dy / len;
      const ny = dx / len;

      // Organic offset: a combination of step size + jitter
      const distance = step * (0.7 + Math.random() * jitter);

      // Pick a random point outward
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const c = [
        mid[0] + nx * distance + (Math.random() - 0.5) * step * jitter,
        mid[1] + ny * distance + (Math.random() - 0.5) * step * jitter
      ];

      // Add triangle
      tris.push([a, b, c]);

      // Remove used edge from frontier
      const idx = frontier.findIndex(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a));
      if (idx !== -1) frontier.splice(idx, 1);

      // Add new edges to frontier
      frontier.push([b, c]);
      frontier.push([c, a]);
    }

    // Growth loop
    while (tris.length < triCount) {
      // Pick a random frontier edge
      const edge = frontier[Math.floor(Math.random() * frontier.length)];
      addTriangle(edge);
    }

    // Return clean numeric output
    return tris.map((t, i) => ({
      id: i + 1,
      vertices: t
    }));
  }

  // Example:
  let mesh = organicTriangleMesh(30, 100, 0.8);

  console.log(JSON.stringify(mesh, null, 2));
  return mesh;
}

//const degToRad = deg => deg * Math.PI / 180;



export const Dragon = (props) => {
  const mouse = useMousePosition();
  const markReached = false;



  // let lc = [
  //   [-9.49752, -3.13004, 0],
  //   [-16.51412, -10.25516, 1],
  //   [-21.30520, -19.03272, 2],
  //   [-20.62284, -9.05602, 3],
  //   [-19.25628, 0.85016, 4],
  //   [-23.30866, -8.29195, 5],
  //   [-29.70991, -0.60924, 6],
  //   [-37.55693, 5.58949, 7]];




  //format: e0, e1, e2
  let triangles = [
    [1, 2, 3],
    [1, 3, 4],
    [1, 4, 5],
    [1, 5, 6],
    [1, 6, 7],
    [1, 7, 2]
  ]


  //format: x1,y1,x2,y2,tOne,tTwo
  let edges = [
    [0, 0, 10, 0, 1, 2],
    [10, 0, 20, 0, 2, 3],
    [20, 0, 30, 0, 3, 4],
    [30, 0, 40, 0, 4, 5],
    [40, 0, 50, 0, 5, 6],
    [50, 0, 60, 0, 6, 7]
  ];

  let map = [[]];

  const s = useObjectProxyState(() => {

    return {
      lineCoords: [[0, 0, 0],[10, 0, 10]],
      //bodyCoords: [[]],
      //front: 7,
      speed: 1,
      b: 0,
      a: 0, //current angle
      n: 1,  //current number of addition  
      amtBodies: 40,
      spacing: 1,
      //displayPath: new Path().M(0, 0)
      // displayPath: coordsToPath(lc),
      // startShift: false,
      // refresh: false,
      t: 70,//target angle
      tX: 100, //target x
      tY: 100, //target y
      d: 0,
      // map: map,
      // triangles: triangles,
      // edges: edges,
      // currentTriangle: 0,
      // targetTriangle: 0
    }
  });

  // let lineCoords = [[]];
  // //lineCoords: x, y, len.
  // let bodyCoords = [[]];

  // let front = 41;
  // let speed = 1;

  // let b = 0; //integral of all a's.
  // let a = 0; //current angle
  // let n = 0;

  // let amtBodies = 20;
  // let spacing = 10;

  // // const [time, setTime] = useState(0);
  // // const [delta, setDelta] = useState(0);
  let { time, delta } = props;
  useAnimationFrame(e => {
    // setTime(e.time);
    // setDelta(e.delta);
    // //console.log("frame: "+s.b)
    //let vals=[0.1,0,-0.1,0];


    //let d = 0.00;
    //let d = vals[Math.floor(e.time)%vals.length];
    //s.d.set(d);
    // console.log(d);
    //let d = Math.sin(e.time)/100;
    //let d = Math.sin(e.time / 400) * 1.0;

    calcTrajectory();
    appendPosition();

    //drawLineCoords();
    //calcBodyCoords();
  });

  useTimeoutLoop(() => {
      //calculate mouse position to set target

      //if len gets close to 0, set new target
      if (markReached)
      {
        s.tX.set(mouse.x - 250); //svg is centered at 250,250 
        s.tY.set(mouse.y - 250);
        
        //set next triangle
      }
  }, 16);

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
    )
  }

  const debugDraw = () => {
    let { lineCoords, bodyCoords, front, speed, b, a, n, amtBodies, spacing, displayPath, tX, tY, tA, d } = s.value



    return (
      <>
        {drawChart()}
        <path d={s.displayPath.value.toString()} stroke="black" strokeWidth="1" fill="none" />

        {/* lines for debugging: */}
        {/* difference rHeading */}



        {/*black target direction absolute tA */}
        <line x1={tX} y1={tY} x2={tX + Math.cos(tA) * 10} y2={tY + Math.sin(tA) * 10} stroke="black" strokeWidth="1" />

        {/*green line direction a */}
        <line x1={lineCoords[n][0]} y1={lineCoords[n][1]} x2={lineCoords[n][0] + Math.cos(a) * 10} y2={lineCoords[n][1] + Math.sin(a) * 10} stroke="green" strokeWidth="1" />

        {/*red line diff */}
        <line x1={lineCoords[n][0]} y1={lineCoords[n][1]} x2={tX} y2={tY} stroke="red" strokeWidth="1" />

        {/*black correction d */}
        <line x1={lineCoords[n][0]} y1={lineCoords[n][1]} x2={lineCoords[n][0] + Math.cos(a+d) * 10} y2={lineCoords[n][1] + Math.sin(a+d) * 10} stroke="black" strokeWidth="1" />


      </>
    );
  }

  function angleDiff(a, b) {
    let d = Math.abs(a - b);
    if (d > Math.PI) d = 2 * Math.PI - d;
    return d;
  }

  function closestAngle3(a1, a2, a3, target) {
    const d1 = angleDiff(a1, target);
    const d2 = angleDiff(a2, target);
    const d3 = angleDiff(a3, target);

    if (d1 <= d2 && d1 <= d3) return a1;
    if (d2 <= d3) return a2;
    return a3;
  }


  function clamp(num, min, max) {
    return num <= min
      ? min
      : num >= max
        ? max
        : num

  }

  //find one angle 
  //from target to next
  //

    const findHeadingTriangle = () => {
      let currentTriangle = s.currentTriangle.value;

      // find center of edge
      let e0 = s.triangles.value[currentTriangle][0];
      let e1 = s.triangles.value[currentTriangle][1];
      let e2 = s.triangles.value[currentTriangle][2];

      let edge0 = s.edges.value[e0];
      let edge1 = s.edges.value[e1];
      let edge2 = s.edges.value[e2];

      //edge format: x0, y0, x1, y1, tOne, tTwo    
      let xA = edge0.x0 + (edge0.x1 - edge0.x0) / 2;
      let yA = edge0.y0 + (edge0.y1 - edge0.y0) / 2;
      let xB = edge1.x0 + (edge1.x1 - edge1.x0) / 2;
      let yB = edge1.y0 + (edge1.y1 - edge1.y0) / 2;
      let xC = edge2.x0 + (edge2.x1 - edge2.x0) / 2;
      let yC = edge2.y0 + (edge2.y1 - edge2.y0) / 2;

      //calculate angles from center to each edge center
      // let centerX = (xA + xB + xC) / 3;
      // let centerY = (yA + yB + yC) / 3;

      


      let angleA = Math.atan2(yA - centerY, xA - centerX);
      let angleB = Math.atan2(yB - centerY, xB - centerX);
      let angleC = Math.atan2(yC - centerY, xC - centerX);


      const angles = [
        350 * Math.PI / 180,
        30 * Math.PI / 180,
        120 * Math.PI / 180
      ];

      const target = 10 * Math.PI / 180;

      closestAngle3(angles[0], angles[1], angles[2], target);
      // → returns ~350° (correct wrap-around behavior)

      // let angleIndexes = [angleA, angleB, angleC];

      // return angleIndexes;

    }

    const tempfunction = () => {
      s.triangles.value.forEach((tri, index) => {
        let triangleIndexes = findTriangles(index);
        //console.log("triangle "+index);
        console.log(index + " " + tri + " " + angleIndexes);
      });
    };

    const findTriangles = (index) => {


      // find triangle
      let triangle = s.triangle.value[index];

      //three indexes of edges of triangle
      let e0 = triangle[0];
      let e1 = triangle[1];
      let e2 = triangle[2];

      //find triangles for all three edges

      let t0 = s.edges.value[e0].tOne == index ? s.edges.value[e0].tTwo : s.edges.value[e0].tOne;
      let t1 = s.edges.value[e1].tOne == index ? s.edges.value[e1].tTwo : s.edges.value[e1].tOne;
      let t2 = s.edges.value[e2].tOne == index ? s.edges.value[e2].tTwo : s.edges.value[e2].tOne;
      //return three triangle indexes 

      return [t0, t1, t2];

    }

    const progressPosition = () => { 

      //set new triangle 
      let previousTriangle = s.currentTriangle.value;
      let currentTriangle = s.targetTriangle.value;

      //find triangles connected to current triangle
      let triangleIndexes = findTriangles(currentTriangle);

      //find three angles
      let angleIndexes = findHeadingTriangle(currentTriangle); 


      /*
      1. everytime position progresses, 
      2. based on previously set target triangle,
      */
      

    }

    const calcTrajectory = () => {
      let { lineCoords, a, n, latterX, latterY, d, latterAngle } = s.value;

      let formerX = lineCoords[n][0];
      let formerY = lineCoords[n][1];

      let deltaX = Math.abs(latterX - formerX);
      let deltaY = Math.abs(latterY - formerY);
      let deltaAngle = Math.atan2(deltaY,deltaX);

      let distance = Math.sqrt(dX * dX + dY * dY);


      let latterDeltaAngle = deltaAngle-latterAngle;
      let formerDeltaAngle = deltaAngle-a; 
      
      let isDAbsolute = rHeading < 0;
      let flat = rHeading == 0;

      // let out = flat ? 0 : Math.pow(Math.abs(rHeading), (1 / dist));

      let out = - Math.pow(Math.abs(latterAngle - formerAngle), (1 / distance));
      if (isDAbsolute) {
        out = -out;
      }
      d = out;


      // console.table([
      //   { dist:dist, a: a, d:d, oHeading: oHeading, tHeading: tHeading, rHeading: rHeading, out: out }
      // ]);
  
      s.d.set(d);
    }

    const appendPosition = () => {
      let { lineCoords, bodyCoords, front, startShift, speed, b, a, n, amtBodies, spacing, displayPath, d } = s.value;
      //let {lineCoords, bodyCoords,a,b,n, front, speed, amtBodies, spacing} = s;
      // temporarily give random d inputx
      // let d =  1.13 * Math.random() * 2 - 1 ;
      //d = d >= 0 ? clamp(d,0.001,1) : clamp(d,-1,-0.001);
      // use previous b (at position n)
      // a is the current angle.
      // use previous a (at position n)
      let dabs = (d >= 0) ^ (b >= 0);
      let flat = (a == 0);
      let output = 0;
      if (!flat) {
        output = (1 / Math.pow(Math.abs(b), 1 / a)) * Math.pow(Math.abs(d), 1 / a);
      }
      else {
        output = d;
      }

      if (dabs) {
        output = -output;
      }
      //output is a(n+1). we're calculating the next angle.
      //output = output >= 0 ? clamp(output,0.001,1000) : clamp(output,-1000,-0.001);
      a += output;
      b = b + a;
      //b = b >= 0 ? clamp(b,0.001,1000) : clamp(b,-1000,-0.001);
      n = lineCoords.length - 1;
      let xd = lineCoords[n][0] + Math.cos(a) * spacing;// * delta;
      let yd = lineCoords[n][1] + Math.sin(a) * spacing;// * delta;

      // let x = lineCoords[n][0] + xd;
      // let y = lineCoords[n][1] + yd;
      let x = xd;
      let y = yd;
      let len = lineCoords[n - 1][2] + Math.sqrt(xd * xd + yd * yd);

      lineCoords.push([
        x, y, len
      ]);

      startShift = lineCoords.length > amtBodies;

      if (startShift) {
        lineCoords.shift(); //remove first element to keep array size constant.
        displayPath = appendLastPoint(displayPath, lineCoords);
        displayPath = shiftPolylinePath(displayPath);

      }
      //displayPath.L(lineCoords[n][0], lineCoords[n][1]);
      // n++;

      //console.log("appendPosition| n=" + n + " a=" + a + " b=" + b + " d=" + d + " x=" + x + " y=" + y)

      let pString = [];
      //TODO: add rotation

      // console.table([
      //   { a: a, d:d, output: output }
      // ]);

      console.log(a);

      s.lineCoords.set(lineCoords);
      s.b.set(b);
      s.a.set(a);
      s.n.set(n);
      s.displayPath.set(displayPath);
    }

    const drawLineCoords = () => {
      let { lineCoords, bodyCoords, front, speed, b, a, n, amtBodies, spacing, displayPath } = s.value;

      //n++;
      //displayPath.L(lineCoords[n][0], lineCoords[n][1]);
      s.set({ bodyCoords: bodyCoords, lineCoords: lineCoords, b: b, a: a, n: n, front: front, speed: speed, amtBodies: amtBodies, spacing: spacing, displayPath: displayPath });
    }

    const calcBodyCoords = () => {
      /*
      //let {lineCoords, bodyCoords, front, speed, amtBodies, spacing} = s;        
      let { lineCoords, bodyCoords, front, speed, b, a, n, amtBodies, spacing, displayPath } = s.value;
  
      //bodyCoords = bodyCoords.slice(0, amtBodies);
      //front += speed;// * delta;
      front = lineCoords[lineCoords.length - 1][2];
  
      //console.log(lineCoords);
      let bodyIndex = 0;
      let j = lineCoords.length - 1;
      for (bodyIndex = 0; bodyIndex < amtBodies;) {
        let location = front - (bodyIndex * spacing);
        let found = false;
        while (!found) {
          //console.log(j);
          if (lineCoords[j][2] >= location && lineCoords[j - 1][2] < location) {
            found = true;
            let x1 = lineCoords[j - 1][0];
            let y1 = lineCoords[j - 1][1];
            let x2 = lineCoords[j][0];
            let y2 = lineCoords[j][1];
            let len1 = lineCoords[j - 1][2];
            let len2 = lineCoords[j][2];
  
            let totalLen = len2 - len1;
            let locationLen = location - len1;
            let ratio = locationLen / totalLen;
            let x3 = x1 + (x2 - x1) * ratio;
            let y3 = y1 + (y2 - y1) * ratio;
  
  
            bodyCoords[bodyIndex] = [x3, y3, location];
          }
          else {
            j--;
          }
        }
        bodyIndex++;
      }
  
      //console.log("front: "+front+" ");
      //setS({bodyCoords: bodyCoords, lineCoords: lineCoords, front: front, speed: speed, amtBodies: amtBodies, spacing: spacing});
      s.set({ bodyCoords: bodyCoords, lineCoords: lineCoords, b: b, a: a, n: n, front: front, speed: speed, amtBodies: amtBodies, spacing: spacing, displayPath: displayPath });
      */

      let { lineCoords, bodyCoords, front, speed, b, a, n, amtBodies, spacing, displayPath } = s.value;

      bodyCoords = [];
      front = lineCoords[n];
      lineCoords.forEach((element, index) => {

        //let rot = Math.atan2(lineCoords[ element[1], front[0} - element[1], front[0] - element[0]) * (180 / Math.PI);

        let rot = Math.atan2(lineCoords[index - 1][1] - element[1], lineCoords[index - 1][0] - element[0]) * (180 / Math.PI);
        bodyCoords.push({
          x: element[0],
          y: element[1],
          r: rot
        });
      });
    }


  // Dragon should convert lineCoords to bodyCoords
  return (
        <svg style={{ overflow: "visible" }} >
          <G3 x={0} y={0} z={0} scale={0.1}>
            {debugDraw()}
            {/* <Bodies time={time} bodyCoords={s.bodyCoords} /> */}
          </G3>
        </svg>
      )

    }


    const Bodies = (props) => {

      let { bodyCoords, time } = props;


      let bodies = [];

      bodyCoords.forEach((element, index) => {
        let version = index % 2 + 1;
        bodies.unshift(
          <Body position={{ x: element.x, y: element.y }} rotation={element.r} version={version} />
        )
      });


      //   useAnimationFrame(e => {

      //   });


      return (
        <>
          {/* <path d={dpt.toString()} stroke="black" strokeWidth="1" fill="none"/>       */}
          <G3>
            <g style={{ transform: "scale(0.006)" }}>
              {bodies}
              <Head position={{ x: bodyCoords[0][0], y: bodyCoords[0][1] }} rotation={0} />
            </g>
          </G3>
        </>
      )

    }


    const Body = (props) => {
      let { position, rotation, version } = props;

      let fill = "";
      if (version == 1) {
        fill = "#ffa14b";
      } else if (version == 2) {
        fill = "#ff684d";
      }

      //let variation = Math.round(Math.random())+1;
      let variation = 1;

      if (variation == 1) {
        return (
          <G3 x={position.x} y={position.y} z={position.z} rotation={180 + rotation}>
            <path d="M32.1103 62.0061C32.1103 62.0061 111.981 69.1106 123.19 67.2881C134.399 65.4655 148.489 58.2031 147.919 55.9053C147.348 53.6075 136.696 47.5348 118.274 48.0891C118.274 48.0891 132.018 44.7579 137.121 42.1424C142.223 39.5269 143.684 38.5778 142.239 33.587C140.793 28.5962 135.394 27.5358 133.307 26.4323C131.221 25.3288 115.703 19.6709 114.932 19.6622C114.932 19.6622 137.834 13.1952 139.34 12.5605C140.846 11.9258 143.59 8.26589 143.947 5.32634C144.304 2.38679 141.426-0.347562 139.491-2.8752C137.557-5.40283 117.082-12.542 112.965-12.3609L132.642-13.9553C132.642-13.9553 137.847-15.9854 138.896-16.965C139.944-17.9446 142.819-21.7623 141.428-24.6011C140.036-27.4398 131.812-35.8119 113.477-35.3511C113.477-35.3511 126.572-37.4593 129.576-41.2539C132.579-45.0486 136.632-51.3185 134.953-56.4311C133.273-61.5437 121.774-63.5313 120.493-64.4418C119.213-65.3524 108.737-64.7808 103.017-63.7898C97.2967-62.7988 39.4025-51.8145 39.4025-51.8145L5.41863 6.87784L32.1103 62.0061Z" fill={fill} fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          </G3>
        );
      } else if (variation == 2) {
        return (
          <G3 x={position.x} y={position.y} z={position.z} rotation={180 + rotation}>
            <path d="M32.4598 63.233C32.4598 63.233 108.263 70.0154 119.472 68.1928C130.681 66.3703 143.463 59.9431 142.892 57.6453C142.321 55.3476 136.291 46.4681 117.869 47.0224C117.869 47.0224 134.737 44.0839 139.84 41.4685C144.942 38.853 150.192 37.6936 148.746 32.7028C147.301 27.712 141.753 26.139 141.753 26.139C141.753 26.139 120.957 23.5916 120.185 23.5828C120.185 23.5828 135.979 17.4488 137.486 16.8141C138.992 16.1794 145.586 12.3972 145.943 9.45766C146.3 6.51811 147.485 3.84263 145.55 1.31499C143.615-1.21264 127.144-4.08875 123.028-3.90767L133.704-10.4351C133.704-10.4351 139.565-15.6882 140.614-16.6678C141.662-17.6474 141.657-23.5424 140.266-26.3811C138.875-29.2199 132.472-33.1964 114.136-32.7356C114.136-32.7356 129.488-36.7054 132.491-40.5C135.495-44.2947 135.705-50.9851 134.025-56.0977C132.345-61.2103 127.841-60.6305 126.56-61.541C125.28-62.4516 112.807-63.7108 107.087-62.7198C101.366-61.7288 39.752-50.5876 39.752-50.5876L5.76814 8.10473L32.4598 63.233Z" fill={fill} fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          </G3>)
      }



    }



    const Head = (props) => {
      let { position, rotation } = props;

      return (
        <G3 x={position.x} y={position.y} z={position.z} rotation={180 + rotation}>
          <path d="M-204.698 39.275L-254.233-11.3185L-278.672-28.6428L-293.026-20.7275L-290.915 2.11198L-280.668 20.5981L-263.609 31.5034L-250.391 41.874L-279.513 53.451L-290.811 68.7124L-269.691 76.0504L-246.666 71.6299L-214.817 57.8011L-192.294 49.5905L-204.698 39.275Z" fill="#40351d" fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-283.811 11.5293L-279.024 17.6297C-279.024 17.6297-260.948 27.7436-257.345 30.9769C-253.742 34.2102-249.134 36.3079-249.134 36.3079L-257.564 38.978L-265.819 34.2259L-285.21 22.2683C-285.21 22.2683-292.725 16.9476-294.459 10.2954C-296.194 3.64325-293.242 5.36055-293.242 5.36055L-283.811 11.5293Z" fill="#f4e819" fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M60.4939-78.5266C60.4939-78.5266 69.3268-82.5393 80.1674-81.3085C91.008-80.0777 78.0713-67.3698 78.0067-66.6703C77.9421-65.9707 68.4604-58.6057 68.4604-58.6057L53.2073-47.5613L66.2706-43.5862C66.2706-43.5862 76.2602-41.113 81.6921-36.9743C87.124-32.8356 81.9447-29.8631 81.4231-29.4135C80.9014-28.9638 68.2624-23.4991 68.2624-23.4991L38.6173-12.1358C38.6173-12.1358 68.2327 5.53593 70.1901 6.43781C72.1474 7.3397 85.2551 13.6492 88.4067 18.721C91.5583 23.7928 93.4897 27.2261 91.4015 29.9678C89.3134 32.7094 81.8886 32.5183 78.6173 30.9878C75.3461 29.4573 70.0132 28.181 69.1261 28.817C68.2391 29.453 44.2674 27.6212 44.2674 27.6212L63.1259 54.6252C63.1259 54.6252 67.5008 58.6607 68.8322 60.9654C70.1636 63.2702 80.0716 76.6067 80.9994 79.6327C81.9272 82.6588 85.5671 88.5689 81.8187 90.987C78.0703 93.4051 61.1506 77.8607 61.1506 77.8607L20.801 48.8814L30.1455 78.0466C30.1455 78.0466 33.9051 86.3431 34.2514 90.3086C34.5977 94.2742 33.5809 99.5795 30.2716 100.282C26.9622 100.984 19.1529 91.6887 19.1529 91.6887L4.83881 77.642L-10.6494 64.7096L-15.0556 61.2371L-15.0291 85.4741C-15.0291 85.4741-13.7094 87.4701-15.6328 89.8299C-17.5563 92.1897-21.0563 91.4435-23.1132 88.0214C-25.1701 84.5992-30.8255 75.2356-30.8255 75.2356L-36.8427 62.8968L-38.7237 75.2827C-38.7237 75.2827-38.3573 77.7612-39.9116 78.903C-41.4659 80.0448-46.0373 78.8352-46.5436 77.3163C-47.0499 75.7975-47.5561 59.9615-47.5561 59.9615L-10.6225 57.412L19.2478 41.6247L34.0015 7.82847L25.9508-28.9961L17.9787-53.4106L35.3561-72.918L60.4939-78.5266Z" fill="#e64a2d" fill-rule="nonzero" opacity="1" stroke="#8c6c01" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M66.359-92.8303C66.359-92.8303 59.8358-95.4729 53.2341-92.7549C46.6324-90.037 27.0903-80.0759 19.9947-75.3247C12.8992-70.5734-6.2116-61.7621-13.1709-60.7791C-20.1302-59.7962-103.303-40.2829-136.61-30.8382C-169.917-21.3934-164.42-17.2435-169.819-16.0024C-175.218-14.7613-182.092-7.75549-184.308-4.68315C-184.308-4.68315-192.639-7.11889-196.973-7.11889C-204.732-7.86132-213.925-14.3139-224.201-12.2454C-224.201-12.2454-240.85-28.008-247.059-30.0316C-247.059-30.0316-254.83-45.953-263.378-51.1051C-271.926-56.2572-282.049-55.0433-287.208-52.9251C-292.366-50.8068-297.432-34.3258-295.857-31.3064C-294.283-28.287-293.503-41.6475-285.266-39.842C-277.029-38.0364-260.083-26.8823-245.832-7.92386C-231.582 11.0346-215.535 33.2385-195.042 39.4634C-174.549 45.6883-118.028 39.8226-102.862 40.0455C-87.6961 40.2684-19.1232 48.0374-10.3134 43.0088C-1.50366 37.9801 19.0759 30.5671 14.4658 4.70547C9.85568-21.1561 6.7208-14.3652 9.50451-24.7977C12.2882-35.2302 18.7312-30.7869 20.9007-29.7879C23.0703-28.7889 26.8081-17.2451 22.3279-4.54845C22.3279-4.54845 25.8268 13.9594 23.1954 22.8429C20.564 31.7264 13.8853 46.1357 6.11467 50.4299C-1.656 54.7241-19.4823 57.8157-30.7198 57.6217C-41.9573 57.4276-75.9487 53.3932-79.6881 53.3932C-83.4276 53.3932-123.346 52.8271-133.374 54.5092C-143.402 56.1913-183.667 58.9574-188.604 59.5202C-193.541 60.0831-233.663 70.5893-239.285 73.2191C-244.907 75.8489-291.002 82.9294-291.002 82.9294C-291.002 82.9294-276.352 93.1509-265.908 92.1583C-255.465 91.1657-222.236 74.0963-215.202 71.8112C-208.167 69.5262-173.433 63.0063-162.289 61.6449C-151.144 60.2835-117.275 57.9889-109.118 57.5639C-100.96 57.139-67.8189 57.9408-62.0799 57.9408C-56.3409 57.9408-52.6448 64.8776-52.5389 70.4274C-52.4331 75.9772-52.7634 87.1441-46.4167 80.9385C-40.07 74.7328-43.3139 67.8313-43.3139 67.8313C-43.3139 67.8313-35.5056 88.3945-33.7507 89.3687C-31.9957 90.3429-30.9448 91.4824-30.1048 89.9588C-29.2648 88.4351-26.4634 73.6615-28.6217 66.7714C-28.6217 66.7714-16.6715 73.0077-12.9377 76.6428C-9.20378 80.278-3.02222 89.2057 5.83213 88.8452C5.83213 88.8452 7.79976 87.9251 7.75801 85.3296C7.71627 82.7341 4.01183 73.4626 3.82275 72.9857C1.81055 67.9098-0.549702 63.4623-1.52506 62.3166C-1.52506 62.3166 11.99 67.6937 13.1837 67.9701C14.3773 68.2465 35.8633 77.1517 39.6468 77.9527C43.4304 78.7537 51.2005 80.4021 52.5831 80.9549C53.9658 81.5078 59.0687 81.1101 59.489 78.1163C59.9093 75.1225 55.8059 62.0859 48.372 56.5113C40.9381 50.9367 34.9072 44.9729 34.9072 44.9729C34.9072 44.9729 47.4982 48.643 51.372 50.2541C55.2457 51.8652 56.7705 51.7473 62.6469 53.0516C68.5233 54.3558 75.687 56.1012 79.1704 57.1465C82.6538 58.1918 86.9947 60.5898 88.5263 59.0712C90.0578 57.5526 89.1699 44.6361 79.8688 38.2695C70.5677 31.9029 57.5975 18.543 57.3815 18.4245C57.1654 18.306 47.6172 12.0235 45.6451 10.8293C43.6729 9.63504 54.7916 5.02509 54.7916 5.02509C54.7916 5.02509 77.4092 0.560127 92.6302 3.57927C107.851 6.59841 105.477-5.64145 103.872-6.20507C102.268-6.76869 99.7133-11.2905 96.8873-12.3707C94.0613-13.451 70.1017-21.6984 68.3614-22.8153C66.621-23.9321 40.1349-32.5928 38.2119-31.7228C38.2119-31.7228 55.6555-40.0688 59.2554-42.9863C62.8553-45.9039 73.9387-50.9879 74.6641-51.7603C75.3896-52.5327 77.2274-55.9907 76.8647-57.9764C76.502-59.9622 70.3793-62.0163 68.2238-62.0757C66.0683-62.1351 28.383-56.8289 28.383-56.8289C28.383-56.8289 48.7802-67.5852 50.3379-69.571C51.8957-71.5568 60.0407-78.1277 61.9389-80.6459C63.8371-83.1642 67.5795-87.153 67.5795-88.593C67.5795-90.033 66.359-92.8303 66.359-92.8303Z" fill="#f56549" fill-rule="nonzero" opacity="1" stroke="#8c6c01" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-60.3643 58.6459C-60.3643 58.6459-55.6476 59.2835-54.1673 64.0377C-52.687 68.792-54.7707 83.3271-49.1075 82.8947C-43.4444 82.4623-44.2198 67.7065-44.2198 67.7065" fill="none" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-296.861-32.9489C-300.419-36.8013-305.163-43.0592-304.872-47.5733C-304.582-52.0874-302.855-56.3886-297.351-55.8656C-291.847-55.3425-287.026-49.7862-284.228-46.6102C-281.429-43.4341-276.527-43.5262-275.795-43.9613C-275.063-44.3964-266.431-50.0197-258.186-49.7051C-249.942-49.3905-243.743-46.9015-244.959-38.5574C-246.175-30.2133-257.445-30.2562-257.945-30.2148C-258.444-30.1733-264.93-28.9611-264.93-28.9611C-264.93-28.9611-293.303-29.0965-296.861-32.9489Z" fill="#d54e31" fill-rule="nonzero" opacity="1" stroke="#8c6c01" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-116.52-76.8777C-116.52-76.8777-145.108-88.1078-163.582-79.056C-182.056-70.0042-199.597-55.0299-199.279-29.5651C-198.962-4.10023-193.265-6.5279-193.265-6.5279L-167.751-5.36785L-137.259-20.0243L-116.728-36.6134L-107.781-66.5216L-116.52-76.8777Z" fill="#e2f48a" fill-rule="nonzero" opacity="1" stroke="#716437" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-41.4738 12.7307C-41.4738 12.7307-19.4336 7.94021-13.5051 8.47687C-7.57656 9.01353 1.97107 11.1624 3.98466 11.6998C5.99825 12.2372 9.12529 5.00196 9.10968-1.26848C9.09407-7.53892 1.25007-35.0081-2.93617-40.7456C-7.12241-46.4831-19.0144-56.2619-20.6957-56.7718C-22.3771-57.2817-30.7852-61.2495-30.7852-61.2495L-17.4899-17.5541L-35.4018 2.91999L-41.4738 12.7307Z" fill="#f4e819" fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-0.26813 2.38088C-0.26813 2.38088-2.74469-25.827-12.7011-41.5261C-22.6574-57.2253-45.8474-72.9868-53.7465-75.0905C-61.6456-77.1943-85.366-85.0555-103.783-72.6286C-122.199-60.2018-129.273-47.2286-131.642-42.2412C-134.011-37.2539-141.847-21.5926-123.58-2.88518C-105.314 15.8223-86.3721 18.7792-69.5984 16.8442C-52.8248 14.9092-52.2405 14.4911-52.2405 14.4911C-52.2405 14.4911-28.7828 9.93158-18.5673 1.06803C-18.5673 1.06803-9.59374-0.761884-0.26813 2.38088Z" fill="#e2f48a" fill-rule="nonzero" opacity="1" stroke="#716437" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-92.7984 8.32727C-92.7984 8.32727-92.1839 7.02541-93.6439 3.80661C-95.1038 0.587804-98.6093-10.1616-96.7714-16.6292C-94.9335-23.0968-85.5209-34.9936-83.9721-39.7649C-82.4234-44.5361-81.9437-58.3211-88.1993-61.5276C-94.455-64.7342-99.7966-64.4089-102.537-62.4656C-105.277-60.5223-115.951-53.6785-119.429-44.0233C-122.907-34.3681-126.868-29.8003-119.832-13.3583C-112.795 3.08369-101.104 6.31659-98.303 8.3383C-95.502 10.36-92.7984 8.32727-92.7984 8.32727Z" fill="#de5501" fill-rule="nonzero" opacity="1" stroke="none" />
          <path d="M-99.3383 2.25969C-99.3383 2.25969-105.394-5.07237-103.498-13.1549C-101.602-21.2374-96.1673-29.0278-93.536-33.1055C-90.9047-37.1832-87.4783-43.3071-87.4783-45.6327C-87.4783-47.9583-86.9869-53.2454-93.5685-57.4401C-100.15-61.6348-104.087-56.1677-106.189-54.0982C-108.291-52.0287-118.249-43.0529-118.452-32.6619C-118.655-22.271-116.908-15.3316-113.308-10.8575C-109.708-6.38341-99.3383 2.25969-99.3383 2.25969Z" fill="#493d21" fill-rule="nonzero" opacity="1" stroke="none" />
          <path d="M-174.197-14.4359C-174.197-14.4359-175.208-20.9691-173.761-26.5031C-172.314-32.037-162.485-44.057-161.141-47.1545C-159.797-50.252-155.448-59.6376-162.169-65.5C-168.889-71.3623-179.09-66.1249-180.325-64.6117C-181.561-63.0984-190.425-47.8168-190.989-42.352C-191.553-36.8873-194.023-24.9911-187.675-13.9691C-181.327-2.94712-182.332-5.81366-182.332-5.81366L-174.813-9.91772L-174.197-14.4359Z" fill="#de5501" fill-rule="nonzero" opacity="1" stroke="none" />
          <path d="M-177.008-13.4049C-177.008-13.4049-179.474-21.2105-176.569-29.0584C-173.665-36.9063-165.811-48.8687-164.649-50.9498C-163.486-53.0309-162.719-60.3066-168.796-61.9969C-174.872-63.6872-181.137-59.743-184.245-49.9696C-187.352-40.1962-190.767-35.8011-187.531-20.5256C-187.531-20.5256-186.357-15.7556-181.702-10.9561C-177.047-6.15674-177.491-9.01531-177.491-9.01531L-177.008-13.4049Z" fill="#493d21" fill-rule="nonzero" opacity="1" stroke="none" />
          <path d="M-299.387-16.4316C-299.387-16.4316-296.736-27.5542-286.485-25.7195C-276.234-23.8848-261.334-9.30335-261.334-9.30335L-270.614-5.6627L-283.068-5.70917L-294.428-6.98396L-299.729-12.6633L-299.387-16.4316Z" fill="#c1a807" fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-257.666 70.4854C-257.666 70.4854-271.719 53.9531-273.693 45.4845C-275.667 37.0159-283.962 38.5852-283.962 38.5852L-293.571 39.4201L-295.041 45.3485C-295.041 45.3485-297.506 52.5197-296.141 59.2898C-294.775 66.06-293.668 73.8751-293.668 73.8751L-272.63 77.3042L-261.142 73.4949L-257.666 70.4854Z" fill="#c1a807" fill-rule="nonzero" opacity="1" stroke="#ada489" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-155.784-52.6707C-150.728-54.5233-150.943-61.3745-153.003-62.5722C-155.063-63.7699-159.333-67.3018-163.389-63.5279C-167.445-59.754-164.994-54.2023-162.451-53.2968C-159.907-52.3914-155.784-52.6707-155.784-52.6707Z" fill="#fffffe" fill-rule="nonzero" opacity="1" stroke="none" />
          <path d="M-170.656-53.3369C-170.656-54.5339-169.73-55.5042-168.587-55.5042C-167.445-55.5042-166.518-54.5339-166.518-53.3369C-166.518-52.14-167.445-51.1697-168.587-51.1697C-169.73-51.1697-170.656-52.14-170.656-53.3369Z" fill="#f5ede5" fill-rule="nonzero" opacity="1" stroke="none" />
          <path d="M-95.0112-43.4286C-95.0112-44.8022-93.9157-45.9158-92.5643-45.9158C-91.2129-45.9158-90.1174-44.8022-90.1174-43.4286C-90.1174-42.0549-91.2129-40.9413-92.5643-40.9413C-93.9157-40.9413-95.0112-42.0549-95.0112-43.4286Z" fill="#f5ede5" fill-rule="nonzero" opacity="1" stroke="none" />
          <path d="M-283.477-38.987C-283.477-38.987-271.352-35.0031-262.237-26.0254C-253.123-17.0478-226.832 17.2927-219.066 23.989C-211.301 30.6852-202.591 47.3145-141.889 41.2339C-81.1868 35.1532-34.7857 44.4704-25.4435 44.2891C-16.1013 44.1079 3.34131 39.5127 9.05869 26.5518C14.7761 13.5909 15.0645-0.17685 10.7933-7.904C6.52198-15.6311 7.93857-31.1155 15.6171-31.5342C23.2957-31.9528 27.1026-20.9059 25.0573-13.1446C23.0119-5.38323 21.2949-5.28199 24.3842 3.54307C27.4734 12.3681 22.8606 29.7515 21.3714 32.3941C19.8822 35.0366 17.9752 49.2461-8.12374 56.2071C-34.2227 63.1681-41.6311 56.1438-63.5723 54.799C-85.5135 53.4541-120.013 53.0154-125.027 54.1092C-130.041 55.203-171.137 58.4813-177.454 58.4813C-183.771 58.4813-199.524 56.3006-207.761 49.5065C-215.999 42.7124-236.615 21.4566-241.065 15.0688C-245.515 8.68105-262.495-11.0849-266.927-14.5496C-271.359-18.0144-280.708-24.6902-286.383-25.4809C-292.059-26.2717-299.028-18.3137-299.857-13.0909C-299.857-13.0909-303.314-17.3546-301.119-22.5395C-297.052-32.1409-295.344-39.784-283.477-38.987Z" fill="#f4e819" fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-179.976 58.2883C-179.976 58.2883-223.395 66.751-233.703 72.2166C-244.011 77.6822-265.273 82.2873-271.272 83.442C-277.27 84.5967-288.364 87.1695-295.405 79.6133C-302.446 72.0572-299.646 65.4451-298.566 62.4988C-297.649 59.7475-296.567 56.4765-296.567 56.4765C-296.567 56.4765-293.941 69.2402-285.115 71.8034C-276.289 74.3666-263.696 71.9936-256.984 69.6308C-250.273 67.2681-235.151 59.0231-227.903 56.345C-220.655 53.6669-208.996 48.7109-208.516 48.7109C-208.036 48.7109-204.114 53.6833-195.618 55.3962C-187.122 57.1091-179.976 58.2883-179.976 58.2883Z" fill="#f4e819" fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-263.702 51.3447C-263.702 51.3447-251.475 43.0897-234.474 40.6567L-220.234 39.1516C-220.234 39.1516-227.2 31.2308-228.108 30.6063C-229.017 29.9818-240.596 33.0051-249.9 35.8179C-259.204 38.6307-266.21 42.2871-266.21 42.2871L-263.702 51.3447Z" fill="#f4e819" fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-261.463 65.5131C-261.463 65.5131-260.775 59.5854-261.552 56.1487C-262.328 52.712-265.52 46.6779-265.268 43.9033C-265.015 41.1288-263.835 33.2245-263.835 30.5094C-263.835 27.7944-263.269 15.9451-262.786 13.3327C-262.302 10.7202-257.904 3.07517-257.904 1.2542C-257.904-0.566764-257.507-5.47148-257.507-5.47148C-257.507-5.47148-262.894-10.2127-264.602-10.1689C-266.31-10.1251-272.045-8.9684-272.989-6.57555C-273.932-4.18271-279.012 1.28567-278.715 18.2798C-278.417 35.2739-269.215 56.3156-268.245 58.7023C-267.276 61.089-261.463 65.5131-261.463 65.5131Z" fill="#fbfbfb" fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-293.384 55.0419C-293.384 55.0419-298.778 46.1655-299.74 36.3356C-300.703 26.5056-300.063 15.4539-299.018 10.5622C-297.973 5.6705-293.466-4.9557-293.556-9.81321C-293.645-14.6707-296.293-17.4131-298.672-16.6059C-301.051-15.7987-303.182-13.6761-305.483-5.21496C-307.783 3.24619-311.425 17.8796-308.86 29.2022C-308.86 29.2022-310.063 37.1687-304.057 47.0931C-298.05 57.0174-295.441 57.1721-294.491 57.1721C-293.541 57.1721-293.384 55.0419-293.384 55.0419Z" fill="#fbfbfb" fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-289.015 8.26769C-289.015 8.26769-291.544 10.2831-295.055 9.48161C-298.566 8.68008-301.059 3.83915-298.301-1.86602C-295.542-7.57118-293.918-11.0385-289.72-10.5936C-285.522-10.1488-286.207-7.95775-286.155-6.76817C-286.104-5.5786-289.015 8.26769-289.015 8.26769Z" fill="#fbfbfb" fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-283.481 11.2193C-283.481 11.2193-289.004 10.8305-289.467 7.73579C-289.93 4.64105-289.558-0.719228-287.564-5.26875C-285.569-9.81828-282.64-11.906-279.837-11.9064C-277.033-11.9068-273.724-9.62942-273.174-9.3454C-272.624-9.06138-272.005-7.91496-272.963-3.24039C-273.922 1.43418-274.712 6.68048-275.841 8.96373C-276.969 11.247-278.046 11.3875-279.874 11.6586C-281.701 11.9297-283.481 11.2193-283.481 11.2193Z" fill="#fbfbfb" fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-293.254 48.0106C-292.229 48.0204-293.779 46.0029-294.695 44.5591C-295.611 43.1154-298.378 39.7223-298.757 32.4819C-299.137 25.2415-297.625 24.0944-295.582 23.9974C-293.54 23.9004-287.327 22.3674-287.087 25.2013C-286.848 28.0353-284.448 42.7359-284.448 42.7359L-285.342 46.3098C-285.342 46.3098-285.68 48.0655-287.15 48.7914C-288.62 49.5174-293.986 48.0036-293.254 48.0106Z" fill="#fbfbfb" fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-285.504 23.4135C-285.504 23.4135-284.407 24.592-279.329 21.9875C-279.329 21.9875-278.679 27.7173-278.202 32.102C-277.724 36.4866-274.724 43.6517-274.724 43.7196C-274.724 43.7875-274.922 49.5236-278.978 49.707C-278.978 49.707-285.107 49.6321-286.474 43.045C-287.841 36.4579-286.77 35.1997-287.926 31.8242C-289.083 28.4488-285.504 23.4135-285.504 23.4135Z" fill="#fbfbfb" fill-rule="nonzero" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M22.8926-0.712495C22.8926-0.712495 17.94-9.27154 17.7847-12.9003C17.6293-16.5291 15.9941-23.5317 15.9941-23.5317" fill="none" opacity="1" stroke="#84552c" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="2" />
          <path d="M-93.1531-49.4531C-93.1531-49.4531-88.997-43.6502-83.3442-46.3532C-77.6914-49.0561-77.2711-55.0563-79.1703-57.4236C-81.0694-59.7908-86.2695-62.3571-90.7032-58.8982C-95.1369-55.4392-93.1531-49.4531-93.1531-49.4531Z" fill="#fffffe" fill-rule="nonzero" opacity="1" stroke="none" />
          <path d="M-275.365-35.57C-275.365-35.57-261.404-32.6731-257.524-34.1081C-253.643-35.543-252.149-44.7678-263.816-41.3863C-275.483-38.0048-275.365-35.57-275.365-35.57Z" fill="#4b3d20" fill-rule="nonzero" opacity="1" stroke="none" />
          <path d="M-290.374-39.0918C-290.374-39.0918-293.397-45.7803-295.361-48.1334C-297.325-50.4865-301.226-48.0609-300.189-44.4456C-299.152-40.8303-297.666-41.2862-295.918-38.1689C-293.756-36.5878-290.374-39.0918-290.374-39.0918Z" fill="#4b3d20" fill-rule="nonzero" opacity="1" stroke="none" />
        </G3>
      );
    }
