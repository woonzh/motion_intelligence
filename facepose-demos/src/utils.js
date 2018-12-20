import * as posenet from "@tensorflow-models/posenet";

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isMobile() {
  return isAndroid() || isiOS();
}

const coloursToDrawOnKeyPoints = [
  "tomato",
  "#004080",
  "#99ffbb",
  "white",
  "white",
  "#800000",
  "#dfbf9f",
  "#604020",
  "#d9d9d9",
  "#333333",
  "tomato",
  "#f5ccff",
  "#520066",
  "#ffff99",
  "#b3b300",
  "#00ffff",
  "#000000"
];
//blue green red brown (grey, charcoal, white) purple yellow (aqua black)

const distBetweenPoints = (x1, x2, y1, y2) => {
  return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
};

export const drawFace = (keypoints, ctx, imgNames, ratio = 1.5) => {
  let leftEye = keypoints[1]["position"];
  let rightEye = keypoints[2]["position"];
  let eyeMidPtX = (leftEye.x + rightEye.x) / 2;
  let eyeMidPtY = (leftEye.y + rightEye.y) / 2;

  let dist = distBetweenPoints(leftEye.x, rightEye.x, leftEye.y, rightEye.y);

  let faceCoords = {
    topLeft: {
      x: eyeMidPtX - dist * 1.4,
      y: eyeMidPtY - dist * 1.5
    },
    boxParams: {
      width: dist * 2.8,
      height: dist * 3.4
    }
  };

  ctx.strokeRect(
    faceCoords.topLeft.x,
    faceCoords.topLeft.y,
    faceCoords.boxParams.width,
    faceCoords.boxParams.height
  );

  let radius = dist * ratio;
  // ctx.beginPath();
  // ctx.arc(eyeMidPtX, eyeMidPtY, radius, 0, 2 * Math.PI);
  // ctx.stroke();

  let name=getNearestName(imgNames, faceCoords.topLeft.x, faceCoords.topLeft.y)

  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "tomato";
  ctx.fillText(name, eyeMidPtX, eyeMidPtY - (radius + 10));
  return faceCoords;
};

export function drawKeypoints(
  keypoints,
  minConfidence,
  skeletonColor,
  ctx,
  scale = 1
) {
  keypoints.forEach((keypoint, index) => {
    if (keypoint.score >= minConfidence) {
      const { y, x } = keypoint.position;
      ctx.beginPath();
      ctx.arc(x * scale, y * scale, 3, 0, 2 * Math.PI);
      // ctx.fillStyle = skeletonColor
      ctx.fillStyle = coloursToDrawOnKeyPoints[index % 17];
      ctx.fill();
    }
  });
}

function toTuple({ y, x }) {
  return [y, x];
}

function drawSegment([ay, ax], [by, bx], color, lineWidth, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

export function drawSkeleton(
  keypoints,
  minConfidence,
  color,
  lineWidth,
  ctx,
  scale = 1
) {
  const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
    keypoints,
    minConfidence
  );

  adjacentKeyPoints.forEach(keypoints => {
    drawSegment(
      toTuple(keypoints[0].position),
      toTuple(keypoints[1].position),
      color,
      lineWidth,
      scale,
      ctx
    );
  });
}

function distCalculator(x1,y1,x2,y2){
  return ((x2-x1)**2 + (y2-y1)**2)**0.5
}

export function getNearestName(imgNames, x, y){
  let curDist=1000;
  let name='unknown'
  for (let i=0; i<imgNames.length; i++){
    let itm=imgNames[i]
    let dist = distCalculator(itm[1][0], itm[1][1], x, y)
    if (dist<curDist){
      curDist = dist
      name = itm[0]
    }
  }

  return name
}

// export function assignNames(imgNames, poses){
//   for (let i=0; i < imgNames.length; i++){
//     let itm = imgNames[i]

//     for (let j = 0; j < poses.length; j++){
//       pose = poses[j].keypoints[1]["position"]


//     }
//   }
// }