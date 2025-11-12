import { Framebuffer } from './framebuffer.js';
import { Rasterizer } from './rasterizer.js';
// DO NOT CHANGE ANYTHING ABOVE HERE

////////////////////////////////////////////////////////////////////////////////
// TODO: Implement functions drawLine(v1, v2) and drawTriangle(v1, v2, v3) below.
////////////////////////////////////////////////////////////////////////////////

// take two vertices defining line and rasterize to framebuffer
Rasterizer.prototype.drawLine = function(v1, v2) {
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  // TODO/HINT: use this.setPixel(x, y, color) in this function to draw line
  let dx = x2 - x1;
  let dy = y2 - y1;

  let color1 = [r1, g1, b1];
  let color2 = [r2, g2, b2];
  let step;
  if (Math.abs(dx) >= Math.abs(dy)) {
    step = Math.abs(dx);
  }
  else {
    step = Math.abs(dy);
  }
  dx /= step;
  dy /= step;

  let x = x1
  let y = y1
  for (let i = 0; i <= step; ++i) {
    let frac = i / step;
    let colormix = color_interp(color1, color2, frac)
    this.setPixel(Math.floor(x), Math.floor(y), colormix);
    x += dx;
    y += dy;
  }
}

// take 3 vertices defining a solid triangle and rasterize to framebuffer
Rasterizer.prototype.drawTriangle = function(v1, v2, v3) {
  const [x1, y1] = v1;
  const [x2, y2] = v2;
  const [x3, y3] = v3;

  const xmin = Math.ceil(Math.min(x1,x2,x3));
  const xmax = Math.ceil(Math.max(x1,x2,x3));
  const ymin = Math.ceil(Math.min(y1,y2,y3));
  const ymax = Math.ceil(Math.max(y1,y2,y3));

  for (let x = xmin; x <= xmax; x++) {
    for (let y = ymin; y <= ymax; y++) {
      let p = [x + 0.5, y + 0.5];
      let color = barycentricCoordinates(v1, v2, v3, p);
      if (pointIsInsideTriangle(v1, v2, v3, p)) {
        this.setPixel(x, y, color);
      }
    }
  }
  // TODO/HINT: use this.setPixel(x, y, color) in this function to draw triangle
}

// max canvas length 64x64 (0-indexed) => middle is 31x31

// RED: 1.0,0.0,0.0
// GREEN: 0.0,1.0,0.0
// BLUE: 0.0,0.0,1.0

// CLOTHES : 1.0, 0.8588, 0.6745
// BELT: 0.3686, 0.2784, 0.2509

