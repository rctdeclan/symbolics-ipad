import React, { PureComponent, useState} from "react";
import Path from "react-svg-path";

class DVInstructie {

  let points = new Map();
  let curves = new Map();
  let colors = new Map();

myMap.set('id1', 'value1');
myMap.set('id2', 'value2');
myMap.set('id3', 'value3');

console.log(myMap.get('id1')); // "value1"
  constructor() {
  }

  function populate(points, curves, colors) {
    // Populate the points, curves, and colors maps with data
    this.points = new Map(points);
    this.curves = new Map(curves);
    this.colors = new Map(colors);
  }
}

//TODO: 
/*
1. render functie. losse classes maken voor svg dsl tags
2. state dv instrutie omzetten naar svg dsl.




de boom word gerenderd.
de return functie geeft een svg dsl. die word gerenderd in de canvas.

de graphic render staat voor de svg dsl stukje

ook children nodig?
children word gebruikt voor losse graphics.

een klasse maken voor een dv instructie.
klasse bestaat uit een map met punten, een map met lijnen (curves) en een map met kleuren.
all maps hebben identifiers.

instanties van de dv instructie klasse, worden doorgegeven aan graphics

*/

export class Graphic extends PureComponent() {
  constructor(props) {
    super(props);
  }

//graphic is een PureComponent graphic maakt gebruik van functionalilteit van de comp.
//graphic heeft 3 delen
// het omzetten van live instructies naar render code.
//gebruik maken van de state van de comp.
// state code gebruikt comp functions. die functies worden gebruikt in de comp.
//op basis van state verdere instructies geven. de instructies die worden gegeven aan de doorvoering code.
//die instructies worden in elk frame aan de doovoeringen gebraagd.


}