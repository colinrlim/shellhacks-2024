const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const xOffset = 0.5 * canvas.width;
const yOffset = 0.5 * canvas.height;

const nodeFill = "black";
const nodeStroke = "black";
const nodeRadius = 10;

const edgeFill = "black";
const edgeStroke = "black";
const arrowOffset = 0.4;
const arrowWidth = 10;

const textFill = "black";
const textBorder = 5;

const labelOffset = nodeRadius * 0.5;
const textHeight = 10; // pixels
ctx.font = textHeight.toString() + "px Arial";

/* GENERATION CONSTANTS */
const r = 100;

/* PHYSICS CONSTANTS */
const kAttr = 0.05;
const kRep = 1000000;
const kVert = 50;
const damping = 0.6;
const threshold = 0.1;
const dt = 0.1;

let nodes = [
  { label: "Alpha", children: ["Beta", "Gamma"], prereqs: ["Psi", "Omega"] },
  { label: "Beta", children: ["Theta"], prereqs: ["Alpha", "Gamma"] },
  { label: "Gamma", children: ["Beta"], prereqs: ["Alpha"] },
  { label: "Psi", children: ["Alpha"], prereqs: [] },
  { label: "Omega", children: ["Alpha", "Theta"], prereqs: [] },
  { label: "Theta", children: [], prereqs: ["Beta", "Omega"] },
];

const rootNode = nodes[0];
/* node structure - distinct from topics, just for rendering */
// {
//     label: string;
//     children: string[];
//     parents: string[];
//     level: number;
//     x: number;
//     y: number;
//     vx: number;
//     vy: number;
// }
let edges = [
  { from: "Alpha", to: "Beta" },
  { from: "Alpha", to: "Gamma" },
  { from: "Omega", to: "Alpha" },
  { from: "Psi", to: "Alpha" },
  { from: "Gamma", to: "Beta" },
  { from: "Beta", to: "Theta" },
  { from: "Omega", to: "Theta" },
];
/* edge structure */
// {
//     from: string;
//     to: string;
// }

/* GRAPH GENERATION FUNCTIONS */