////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////
const DEF_INPUT = [

  // Sillouhette of an Madeline from Celeste (video game)
"v,24, 20, 0.1294, 0.1215, 0.1137;",
"v,28, 20, 0.1294, 0.1215, 0.1137;",
"v,24, 36, 0.1294, 0.1215, 0.1137;",
"v,29, 36, 0.1294, 0.1215, 0.1137;",

"l,0,1;",
"l,1,3;",
"l,2,0;",
"t,0,1,2;",
"t,1,3,2;",
"v,23, 21, 0.1294, 0.1215, 0.1137;", // left edge of head v4
"v,23, 37, 0.1294, 0.1215, 0.1137;", // left bottom of head v5
"v,29, 21, 0.1294, 0.1215, 0.1137;", // right edge of head v6
"v,29, 35, 0.1294, 0.1215, 0.1137;", // right bottom of head v7
// left and right profile of head
"l,4,5;",
"l,6,7;",

// left body
"v,22, 22, 0.1294, 0.1215, 0.1137;", // top left v8
"v,22, 33, 0.1294, 0.1215, 0.1137;", // bottom left v9
"l,8,9;",

// //right profile of head
"v,30, 22, 0.1294, 0.1215, 0.1137;", // top right v10
"v,30, 24, 0.1294, 0.1215, 0.1137;", // bottom right v11
"l,10,11;",

// start of backpack
"v,21, 23, 0.1294, 0.1215, 0.1137;", // v12
"v,21, 36, 0.1294, 0.1215, 0.1137;", // v13
"l,12,13;",

// backpack strap left
"v, 19, 28, 0.1294, 0.1215, 0.1137;", // left arm top v14
"v, 19, 35, 0.1294, 0.1215, 0.1137;", // left arm top v15
"l,14,15;",
"v, 18, 34, 0.1294, 0.1215, 0.1137;", // left arm top v16
"v, 18, 33, 0.1294, 0.1215, 0.1137;", // left arm top v17
"l,16,17;",

// //backpack
"v, 18, 32, 0.1294, 0.1215, 0.1137;", //
"v, 19, 36, 0.1294, 0.1215, 0.1137",
"p, 18;",
"p, 19;",

// right arm details
"v,26, 20, 0.1294, 0.1215, 0.1137;", // 20
"v,26, 36, 0.1294, 0.1215, 0.1137;", // 21
"l,20,21;",

"v, 30, 27, 0.1294, 0.1215, 0.1137;", // top right v22
"p, 22;",
"v,30, 30, 0.1294, 0.1215, 0.1137;", // bottom right v23
"v,30, 31, 0.1294, 0.1215, 0.1137;", // v24
"p, 23;",
"p, 24;",

// // colorsss

"v, 24, 21, 0.8117, 0.2509, 0.2117;", // red v25
"v, 28, 21, 0.8117, 0.2509, 0.2117;", // red v26
"v, 23, 25, 0.8117, 0.2509, 0.2117;", // red v27
"v, 27, 25, 0.8117, 0.2509, 0.2117;", // red v28
"l, 25, 26;",
"t, 26, 27, 28;",
"v, 24, 25, 0.9450, 0.7607, 0.4901;", // skin v29
"v, 28, 25, 0.9450, 0.7607, 0.4901;", // skin v30
"l, 29, 30;",
"v, 24, 26, 1.0, 0.8588, 0.6745;", // skin v31
"v, 28, 26, 1.0, 0.8588, 0.6745;", // skin v32
"l, 31, 32;",
"v, 24, 27, 0.9450, 0.7607, 0.4901;", // skin v33
"v, 27, 27, 0.9450, 0.7607, 0.4901;", // skin v34
"l, 33, 34;",
"v, 24,26,0.9450, 0.7607, 0.4901;", // 35
"p, 35;",

"v, 23, 22, 0.8117, 0.2509, 0.2117;", // red v36
"v, 29, 22, 0.8117, 0.2509, 0.2117;", // red v37
"v, 22, 24, 0.8117, 0.2509, 0.2117;", // red v38
"v, 29, 24, 0.8117, 0.2509, 0.2117;", // red v39
"l, 36,37;",
"l, 38, 39;",
"v, 22, 23,0.8117, 0.2509, 0.2117;", // red v40
"v, 29, 23, 0.8117, 0.2509, 0.2117;", // red v41
"l, 40,41;",

// dark red accents
"v, 24, 25, 0.6196, 0.09411, 0.09411;", // dark red v42
"v, 23, 26, 0.6196, 0.09411, 0.09411;", // dark red v43
"p, 42;",
"p, 43;",
"v, 29, 27, 0.6196, 0.09411, 0.09411;", // dark red v44
"p, 44;",
"v, 24, 21, 0.6196, 0.09411, 0.09411;", // v45
"p, 45;",
"v, 28, 21, 0.6196, 0.09411, 0.09411;", // v46
"p, 46;",
"v, 29, 22, 0.6196, 0.09411, 0.09411;", // v47
"p, 47;",
"v, 28, 24, 0.6196, 0.09411, 0.09411;", // v48
"p, 48;",
"v, 27, 24, 0.6196, 0.09411, 0.09411;", // v49
"p, 49;",
"v, 27, 23, 0.6196, 0.09411, 0.09411;", // v50
"p, 50;",
"v, 22, 23, 0.6196, 0.09411, 0.09411;", // v51
"p, 51;",
"v, 22, 24, 0.8117, 0.2509, 0.2117;", // v52
"v, 22, 26, 0.8117, 0.2509, 0.2117;", // v53
"v, 22, 27, 0.3686, 0.2784, 0.2509;", // v54
"v, 24, 27, 0.3686, 0.2784, 0.2509;", // v55
"l, 54,55;",
"v, 22, 23, 0.8117, 0.2509, 0.2117;", // v51
"v, 22, 26, 0.8117, 0.2509, 0.2117;", // v51
"l, 56,57;",
"v, 23, 25,0.8117, 0.2509, 0.2117;", // v58
"p, 58;",

// //torso
// //brown caca thing
"v, 20, 28, 0.3686, 0.2784, 0.2509;", // 59
"v, 27, 28, 0.3686, 0.2784, 0.2509;", // 60
"l, 59, 60;",
"v, 22, 35, 0.6, 0.2901, 0.1960;", // 61
"v, 28, 35,0.6, 0.2901, 0.1960;", // 62
"l, 61, 62;",
"v, 20, 30, 0.6, 0.2901, 0.1960;", // 63
"v, 28, 29, 0.6, 0.2901, 0.1960;", // 64
"l, 63, 64;",
"v, 28, 35, 0.6, 0.2901, 0.1960;", // 65
"v, 20, 34, 0.6, 0.2901, 0.1960;", // 66
"t, 63, 64, 65;",
"t, 63, 65, 66;",
"l, 63,66;",
"v, 28, 30, 0.6, 0.2901, 0.1960;", // 67
"v, 28, 36, 0.6, 0.2901, 0.1960;", // 68 END OF RIGHT FOOT
"l, 67,68;",
"v, 27, 30, 0.6, 0.2901, 0.1960;", // 69
"v, 27, 36, 0.6, 0.2901, 0.1960;", // 70 these two lines
"l, 69,70;",
"v, 22, 30, 0.6, 0.2901, 0.1960;", // 71
"v, 22, 36, 0.6, 0.2901, 0.1960;", // 72
"l, 71,72;",
"v, 23, 30, 0.6, 0.2901, 0.1960;", // 73
"v, 23, 38, 0.6, 0.2901, 0.1960;", // 74
"l, 73,74;",
"v, 23, 36, 1.0, 0.8588, 0.6745;", // 75
"p, 75;",
"v, 28, 36, 1.0, 0.8588, 0.6745;",
"p, 76;",
"v, 22, 35 ,0.6, 0.2901, 0.1960;",
"v, 28, 35  ,0.6, 0.2901, 0.1960;",
"l, 77,78;",
"v, 24, 35, 0.0, 0.0, 0.0;", // 79
"p, 79;",
"v, 24, 36, 0.1294, 0.1215, 0.1137;", // 79
"p, 80;",
"v, 27, 39, 0.0, 0.0, 0.0;",
"v, 28, 39, 0.0, 0.0, 0.0;",
"l, 81, 82;",
"v, 27, 38, 0.6, 0.2901, 0.19605;",
"p, 83;",
"v, 21, 33, 0.3686, 0.2784, 0.2509;", //
"v, 28, 33, 0.3686, 0.2784, 0.2509;", //
"l, 84,85;",
"v, 22, 30, 0.3686, 0.2784, 0.2509;", //
"v, 22, 34, 0.3686, 0.2784, 0.2509;", //
"l, 86,87;",
"v, 23, 32, 0.3686, 0.2784, 0.2509;", //
"p, 88;",
"v, 20, 36, 0.1294, 0.1215, 0.1137;",
"p, 89;",
"v, 20, 27, 0.1294, 0.1215, 0.1137;",
"p, 90;",
"v, 19,28, 0.1294, 0.1215, 0.1137;",
"p, 91;",
"v, 20, 35, 0.4901, 0.4901, 0.49010;",
"v, 20, 33, 0.4901, 0.4901, 0.49010;",
"l, 92, 93;",
"v, 19, 34, 0.4901, 0.4901, 0.49010;",
"v, 19, 35, 0.4901, 0.4901, 0.49010;",
"p, 94;",
"p, 95;",
"v, 18, 35, 0.1294, 0.1215, 0.1137;",
"p, 96;",
"v, 22, 30, 0.0, 0.5176, 1.0;",
"v, 27, 30, 0.0, 0.5176, 1.0;",
"l, 97,98;",
"v, 23, 31, 0.0, 0.5176, 1.0;", // 99
"v, 27, 31, 0.0, 0.5176, 1.0;", // 100
"l, 99,100;",
"v, 24, 30, 0.9450, 0.7607, 0.4901;",
"v, 25, 30, 1.0, 0.8588, 0.6745;",
"l, 101,102;",
"v, 28, 30, 0.9450, 0.7607, 0.4901;",
"v, 29, 30, 0.9450, 0.7607, 0.4901;",
"l, 103, 104;",
"v, 24, 31, 0.9450, 0.7607, 0.4901;",
"v, 25, 31, 1.0, 0.8588, 0.6745;",
"l, 105,106;",
"v, 28, 31, 0.9450, 0.7607, 0.4901;",
"v, 29, 31, 0.9450, 0.7607, 0.4901;",
"l, 107, 108;",
"v, 20, 29, 0.3686, 0.2784, 0.2509;", // 59
"v, 21, 29, 0.3686, 0.2784, 0.2509;", // 60
"l, 109, 110;",
"v, 22, 28, 0.6, 0.2901, 0.1960;", // 59
"v, 23, 28, 0.6, 0.2901, 0.1960;", // 60
"l, 111, 112;",
"v, 24, 28, 0.1764, 0.2784, 0.4;", //
"v, 25, 28, 0.1764, 0.2784, 0.4;", //
"l, 113,114;",
"v, 23, 29, 0.1764, 0.2784, 0.4;",
"v, 27, 29, 0.1764, 0.2784, 0.4;",
"l, 115,116;",
"v, 24, 29, 0.6, 0.2901, 0.1960;",
"v, 25, 29, 0.0, 0.5176, 1.0;",
 "l, 117,118;",
"v, 20, 27, 0,0,0;", // 59
"p, 119;"

].join("\n");

