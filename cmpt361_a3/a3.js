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


////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////
const DEF_INPUT = [
"v,0,10,1,0,0;",
"v,10,0,0,1,0;",
"v,20,10,0,0,1;",
"v,10,20,1,1,0;",
"t,0,1,2;",
"t,1,0,3;"
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
  // get vertices and point coordinates, and the vertices colors
  const [x1, y1, [r1,g1,b1]] = v1;
  const [x2, y2, [r2,g2,b2]] = v2;
  const [x3, y3, [r3,g3,b3]] = v3;
  const [px, py] = p;
  // calculate the smaller areas defined by vertices and p

  //const edge = (x0, y0, x1, y1, px, py) => (px - x0) * (y1 - y0) - (py - y0) * (x1 - x0);
  
  const a1 = (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1);
  const a2 = (x3 - x2) * (py - y2) - (y3 - y2) * (px - x2);
  const a3 = (x1 - x3) * (py - y3) - (y1 - y3) * (px - x3);


  //const A = (y2 - y3)*(x1 - x3) + (x3 - x2)*(y1 - y3);
  //const A = a1+a2+a3;
  //barycentric coordinates
  // const u = a1 / A;
  // const v = a2 / A;
  // const w = 1 - u - v;
  const area = edge(x1, y1, x2, y2, x3, y3);
  // if (area === 0) return null; // degenerate

  // barycentric weights (using edge functions)
  const u = edge(x2, y2, x3, y3, px, py) / area; // weight for v1
  const v = edge(x3, y3, x1, y1, px, py) / area; // weight for v2
  const w = 1.0 - u - v;   
  
  // get the color at p
  const r = u * r1 + v * r2 + w * r3;
  const g = u * g1 + v * g2 + w * g3;
  const b = u * b1 + v * b2 + w * b3;
  return [r, g, b]
}


function pointIsInsideTriangle(v1,v2,v3,p){
  let isInside_v1v2 = false;
  let isInside_v2v3 = false;
  let isInside_v1v3 = false;
  const [x1,y1] = v1;
  const [x2,y2] = v2;
  const [x3,y3] = v3;
  const [px,py] = p;
  const w1 = edge(x1, y1, x2, y2, px, py);
  const w2 = edge(x2, y2, x3, y3, px, py);
  const w3 = edge(x3, y3, x1, y1, px, py);

  const area = edge(x1, y1, x2, y2, x3, y3);

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
//line between v1 and v2
  // let a = y2 - y1;
  // let b = x2 - x1;
  // let c = x2*y1 - x1*y2;
  // if (px*a + py*b + c >= 0 || isTopLeft(v1,v2)) {
  //   isInside_v1v2 = true;
  // } // top-left rule
  // //line between v2 and v3
  // a = y3 - y2;
  // b = x3 - x2;
  // c = x3*y2 - x2*y3;
  // if (px*a + py*b + c >= 0 || isTopLeft(v2,v3)) {
  //   isInside_v2v3 = true;
  // } // top-left rule
  // // line between v1 and v3
  // a = y1 - y3;
  // b = x3 - x1;
  // c = x3*y1 - x1*y3;
  // if (px*a + py*b + c >= 0 || isTopLeft(v2,v3)) {
  //   isInside_v1v3 = true;
  // } // top-left rule

  
  // return isInside_v1v2 && isInside_v2v3 && isInside_v1v3;
}

function isTopLeft (v1,v2) {
  const [x1, y1] = v1;
  const [x2, y2] = v2;
  let x = 0;
  let y = 1;
  const edge = [x2 - x1, y2 - y1];

  const is_top_edge = edge[y] === 0 && edge[x] > 0; 
  const is_left_edge = edge[y] < 0;

  return is_left_edge || is_top_edge;
}

const edge = (x1, y1, x2, y2, px, py) => (px - x1)*(y2 - y1) - (py - y1)*(x2 - x1);

// DO NOT CHANGE ANYTHING BELOW HERE
export { Rasterizer, Framebuffer, DEF_INPUT};