// geometry and intersection stuff
function onSegment(px, py, qx, qy, rx, ry) {
  if (
    qx <= Math.max(px, rx) &&
    qx >= Math.min(px, rx) &&
    qy <= Math.max(py, ry) &&
    qy >= Math.min(py, ry)
  )
    return true;

  return false;
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function doOrientation(p, q, r) {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

  if (val == 0) return 0; // collinear

  return val > 0 ? 1 : 2; // clock or counterclock wise
}

function doIntersect(p1, q1, p2, q2) {
  // Find the four orientations needed for general cases (special cases are eliminated here)
  o1 = doOrientation(p1, q1, p2);
  o2 = doOrientation(p1, q1, q2);
  o3 = doOrientation(p2, q2, p1);
  o4 = doOrientation(p2, q2, q1);

  // General case
  if (
    (p1.x === p2.x && p1.y === p2.y) ||
    (q1.x === q2.x && q1.y === q2.y) ||
    (p1.x === q2.x && p1.y === q2.y) ||
    (q1.x === p2.x && q1.y === p2.y)
  )
    return false; // edges from same node will never intersect because of graph structure
  if (o1 != o2 && o3 != o4) return true;

  return false; // Doesn't fall in any of the above cases
}

// checks intersections with all edges that have nodes with assigned positions
function checkEdgeIntersects(p1, p2) {
  let intersects = false;
  for (const edge of edges) {
    const from = nodes.find((node) => node.label === edge.from);
    const to = nodes.find((node) => node.label === edge.to);
    if (
      from.x == undefined ||
      from.y == undefined ||
      to.x == undefined ||
      to.y == undefined
    )
      continue;
    let p3, p4;
    p3 = { x: from.x, y: from.y };
    p4 = { x: to.x, y: to.y };
    if (doIntersect(p1, p2, p3, p4)) {
      intersects = true;
      break;
    }
  }
  return intersects;
}

// assigns the position of one node in the generation step, given its connection to a node at a lower level
function assignNodePos(node, prevNode) {
  // prevNode has already been assigned x, y, level
  // point, will need to be interface in TS
  const prev = { x: prevNode.x, y: prevNode.y };
  const rel = prevNode.children.includes(node.label) ? 1 : -1; // TODO: correct for edge cases!
  const R = r * node.level;
  let pt = {};
  do {
    pt.y = prev.y + rel * r * Math.random();
    const randSign = Math.random() < 0.5 ? -1 : 1;
    pt.x = Math.sqrt(Math.pow(R, 2) - Math.pow(pt.y, 2)) * randSign;
  } while (checkEdgeIntersects(prev, pt)); //checkEdgeIntersects(prev, pt)
  [node.x, node.y] = [pt.x, pt.y];
  node.vx = 0;
  node.vy = 0;
}

// assigns the positions of related nodes recursively given a single node with position and level defined (depth-first)
function assignRelatedPos(node) {
  let connecteds = [];
  for (const connected of nodes) {
    if (
      (node.children.includes(connected.label) ||
        node.prereqs.includes(connected.label)) &&
      connected.level == undefined
    )
      connecteds.push(connected);
  }
  for (const connected of connecteds) {
    connected.level = node.level + 1;
    assignNodePos(connected, node);
    assignRelatedPos(connected);
  }
}

/* DRAWING FUNCTIONS */

// function to draw a Node at a position
function drawNode(node) {
  ctx.beginPath();
  ctx.fillStyle = nodeFill;
  ctx.arc(xOffset + node.x, yOffset + node.y, nodeRadius, 0, Math.PI * 2, true);
  ctx.strokeStyle = nodeStroke;
  ctx.stroke();
  ctx.fill();
}

// function to draw Edges between Nodes
function drawEdge(edge) {
  // include error catching
  const from = nodes.find((node) => node.label === edge.from);
  const to = nodes.find((node) => node.label === edge.to);

  ctx.beginPath();
  ctx.strokeStyle = edgeStroke;
  ctx.moveTo(xOffset + from.x, yOffset + from.y);
  ctx.lineTo(xOffset + to.x, yOffset + to.y);
  ctx.stroke();

  drawArrow(from, to);
}

function drawArrow(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  const baseX = from.x + dx * arrowOffset;
  const baseY = from.y + dy * arrowOffset;

  const theta = Math.atan2(-dx, dy); // angle from positive x to base of arrow

  const x1 = baseX + arrowWidth * 0.5 * Math.cos(theta);
  const y1 = baseY + arrowWidth * 0.5 * Math.sin(theta);

  const x2 = baseX - arrowWidth * 0.866 * Math.sin(theta);
  const y2 = baseY + arrowWidth * 0.866 * Math.cos(theta);

  const x3 = baseX - arrowWidth * 0.5 * Math.cos(theta);
  const y3 = baseY - arrowWidth * 0.5 * Math.sin(theta);

  ctx.beginPath();
  ctx.fillStyle = edgeFill;
  ctx.strokeStyle = edgeStroke;
  ctx.moveTo(xOffset + x1, yOffset + y1);
  ctx.lineTo(xOffset + x2, yOffset + y2);
  ctx.lineTo(xOffset + x3, yOffset + y3);
  ctx.closePath();
  ctx.fill();
}

function drawLabel(node) {
  const textX = node.x + nodeRadius + labelOffset;
  const textY = node.y - nodeRadius - labelOffset;
  const clearW = ctx.measureText(node.label).width;
  const clearH = textHeight;

  ctx.clearRect(
    xOffset + textX - textBorder,
    yOffset + textY + textBorder,
    clearW + textBorder,
    -clearH - textBorder
  );

  ctx.beginPath();
  ctx.fillStyle = textFill;
  ctx.fillText(node.label, xOffset + textX, yOffset + textY);
}

// PHYSICS LOOP (RUN TO EQUILIBRIUM)
function update() {
  for (node of nodes) {
    if (node === rootNode) continue;
    const R = node.level * r;
    const tanVect = { x: -node.y / R, y: node.x / R };
    let fSum = { x: 0, y: 0 };
    for (otherNode of nodes) {
      if (node === otherNode) continue;
      const dx = node.x - otherNode.x;
      const dy = node.y - otherNode.y;
      const d3 = Math.pow(dx * dx + dy * dy, 1.5);
      let fAttr;
      if (
        node.children.includes(otherNode.label) ||
        node.prereqs.includes(otherNode.label)
      ) {
        fAttr = { x: -kAttr * dx, y: -kAttr * dy };
      } else {
        fAttr = { x: 0, y: 0 };
      }
      const fRep = { x: (kRep * dx) / d3, y: (kRep * dy) / d3 };
      fSum.x += fAttr.x + fRep.x;
      fSum.y += fAttr.y + fRep.y;
    }
    fSum.y += kVert * Math.sign(node.y);
    const dotProd = tanVect.x * fSum.x + tanVect.y * fSum.y;
    const proj = { x: tanVect.x * dotProd, y: tanVect.y * dotProd };
    node.vx += proj.x * dt;
    node.vy += proj.y * dt;

    node.vx *= damping;
    node.vy *= damping;

    const prev = { x: node.x, y: node.y };
    node.x += node.vx * dt;
    node.y += node.vy * dt;

    // Keep nodes in their respective hemispheres
    if (prev.y > 0 && node.y < 0) {
      node.y = Math.abs(node.y); // Upper hemisphere constraint
    } else if (prev.y < 0 && node.y > 0) {
      node.y = -Math.abs(node.y); // Lower hemisphere constraint
    }

    if (node.initialX > 0 && node.x < 0) {
      node.x = Math.abs(node.x); // Right hemisphere constraint
    } else if (node.initialX < 0 && node.x > 0) {
      node.x = -Math.abs(node.x); // Left hemisphere constraint
    }

    // normalizing to radius
    const D = Math.sqrt(node.x * node.x + node.y * node.y);
    const ratio = R / D;
    node.x *= ratio;
    node.y *= ratio;

    const newTanVect = { x: -node.y / R, y: node.x / R };

    // projecting velocity onto new tangent
    const vDotProd = newTanVect.x * node.vx + newTanVect.y * node.vy;
    node.vx = newTanVect.x * vDotProd;
    node.vy = newTanVect.y * vDotProd;
  }
}

// check if physics has run to equilibrium
function checkSteady() {
  for (node of nodes) {
    if (node === rootNode) continue;
    console.log(node.vx + ", " + node.vy);
    if (node.vx * node.vx + node.vy * node.vy > threshold) return false;
  }
  return true;
}

// RENDER ALL FUNCTION

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const edge of edges) {
    drawEdge(edge);
  }
  for (const node of nodes) {
    drawNode(node);
    drawLabel(node);
  }
}

// assigning initial positions
rootNode.x = 0;
rootNode.y = 0;
rootNode.vx = 0;
rootNode.vy = 0;
rootNode.level = 0; // 0th level, 0 radius - only the root node
assignRelatedPos(rootNode);

// doing physics loop
let i = 0;
do {
  update();
  console.log("physics");
  i++;
} while (!checkSteady() && i < 1000);

// render
draw();