function color_interp(color1,color2,frac) {
  const [r1,g1,b1] = color1;
  const [r2,g2,b2] = color2;
  const r = (r2 - r1) * frac + r1;
  const g = (g2 - g1) * frac + g1;
  const b = (b2 - b1) * frac + b1;
  return [r,g,b]
}

function barycentricCoordinates(v1, v2, v3, p) {
  // Get vertices and point coordinates, and the vertices colors
  const [x1, y1, [r1,g1,b1]] = v1;
  const [x2, y2, [r2,g2,b2]] = v2;
  const [x3, y3, [r3,g3,b3]] = v3;
  const [px, py] = p;
  // calculate the smaller areas defined by vertices and p
  // const a0 = tripleProduct(x1,y1,x2,y2,px,py); a0 is the root problem but idk why??
  const a1 = tripleProduct(x2,y2,x3,y3,px,py);
  const a2 = tripleProduct(x3,y3,x1,y1,px,py);
  // calculate big area
  const A = tripleProduct(x1, y1, x2, y2, x3, y3);
  // barycentric coordinates (u + v + w = 1)
  const u = a1 / A;
  const v = a2 / A;
  const w = 1.0 - u - v;
  // get the color at p
  const r = u * r1 + v * r2 + w * r3;
  const g = u * g1 + v * g2 + w * g3;
  const b = u * b1 + v * b2 + w * b3;
  return [r, g, b]
}


