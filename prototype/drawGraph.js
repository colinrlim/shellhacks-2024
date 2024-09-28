const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const nodeFill = 'black';
const nodeStroke = 'black';
const radius = 10;

const edgeFill = 'black';
const edgeStroke = 'black';
const arrowOffset = 0.4;
const arrowWidth = 10;

const textFill = 'black';
const textBorder = 5;

const labelOffset = radius*0.5;
const textHeight = 20; // pixels
ctx.font = textHeight.toString() + 'px Arial';

let nodes = [{label: "Applesauce", x: 500, y: 500},{label: "B", x: 700, y: 200}];
/* node structure - distinct from topics, just for rendering */
// {
//     label: string;
//     x: number;
//     y: number;
// }
let edges = [{ from: nodes[0], to: nodes[1] }];
/* edge structure */
// {
//     from: Node;
//     to: Node;
// }

// function to draw a Node at a position
function drawNode(node) {
    ctx.beginPath();
    ctx.fillStyle = nodeFill;
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2, true);
    ctx.strokeStyle = nodeStroke;
    ctx.stroke();
    ctx.fill();
}

// function to draw Edges between Nodes
function drawEdge(edge) {
    ctx.beginPath();
    ctx.strokeStyle = edgeStroke;
    ctx.moveTo(edge.from.x, edge.from.y);
    ctx.lineTo(edge.to.x, edge.to.y);
    ctx.stroke();

    drawArrow(edge);
}

function drawArrow(edge) {
    const dx = edge.to.x-edge.from.x;
    const dy = edge.to.y-edge.from.y;

    const baseX = edge.from.x + dx*arrowOffset;
    const baseY = edge.from.y + dy*arrowOffset;

    const theta = Math.atan2(-dx,dy); // angle from positive x to base of arrow

    const x1 = baseX + arrowWidth*0.5*Math.cos(theta);
    const y1 = baseY + arrowWidth*0.5*Math.sin(theta);

    const x2 = baseX - arrowWidth*0.866*Math.sin(theta);
    const y2 = baseY + arrowWidth*0.866*Math.cos(theta);

    const x3 = baseX - arrowWidth*0.5*Math.cos(theta);
    const y3 = baseY - arrowWidth*0.5*Math.sin(theta);

    ctx.beginPath();
    ctx.fillStyle = edgeFill;
    ctx.strokeStyle = edgeStroke;
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.lineTo(x3,y3);
    ctx.closePath();
    ctx.fill();
    
}

function drawLabel(node) {
    const textX = node.x + radius + labelOffset;
    const textY = node.y - radius - labelOffset;
    const clearW = ctx.measureText(node.label).width;
    const clearH = textHeight;

    ctx.clearRect(textX - textBorder, textY + textBorder, clearW + textBorder, -clearH - textBorder);

    ctx.beginPath();
    ctx.fillStyle = textFill;
    ctx.fillText(node.label, textX, textY);
}

for (const edge of edges) { drawEdge(edge); }
for (const node of nodes) { drawNode(node); drawLabel(node); }