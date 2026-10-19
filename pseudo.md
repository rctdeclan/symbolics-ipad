user stories

- projectielijn op basis van gazepoint.
- animatie van projectielijn
- spline point provider
- diepte (gantt)
- timing op maat
- compositie met tijd aanduiding. Allemaal gantt.
- basis beat ipv source liedje
- mockup gaze point
- je kijkt naar objecten in de trajectory, lijn omvat ze. Op meerdere afstanden van het scherm.
 
een functie die een coordinaat geeft.
het volgt een curve. die curve heeft een aanpasbare hoek
de hoek word niet direct aangepast, maar volgt een functie.

functie voor ophalen coordinaat van de totale lijn, op specifiek punt in de lijn.

de snelheid word aangepast. tweens. net zoals in de video.

er is motion blur
=
gaze point selecteert plekken waar de slangendraak naar toe gaat

een nieuwe locatie wanneer er een beat is in de muziek

    https://mafs.dev/guides/examples/bezier-curves
    https://www.youtube.com/watch?v=aVwxzDHniEw
    https://jsfiddle.net/effrenus/17mo04hb/18/
    https://www.stkent.com/2015/07/03/building-smooth-paths-using-bezier-curves.html
    https://blogs.sw.siemens.com/solidedge/its-all-about-curvature-and-curvature-is-all-about-splines-curves/
    https://www.youtube.com/watch?v=jvPPXbo87ds

    
    https://github.com/stesel/react-frame-rate
    

 //      {pt.toComponent({strokeWidth:1,stroke:"black",fill:"none"})}
\





###3d

react classes return 2.5d rendered svg.
Stage defines a position of a simple camera perspective
All children define a position and 2d rotation.
position can be placed backward in z space.
svg ordering is based on painters algorithm

Perspective projection.

scale towards horizon point

test parallax

perspective function takes 3d coordinates and projects them to screen space.

3d coordinates and angleZ can be applied by props.

perspective is defined in stage

children of stage are given 


https://github.com/themadcreator/seen/blob/master/src/camera.coffee




stage
g3 x y z rot, composes g+properties
rect3 x y z rot, composes rect+properties 
path3 x y z rot, composes path+properties




x 400
becomes
x 200

zfactor = .5

zfactor = 100 / (1-z )

zf = 1: distance from origin = 0;
zf = .5: (further) distance from origin = d / -z where d = 100 and z = -100
zf = 2: (closer) distance from origin = d / -z where d = 100 and z = 100

scale,translate towards vanishing point

rect:
x. 400
y. 0
z. -200
r. 0
zf. 0.5

transform: pos sc rot

zf = 100 / -z;

x,y: position from screen center.

pos: translate (x,y)

zf = base / -z;
mid: translate(50%,50%)
pos: translate(x*zf,y*zf);
sc: scale(zf)
rot: rotate(r)


0: vanishing point
1: screen
zf = z

z = 0, zf = 1
z = 10, zf = 0.9
z = 20, zf = 0.8

zf = 1 - 1/()

0.1
0.2
0.3
0.0004

zf = 1 - depth
depth: 1...0

z = 400
z = 0

1 - z

1 - 0 = 1

1 - 400 = -399

1 - (1/z)

op positie 0 is factor 1 en schaal 1

wat is zf door z?

zf 0 bij z oneindig

zf factor steeds minder verminderen


nare dingen op het traject zorgen voor voelen dat de spoedige afronding onprettig is.


zf 0.9
zf 0.3
d.
zf=1/(1+z)


als een object verder naar achteren gaat, word de schaal minder.
de schaal word steeds minder naar achteren geplaatst.


1/
https://editor.method.ac/

https://www.developerway.com/posts/react-elements-children-parents

https://www.smashingmagazine.com/2021/08/react-children-iteration-methods/

https://www.npmjs.com/package/cardinal-spline-js

https://github.com/Zunawe/bezier-spline

https://github.com/dowrow/bezier-spline-js/blob/master/bezier-spline.jsx




-----


afbuiging trajectory

simpele curve die getrokken word vanaf het veranderende startpunt en overlappend is met de muispositie. de boog gaat door na de positie van de muis.

bereken de curve 
teken een lijn 

de slangendraak krijgt een nieuwe positie over tijd