function pointIsInsideTriangle(v1,v2,v3,p){
  const [x1,y1] = v1;
  const [x2,y2] = v2;
  const [x3,y3] = v3;
  const [px,py] = p;

  const w1 = tripleProduct(x1, y1, x2, y2, px, py);
  const w2 = tripleProduct(x2, y2, x3, y3, px, py);
  const w3 = tripleProduct(x3, y3, x1, y1, px, py);

  const area = tripleProduct(x1, y1, x2, y2, x3, y3);

  const topLeft1 = isTopLeft(v1, v2);
  const topLeft2 = isTopLeft(v2, v3);
  const topLeft3 = isTopLeft(v3, v1);

  if (area > 0) { // CCW -> inside = left (w > 0), boundary included for top-left edges
    return (w1 > 0 || (w1 === 0 && topLeft1)) &&
           (w2 > 0 || (w2 === 0 && topLeft2)) &&
           (w3 > 0 || (w3 === 0 && topLeft3));
  } else {        // CW -> signs flip
    return (w1 < 0 || (w1 === 0 && topLeft1)) &&
           (w2 < 0 || (w2 === 0 && topLeft2)) &&
           (w3 < 0 || (w3 === 0 && topLeft3));
  }
}


function isTopLeft (v0,v1) {
  const [x1, y1] = v0;
  const [x2, y2] = v1;
  let x = 0;
  let y = 1;
  const edge = [x2 - x1, y2 - y1];

  const is_top_edge = edge[y] === 0 && edge[x] > 0;
  const is_left_edge = edge[y] > 0;

  return is_left_edge || is_top_edge;
}

const tripleProduct = (x0, y0, x1, y1, px, py) => px*(y0-y1) + py*(x1-x0) + x0*y1-y0*x1;

// DO NOT CHANGE ANYTHING BELOW HERE
export { Rasterizer, Framebuffer, DEF_INPUT};


