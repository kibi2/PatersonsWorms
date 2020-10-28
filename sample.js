var SVGDoc = null;
var lineRoot = null;
var sq3 = Math.sqrt(3);
var scale = 32;
var svgns = 'http://www.w3.org/2000/svg';
var steps = 0;
var incColor = 0;

// the field contains information on what was eaten where, heavily relying on associative arrays
var field = new Object;

// currently allowing one worm, has x and y positiom and direction
var worm = [0, 0, 0];
var offsetX = window.innerWidth / 2;
var offsetY = window.innerHeight / 2;
var typeA = null;
var xmin = offsetX;
var ymin = offsetY;
var xmax = offsetX;
var ymax = offsetY;

// types follow naming as described on http://wso.williams.edu/~bchaffin/patersons_worms/allworms.htm

// setup translation of direction to coordinates
var dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];

function startup(evt) {
  SVGDoc = evt.target.ownerDocument;
  lineRoot = SVGDoc.getElementById("Lines");
  submitWorm();
}

function submitWorm(evt) {
  typeWorm = document.getElementById('myWorm').value;
  steps = 0;
  scale = 32;
  typeString = typeWorm.split('--')[1];
  // setup type array
  typeA = { "0": parseInt(typeString[0]) };
  typeString = typeString.substring(1, typeString.length);

  // clear field
  field = { "0": { "0": [false, false, false, false, false, false] } };
  worm = [0, 0, 0];

  // clear lines
  var element = document.getElementById("Lines");
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  setTimeout("tick()", 2000);
  return false;
}

function tick(evt) {
  // console.log(JSON.stringify(field));
  // console.log(JSON.stringify(worm));
  var x = worm[0];
  var y = worm[1];
  var v = worm[2];

  // based on direction find the next field
  var xn = x + dirs[v][0];
  var yn = y + dirs[v][1];

  // check if next field exist if not create
  if (field[xn] === undefined) {
    field[xn] = ({});
  }
  if (field[xn][yn] === undefined) {
    field[xn][yn] = [false, false, false, false, false, false];
  }

  steps += 1;

  // draw the line and update field
  draw(x, y, xn, yn);
  field[xn][yn][v] = true;
  field[x][y][(v + 3) % 6] = true;

  // update worm based on type,
  worm[0] = xn;
  worm[1] = yn;
  odir = worm[2];
  var typ = 0;
  var cnt = 0;

  for (var i = 1; i < 6; i++) {
    typ *= 2;
    if (field[xn][yn][(i + odir) % 6] == true) {
      typ += 1;
      cnt += 1;
    }
  };

  if (cnt < 4) {
    if (typeA[typ] === undefined) {
      typeA[typ] = parseInt(typeString[0]);
      typeString = typeString.substring(1, typeString.length);
    }
    worm[2] = (odir + typeA[typ]) % 6;
  } else {
    for (var i = 0; i < 6; i++) {
      if (field[xn][yn][i] == false) {
        worm[2] = (i + 3) % 6;
      }
    };

  }

  if (typ != 31) t = setTimeout("tick()", 0);
}

function draw(x1, y1, x2, y2) {
  NewLine = SVGDoc.createElementNS(svgns, "line");
  NewLine.setAttribute("x1", offsetX + scale * (x1 + y1 / 2));
  NewLine.setAttribute("y1", offsetY - sq3 * scale * y1 / 2);
  NewLine.setAttribute("x2", offsetX + scale * (x2 + y2 / 2));
  if (offsetX + scale * (x2 + y2 / 2) > xmax) xmax = offsetX + scale * (x2 + y2 / 2);
  if (offsetX + scale * (x2 + y2 / 2) < xmin) xmin = offsetX + scale * (x2 + y2 / 2);
  NewLine.setAttribute("y2", offsetY - sq3 * scale * y2 / 2);
  if (offsetY - sq3 * scale * y2 / 2 > ymax) ymax = offsetY - sq3 * scale * y2 / 2;
  if (offsetY - sq3 * scale * y2 / 2 < ymin) ymin = offsetY - sq3 * scale * y2 / 2;
  NewLine.setAttribute("rx1", (x1 + y1 / 2));
  NewLine.setAttribute("ry1", -sq3 * y1 / 2);
  NewLine.setAttribute("rx2", (x2 + y2 / 2));
  NewLine.setAttribute("ry2", -sq3 * y2 / 2);
  NewLine.setAttribute("stroke-width", scale / 6);
  NewLine.setAttribute("num", steps);
  NewLine.setAttribute("stroke", "rgb(255,255,0)");
  lineRoot.appendChild(NewLine);
  incColor += 1;
  if (incColor > steps / 256) {
    var t = lineRoot.childNodes;
    incColor = 0;
    for (i = 0; i < t.length; i++) {
      t[i].setAttribute("stroke", "rgb(255," + parseInt(255 * t[i].getAttribute("num") / steps) + ",0)");
    }
  }
  if (xmax > (2 * offsetX) - 10 || ymax > (2 * offsetY) - 10 || xmin < 10 || ymin < 10) {
    // Lets resize
    xmin = offsetX;
    ymin = offsetY;
    xmax = offsetX;
    ymax = offsetY;
    scale = scale * 0.95;
    var t = lineRoot.childNodes;
    for (i = 0; i < t.length; i++) {
      t[i].setAttribute("x1", offsetX + scale * t[i].getAttribute("rx1"));
      t[i].setAttribute("y1", offsetY + scale * t[i].getAttribute("ry1"));
      t[i].setAttribute("x2", offsetX + scale * t[i].getAttribute("rx2"));
      if (offsetX + scale * t[i].rx2 > xmax) xmax = offsetX + scale * t[i].getAttribute("rx2");
      if (offsetX + scale * t[i].rx2 < xmin) xmin = offsetX + scale * t[i].getAttribute("rx2");
      t[i].setAttribute("y2", offsetY + scale * t[i].getAttribute("ry2"));
      if (offsetX + scale * t[i].ry2 > xmax) xmax = offsetX + scale * t[i].getAttribute("ry2");
      if (offsetX + scale * t[i].ry2 < xmin) xmin = offsetX + scale * t[i].getAttribute("ry2");
      t[i].setAttribute("stroke-width", scale / 6);
    }
  }
}
