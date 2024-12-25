/*
This file contains utility functions
*/
import { globalState } from "./main-section-script.js";
import databaseService from "./databaseService.js";
import undoRedoService from "./undoRedo.js";

const log = console.log;

function getDynamicStrokeWidth(
  minScale = 0.15,
  minStrokeWidth = 2,
  maxStrokeWidth = 25,
  maxScale = 4,
  zoomSteps = 36
) {
  const currentScale = globalState.stage.scaleX();

  // Normalize scale between 1 and maxScale * (1 / minScale)
  const normalizedScale = currentScale * (1 / minScale); // This turns the scale range into 1 to 26.666...

  // Calculate stroke width by dividing maxStrokeWidth by normalizedScale
  let dynamicStrokeWidth = maxStrokeWidth / normalizedScale;

  // Ensure stroke width doesn't go below the minStrokeWidth
  if (dynamicStrokeWidth < minStrokeWidth) {
    dynamicStrokeWidth = minStrokeWidth;
  }

  return dynamicStrokeWidth;
}

function calculateCloudPoints(
  baseWidth,
  baseHeight,
  scallopWidth,
  scallopHeight
) {
  let curvePoints = [];
  let currentX = 0;
  let currentY = 0;

  // We only use positive width and height in this calculation
  const numScallopsWidth = Math.floor(baseWidth / scallopWidth);
  const numScallopsHeight = Math.floor(baseHeight / scallopHeight);

  // Generate top scallops (positive or negative width doesn't matter here, we're only drawing the points)
  for (let i = 0; i < numScallopsWidth; i++) {
    const cp1X = currentX + scallopWidth * 0.25;
    const cp1Y = currentY - scallopHeight * 0.5;

    const cp2X = cp1X + scallopWidth * 0.5;
    const cp2Y = cp1Y;

    const endX = cp2X + scallopWidth * 0.25;
    const endY = cp2Y + scallopHeight * 0.5;

    curvePoints.push(cp1X, cp1Y, cp2X, cp2Y, endX, endY);

    currentX = endX;
    currentY = endY;
  }

  // Generate right scallops
  for (let i = 0; i < numScallopsHeight; i++) {
    const cp1X = currentX + scallopWidth * 0.5;
    const cp1Y = currentY + scallopHeight * 0.25;

    const cp2X = cp1X;
    const cp2Y = cp1Y + scallopHeight * 0.5;

    const endX = cp2X - scallopHeight * 0.5;
    const endY = cp2Y + scallopHeight * 0.25;

    curvePoints.push(cp1X, cp1Y, cp2X, cp2Y, endX, endY);

    currentX = endX;
    currentY = endY;
  }

  // Generate bottom scallops
  for (let i = 0; i < numScallopsWidth; i++) {
    const cp1X = currentX - scallopWidth * 0.25;
    const cp1Y = currentY + scallopHeight * 0.5;

    const cp2X = cp1X - scallopWidth * 0.5;
    const cp2Y = cp1Y;

    const endX = cp2X - scallopWidth * 0.25;
    const endY = cp2Y - scallopHeight * 0.5;

    curvePoints.push(cp1X, cp1Y, cp2X, cp2Y, endX, endY);

    currentX = endX;
    currentY = endY;
  }

  // Generate left scallops
  for (let i = 0; i < numScallopsHeight; i++) {
    const cp1X = currentX - scallopWidth * 0.5;
    const cp1Y = currentY - scallopHeight * 0.25;

    const cp2X = cp1X;
    const cp2Y = cp1Y - scallopHeight * 0.5;

    const endX = cp2X + scallopHeight * 0.5;
    const endY = cp2Y - scallopHeight * 0.25;

    curvePoints.push(cp1X, cp1Y, cp2X, cp2Y, endX, endY);

    currentX = endX;
    currentY = endY;
  }

  return curvePoints;
}

function getRelativePointerPosition(node) {
  // Get the absolute transform (position, scale, rotation) of the node
  const transform = node.getAbsoluteTransform().copy();

  // Invert the transform matrix to convert from the globalState.stage coordinate system
  // to the coordinate system of the node. This means we can find where
  // the pointer is relative to the node's position, even if the node is transformed.
  transform.invert();

  // Get the current position of the pointer (mouse or touch) relative to the globalState.stage.
  const pos = node.getStage().getPointerPosition();

  // Apply the inverted transform to the pointer position, converting it
  // to the coordinate system of the node. This gives us the pointer position
  // relative to the node itself, taking into account any transformations.
  return transform.point(pos);
}

function calculateLength(points) {
  let totalLength = 0;

  // Loop through the points in pairs (0,1), (2,3), ..., (n-2, n-1)
  for (let i = 0; i < points.length - 2; i += 2) {
    const dx = points[i + 2] - points[i];
    const dy = points[i + 3] - points[i + 1];
    const segmentLength = Math.sqrt(dx * dx + dy * dy); // Length of the segment in pixels
    totalLength += segmentLength; // Accumulate the length of each segment
  }

  // Convert total pixel length to inches
  const inchesPerPixel = 1 / globalState.dpi;
  const lengthInInches =
    (totalLength / globalState.imageScale) * inchesPerPixel;

  // Convert inches to feet
  const feetPerInch = globalState.drawingScale;
  const totalFeet = lengthInInches * feetPerInch;

  // Extract whole feet and remaining inches
  let feet = Math.floor(totalFeet); // Get the whole feet part
  let inches = Math.round((totalFeet - feet) * 12); // Get the remaining inches part

  // Handle the case where inches equal 12, which should roll over to the next foot
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }

  // Return the length in the format X'-Y"
  if (inches === 0) {
    return `${feet}'`; // Only feet, no inches
  }
  return `${feet}'-${inches}"`; // Feet and inches
}

function calculatePolygonArea(points) {
  let total = 0;

  // Apply Shoelace formula to calculate the polygonArea in pixel units
  for (let i = 0; i < points.length - 2; i += 2) {
    const x1 = points[i];
    const y1 = points[i + 1];
    const x2 = points[i + 2];
    const y2 = points[i + 3];
    total += x1 * y2 - x2 * y1;
  }

  total +=
    points[points.length - 2] * points[1] -
    points[0] * points[points.length - 1];

  // Area in pixels
  const areaInPixels = Math.abs(total / 2);

  // Convert pixel polygonArea to inches (since each side is in pixels)
  const inchesPerPixel = 1 / globalState.dpi;
  const areaInInches =
    (areaInPixels / Math.pow(globalState.imageScale, 2)) *
    Math.pow(inchesPerPixel, 2);

  // Convert inches to square feet
  const squareFeetPerInch = Math.pow(globalState.drawingScale, 2);
  const areaInSquareFeet = areaInInches * squareFeetPerInch;

  return areaInSquareFeet.toFixed(2) + " SF"; // This ties to checkZeroShape function
}

function calculateRectangleArea(shape) {
  const width = shape.width() * shape.scaleX(); // Get the scaled width
  const height = shape.height() * shape.scaleY(); // Get the scaled height

  // Calculate the area in pixels
  const areaInPixels = width * height;

  // Convert to square feet (or other units) using scale factors
  const inchesPerPixel = 1 / globalState.dpi;
  const areaInInches =
    (areaInPixels / Math.pow(globalState.imageScale, 2)) *
    Math.pow(inchesPerPixel, 2);
  const squareFeetPerInch = Math.pow(globalState.drawingScale, 2);
  const areaInSquareFeet = areaInInches * squareFeetPerInch;

  return areaInSquareFeet.toFixed(2) + " SF"; // This ties to checkZeroShape function
}

function calculateRectangleLineArea(points) {
  // Ensure that there are 4 points (8 values in total, x1, y1, x2, y2, x3, y3, x4, y4)
  if (points.length !== 8) {
    throw new Error("The points array must contain 8 values for a rectangle.");
  }

  // Extract the points
  const x1 = points[0],
    y1 = points[1]; // top-left
  const x2 = points[2],
    y2 = points[3]; // top-right
  const x3 = points[4],
    y3 = points[5]; // bottom-right
  const x4 = points[6],
    y4 = points[7]; // bottom-left

  // Calculate width (distance between top-left and top-right)
  const widthInPixels = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

  // Calculate height (distance between top-left and bottom-left)
  const heightInPixels = Math.sqrt(Math.pow(x4 - x1, 2) + Math.pow(y4 - y1, 2));

  // Area in pixels
  const areaInPixels = widthInPixels * heightInPixels;

  // Convert pixel area to inches (since each side is in pixels)
  const inchesPerPixel = 1 / globalState.dpi;
  const areaInInches =
    (areaInPixels / Math.pow(globalState.imageScale, 2)) *
    Math.pow(inchesPerPixel, 2);

  // Convert inches to square feet
  const squareFeetPerInch = Math.pow(globalState.drawingScale, 2);
  const areaInSquareFeet = areaInInches * squareFeetPerInch;

  return areaInSquareFeet.toFixed(2) + " SF"; // Return as square feet (SF)
}

function checkZeroShape(shape) {
  // Check for zero-length lines (linear and dimension lines)
  if (shape.name() === "linearLine" || shape.name() === "dimensionLine") {
    const length = calculateLength(shape.points()); // Use existing method to calculate length
    return length !== "0'"; // Return false if length is 0

    // Check for zero-area shapes (polygonArea, rectArea, highlight)
  } else if (shape.name() === "polygonArea") {
    const area = calculatePolygonArea(shape.points());
    return area !== "0.00 SF";
  } else if (shape.name() === "rectArea" || shape.name() === "highlight") {
    const area = calculateRectangleArea(shape);
    return area !== "0.00 SF";
  } else if (shape.name() === "cloud" || shape.name() === "callout") {
    if (shape.width() === 0 || shape.height() === 0) {
      return false;
    }
  }

  return true; // If shape doesn't match any criteria, return true
}

function getImageBorders(image) {
  const imageX = image.x();
  const imageY = image.y();
  const imageWidth = image.width() * image.scaleX();
  const imageHeight = image.height() * image.scaleY();

  // Set the image boundaries
  const imageBounds = {
    top: imageY,
    left: imageX,
    right: imageX + imageWidth,
    bottom: imageY + imageHeight,
  };
  return imageBounds;
}

function updateTextAreaPosition() {
  if (!globalState.isEditing) return;
  if (!globalState.shapeInEdit) return;

  const textarea = document.getElementById("dynamic-textarea");
  if (!textarea) return; // No textarea to update

  const currentScale = globalState.stage.scaleX();
  // Get the current absolute position of the text node
  const textPosition = globalState.shapeInEdit.absolutePosition();
  const stageBox = globalState.stage.container().getBoundingClientRect();
  const textScaleX = globalState.shapeInEdit.scaleX();
  const textScaleY = globalState.shapeInEdit.scaleY();
  // Recalculate the textarea's position based on the new scale
  const areaPosition = {
    x: stageBox.left + textPosition.x,
    y: stageBox.top + textPosition.y,
  };

  // Update the position and size of the textarea to match the new zoom level
  textarea.style.top = areaPosition.y + "px";
  textarea.style.left = areaPosition.x + "px";
  textarea.style.width =
    (globalState.shapeInEdit.width() + globalState.shapeInEdit.strokeWidth()) *
      currentScale *
      textScaleX +
    "px";
  textarea.style.height =
    (globalState.shapeInEdit.height() + globalState.shapeInEdit.strokeWidth()) *
      currentScale *
      textScaleY +
    "px";
  textarea.style.fontSize =
    globalState.shapeInEdit.fontSize() * currentScale * textScaleY + "px";
  textarea.style.padding = 10 * currentScale + "px";
  textarea.style.boxSizing = "border-box";
  // Apply the same transformation as before
  const rotation = globalState.shapeInEdit.rotation();
  let transform = "";
  if (rotation) {
    transform += `rotateZ(${rotation}deg)`;
  }

  let px = 0;
  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  if (isFirefox) {
    px += 2 + Math.round(globalState.shapeInEdit.fontSize() / 20);
  }
  transform += `translateY(-${px}px)`;

  textarea.style.transform = transform;

  globalState.drawLayer.draw();
}

function generatePointsForCallout(width, height) {
  // Base width and height are positive for consistent orientation
  const baseWidth = width;
  const baseHeight = height;

  const result = [
    { x: 0, y: 0 }, // top-left corner
    { x: baseWidth, y: 0 }, // top-right corner
    { x: baseWidth, y: baseHeight * 0.7 }, // right-bottom vertical line (scaled to 70% of height)
    { x: baseWidth * 0.6, y: baseHeight * 0.7 }, // diagonal inward (60% of the width)
    { x: 0, y: baseHeight }, // bottom-left corner
    { x: baseWidth * 0.4, y: baseHeight * 0.7 }, // diagonal inward (40% of the width)
    { x: 0, y: baseHeight * 0.7 }, // left vertical back to the bottom-left corner
  ];

  return result;
}

function createTextareaOverShape(action = "create") {
  const associatedCallout =
    globalState.shapeInEdit.getAttr("associatedCallout");
  let oldCalloutFill = null;
  if (associatedCallout) {
    oldCalloutFill = associatedCallout.fill();
    associatedCallout.fill("rgba(255, 253, 208,0.75)");
  }
  // hide text node:
  globalState.shapeInEdit.hide();

  // create textarea over canvas with absolute position
  const textPosition = globalState.shapeInEdit.absolutePosition();
  const stageBox = globalState.stage.container().getBoundingClientRect();
  const currentScale = globalState.stage.scaleX();
  const textScaleX = globalState.shapeInEdit.scaleX();
  const textScaleY = globalState.shapeInEdit.scaleY();

  const areaPosition = {
    x: stageBox.left + textPosition.x,
    y: stageBox.top + textPosition.y,
  };

  const textarea = document.createElement("textarea");
  textarea.id = "dynamic-textarea";
  document.body.appendChild(textarea);
  textarea.value = globalState.shapeInEdit.text();
  textarea.style.position = "absolute";
  textarea.style.top = areaPosition.y + "px";
  textarea.style.left = areaPosition.x + "px";
  textarea.style.width =
    (globalState.shapeInEdit.width() + globalState.shapeInEdit.strokeWidth()) *
      currentScale *
      textScaleX +
    "px";
  textarea.style.height =
    (globalState.shapeInEdit.height() + globalState.shapeInEdit.strokeWidth()) *
      currentScale *
      textScaleY +
    "px";
  textarea.style.fontSize =
    globalState.shapeInEdit.fontSize() * currentScale * textScaleY + "px";
  textarea.style.border = "none";
  textarea.style.padding =
    globalState.shapeInEdit.padding() * currentScale + "px";
  textarea.style.boxSizing = "border-box";
  textarea.style.margin = "0px";
  textarea.style.overflowY = "auto";
  textarea.style.background = "transparent";
  textarea.style.outline = "none";
  textarea.style.resize = "none";
  textarea.style.lineHeight = globalState.shapeInEdit.lineHeight();
  textarea.style.fontFamily = globalState.shapeInEdit.fontFamily();
  textarea.style.transformOrigin = "left top";
  textarea.style.textAlign = globalState.shapeInEdit.align();
  textarea.style.color = globalState.shapeInEdit.fill();

  const rotation = globalState.shapeInEdit.rotation();
  let transform = "";
  if (rotation) {
    transform += `rotateZ(${rotation}deg)`;
  }

  let px = 0;
  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  if (isFirefox) {
    px += 2 + Math.round(globalState.shapeInEdit.fontSize() / 20);
  }
  transform += `translateY(-${px}px)`;

  textarea.style.transform = transform;

  textarea.focus();
  // Function to remove textarea and update text node
  function removeTextarea() {
    textarea.parentNode.removeChild(textarea);
    window.removeEventListener("mousedown", handleOutsideClick);
    globalState.shapeInEdit.show();
    if (associatedCallout) associatedCallout.fill(oldCalloutFill);
    // Update state and database
    if (action === "create") {
      const pushedNode = databaseService.pushShapeById(globalState.shapeInEdit); // push to database
      globalState.shapeInEdit.id(pushedNode.id); // set id from Database
      undoRedoService.addCreateShapeActionToState(globalState.shapeInEdit);
    } else if (action === "update") {
      databaseService.updateShapeById(globalState.shapeInEdit);
      undoRedoService.addUpdateShapeActionToState(globalState.shapeInEdit);
    }

    globalState.drawLayer.draw();
  }

  // Function to handle outside clicks
  function handleOutsideClick(e) {
    if (e.target !== textarea) {
      globalState.shapeInEdit.text(textarea.value);
      removeTextarea();
    }
  }

  // Handle keydown events
  textarea.addEventListener("keydown", function (e) {
    if (e.keyCode === 13 && !e.shiftKey) {
      globalState.shapeInEdit.text(textarea.value);
      removeTextarea();
    }
    if (e.keyCode === 27) {
      removeTextarea();
    }
  });

  setTimeout(() => {
    window.addEventListener("mousedown", handleOutsideClick);
  });
}

function isWithinBounds(x, y) {
  return (
    x >= globalState.imageBounds.left &&
    x <= globalState.imageBounds.right &&
    y >= globalState.imageBounds.top &&
    y <= globalState.imageBounds.bottom
  );
}

function syncLinearTextPosition(shape) {
  // Calculate the new length or polygonArea based on the shape's points
  let newLength = null;
  if (shape.name() === "polygonArea") {
    newLength = calculatePolygonArea(shape.points());
  } else if (
    shape.name() === "dimensionLine" ||
    shape.name() === "linearLine"
  ) {
    newLength = calculateLength(shape.points());
  }

  // Retrieve the associated text directly from the shape
  const textShape = shape.getAttr("associatedText");

  // Update text position and content if a text label exists
  if (textShape) {
    const points = shape.points();
    const midX = (points[0] + points[2]) / 2;
    const midY = (points[1] + points[3]) / 2;
    textShape.position({ x: midX + shape.x(), y: midY + shape.y() + 10 });
    textShape.text(newLength);
  }
}

function syncRectTextPosition(shape) {
  const points = shape.points();
  const textShape = shape.getAttr("associatedText");

  if (textShape) {
    // Calculate the center of the rectangle
    const midX = (points[0] + points[2]) / 2; // Halfway between top-left (x1) and top-right (x2)
    const midY = (points[1] + points[7]) / 2; // Halfway between top-left (y1) and bottom-left (y4)

    // Update text offset to be centered
    const textWidth = textShape.width();
    const textHeight = textShape.height();
    textShape.offset({
      x: textWidth / 2,
      y: textHeight / 2,
    });

    // Set the text position to the calculated center
    textShape.position({
      x: midX + shape.x(),
      y: midY + shape.y(),
    });

    // Update the text content with the area
    const area = calculateRectangleLineArea(points);
    textShape.text(area);
  }
}

function resizeAndPositionAnchors(shape) {
  // Scale anchors based on the globalState.stage scale when a shape is selected
  const scaleFactor = getDynamicStrokeWidth(undefined, 2.5, 60);
  const strokeWidth = getDynamicStrokeWidth(undefined, 0.3, 5);
  const anchors = shape.getAttr("anchors");

  if (anchors) {
    const linePoints = shape.points();
    const shapeX = shape.x();
    const shapeY = shape.y();

    anchors.forEach((anchor, index) => {
      // Adjust anchor size
      anchor.width(scaleFactor);
      anchor.height(scaleFactor);
      anchor.strokeWidth(strokeWidth);

      // Place the anchor at the corresponding point, adjusted for the shape's position
      const pointX = linePoints[index * 2]; // X coordinate of the point
      const pointY = linePoints[index * 2 + 1]; // Y coordinate of the point

      // Set anchor position based on the point, shape's position, and center it
      const anchorX = pointX + shapeX - scaleFactor / 2;
      const anchorY = pointY + shapeY - scaleFactor / 2;

      // Update the anchor's position
      anchor.position({ x: anchorX, y: anchorY });
    });
  }
}

function resizeAndPositionRectAnchors(rect) {
  // Scale anchors based on the globalState.stage scale when a shape is selected
  const scaleFactor = getDynamicStrokeWidth(undefined, 2.5, 60);
  const strokeWidth = getDynamicStrokeWidth(undefined, 0.3, 5);
  const anchors = rect.getAttr("anchors");

  if (anchors) {
    const corners = getRectCorners(rect);

    anchors.forEach((anchor, index) => {
      // Adjust anchor size
      anchor.width(scaleFactor);
      anchor.height(scaleFactor);
      anchor.strokeWidth(strokeWidth);

      const pointX = corners[index * 2];
      const pointY = corners[index * 2 + 1];

      const anchorX = pointX - scaleFactor / 2;
      const anchorY = pointY - scaleFactor / 2;

      // Update the anchor's position
      anchor.position({ x: anchorX, y: anchorY });
    });
  }
}

function zoomHome() {
  // Update the globalState.stage dimensions to match the new window size
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  // Adjust the globalState.stage size
  globalState.stage.width(newWidth);
  globalState.stage.height(newHeight);

  // Get the image on the globalState.stage (assuming it's named "drawingImage")
  const image = globalState.stage.findOne("#drawingImage");
  if (image) {
    // Apply the same centering and scaling logic
    const scaleX = globalState.stage.width() / image.width();
    const scaleY = globalState.stage.height() / image.height();
    const scale = Math.min(scaleX, scaleY); // Choose the smaller scale factor

    // Apply the scale to the globalState.stage content
    globalState.stage.scale({ x: scale, y: scale });

    // Position the globalState.stage content (image) at the center
    const offsetX = (globalState.stage.width() - image.width() * scale) / 2;
    const offsetY = (globalState.stage.height() - image.height() * scale) / 2;
    globalState.stage.position({ x: offsetX, y: offsetY });

    globalState.stage.draw();
  }
}

function zoomIn() {
  const oldScale = globalState.stage.scaleX();
  const pointer = globalState.stage.getPointerPosition();

  // Use the relative pointer position to ensure zoom focus on the correct point
  const mousePointTo = getRelativePointerPosition(globalState.stage);

  // Set maximum zoom-in level
  if (globalState.stage.scaleX() >= 4) {
    log("Hit max zoom in");
    return;
  }

  const newScale = oldScale * 1.1; // Increase the scale by 10%

  // Apply the new scale
  globalState.stage.scale({ x: newScale, y: newScale });

  // Adjust globalState.stage position to ensure correct zoom focus
  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };

  globalState.stage.position(newPos);
  adjustAnchorsAndShapesSize();
  globalState.stage.draw();
}

function zoomOut() {
  const oldScale = globalState.stage.scaleX();
  const pointer = globalState.stage.getPointerPosition();

  const mousePointTo = getRelativePointerPosition(globalState.stage);

  // Set minimum zoom-out level
  if (globalState.stage.scaleX() <= 0.15) {
    log("Hit max zoom out");
    return;
  }

  const newScale = oldScale / 1.1; // Decrease the scale by 10%

  // Apply the new scale
  globalState.stage.scale({ x: newScale, y: newScale });

  // Adjust globalState.stage position to ensure correct zoom focus
  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };

  globalState.stage.position(newPos);
  adjustAnchorsAndShapesSize();
  globalState.stage.draw();
}

function adjustAnchorsAndShapesSize() {
  // Adjust anchors size and position based on zoom level if there's a selected shape
  if (globalState.lastSelectedShape) {
    resizeAndPositionAnchors(globalState.lastSelectedShape);
  }

  // Adjust dimension lines
  const arrows = globalState.drawLayer.find(".dimensionLine");
  arrows.forEach((arrow) => {
    arrow.strokeWidth(getDynamicStrokeWidth(undefined, undefined, 20));
    arrow.pointerLength(getDynamicStrokeWidth(undefined, undefined, 30));
    arrow.pointerWidth(getDynamicStrokeWidth(undefined, undefined, 30));
    const associatedText = arrow.getAttr("associatedText");
    if (associatedText)
      associatedText.fontSize(getDynamicStrokeWidth(undefined, 20, 60));
  });

  // Adjust linear lines
  const linearLines = globalState.drawLayer.find(".linearLine");
  linearLines.forEach((line) => {
    line.strokeWidth(getDynamicStrokeWidth(undefined, undefined, 20));
    const associatedText = line.getAttr("associatedText");
    if (associatedText)
      associatedText.fontSize(getDynamicStrokeWidth(undefined, 20, 60));
  });

  // Adjust polygon areas
  const polygonAreas = globalState.drawLayer.find(".polygonArea");
  polygonAreas.forEach((polygonArea) => {
    polygonArea.strokeWidth(getDynamicStrokeWidth(undefined, undefined, 15));
    const associatedText = polygonArea.getAttr("associatedText");
    if (associatedText)
      associatedText.fontSize(getDynamicStrokeWidth(undefined, 20, 60));
  });

  // Adjust rect areas
  const rectAreas = globalState.drawLayer.find(".rectArea");
  rectAreas.forEach((rectArea) => {
    rectArea.strokeWidth(getDynamicStrokeWidth(undefined, undefined, 15));
    const associatedText = rectArea.getAttr("associatedText");
    if (associatedText) {
      associatedText.fontSize(getDynamicStrokeWidth(undefined, 20, 60));
    }
    syncRectTextPosition(rectArea);
  });

  const textBoxes = globalState.drawLayer.find(".textBoxRect");
  textBoxes.forEach((textBox) => {
    textBox.strokeWidth(getDynamicStrokeWidth(undefined, undefined, 15));
  });

  // Adjust cloud shapes on zoom
  updateCloudShapeOnZoom();

  // Update text area position when editing
  updateTextAreaPosition();
}

function updateCloudShapeOnZoom() {
  const clouds = globalState.drawLayer.find(".cloud");
  if (clouds.length === 0) return;

  for (let i = 0; i < clouds.length; i++) {
    const cloud = clouds[i];
    const baseWidth = cloud.width();
    const baseHeight = cloud.height();
    const scallopWidth = getDynamicStrokeWidth(0.15, 20, 100);
    const scallopHeight = getDynamicStrokeWidth(0.15, 20, 100);

    // Recalculate the curve points based on current dimensions
    const newCurvePoints = calculateCloudPoints(
      Math.abs(baseWidth),
      Math.abs(baseHeight),
      scallopWidth,
      scallopHeight
    );

    // Update the shape's sceneFunc to reflect the new points
    cloud.sceneFunc(function (context, shape) {
      context.beginPath();
      context.moveTo(0, 0);

      for (let i = 0; i < newCurvePoints.length; i += 6) {
        context.bezierCurveTo(
          newCurvePoints[i],
          newCurvePoints[i + 1],
          newCurvePoints[i + 2],
          newCurvePoints[i + 3],
          newCurvePoints[i + 4],
          newCurvePoints[i + 5]
        );
      }

      context.closePath();
      context.fillStrokeShape(shape);
    });
  }

  globalState.drawLayer.draw();
}

function getNewPastePosition(cutShape) {
  // Get the initial position of the shape
  const initialX = cutShape.x();
  const initialY = cutShape.y();
  let newX = initialX;
  let newY = initialY;

  // Check if the shape is a rectangle (or similar)
  if (
    cutShape.name() === "rectArea" ||
    cutShape.name() === "highlight" ||
    cutShape.name() === "cloud" ||
    cutShape.name() === "textBoxInput"
  ) {
    // Get the width and height of the shape
    const height = cutShape.height() * cutShape.scaleY();

    // Check if moving it downward is within bounds
    if (isWithinBounds(newX, newY + height * 2)) {
      newY = initialY + height;
    } else if (isWithinBounds(newX, newY - height)) {
      newY = initialY - height;
    } else {
      newX = globalState.imageBounds.left;
      newY = globalState.imageBounds.top;
    }
  } else if (
    cutShape.name() === "dimensionLine" ||
    cutShape.name() === "linearLine" ||
    cutShape.name() === "polygonArea"
  ) {
    // Move the line 30 pixels down (using x and y)

    // Get the maxX and maxY and x associated with maxY of the line

    const maxValues = getMaxMinYWithAssociatedX(cutShape);

    // Check if moving the line 30 pixels down will be out of bounds
    if (
      isWithinBounds(
        maxValues.associatedXWithMaxY,
        maxValues.maxY + 30 + initialY
      )
    ) {
      newY = initialY + 30;
    } else if (
      isWithinBounds(
        maxValues.associatedXWithMinY,
        maxValues.minY - 30 + initialY
      )
    ) {
      newY = initialY - 30;
    }

    // Set new position for the line (using x and y, not points)
    newX = initialX;
  } else if (cutShape.name() === "calloutText") {
    const associatedCallout = cutShape.getAttr("associatedCallout");
    // Get the width and height of the shape
    const height = associatedCallout.height() * cutShape.scaleY();

    // Check if moving it downward is within bounds
    if (isWithinBounds(newX, newY + height * 2)) {
      newY = initialY + height;
    } else if (isWithinBounds(newX, newY - height)) {
      newY = initialY - height;
    } else {
      newX = globalState.imageBounds.left;
      newY = globalState.imageBounds.top;
    }
  }

  // Return the new coordinates for the shape
  return { x: newX, y: newY };
}

function getMaxMinYWithAssociatedX(line) {
  const points = line.points();

  // Initialize variables for maxY, minY, and their associated x-values
  let maxY = -Infinity;
  let associatedXWithMaxY = null;

  let minY = Infinity;
  let associatedXWithMinY = null;

  // Loop through the points array
  for (let i = 0; i < points.length; i += 2) {
    const x = points[i]; // x-coordinate
    const y = points[i + 1]; // y-coordinate

    // Update maxY and its associated x
    if (y > maxY) {
      maxY = y;
      associatedXWithMaxY = x;
    }

    // Update minY and its associated x
    if (y < minY) {
      minY = y;
      associatedXWithMinY = x;
    }
  }

  return { maxY, associatedXWithMaxY, minY, associatedXWithMinY };
}

function calculateBoundingBox(selectedShapes) {
  let topMost = Infinity;
  let leftMost = Infinity;
  let rightMost = -Infinity;
  let bottomMost = -Infinity;

  selectedShapes.forEach((shape) => {
    const x = shape.x();
    const y = shape.y();
    const scaleX = shape.scaleX();
    const scaleY = shape.scaleY();

    const name = shape.name();

    if (name === "highlight" || name === "cloud") {
      const width = shape.width() * scaleX;
      const height = shape.height() * scaleY;

      // Update bounding box values for rectangular or generic shapes
      topMost = Math.min(topMost, y);
      leftMost = Math.min(leftMost, x);
      rightMost = Math.max(rightMost, x + width);
      bottomMost = Math.max(bottomMost, y + height);
    } else if (
      name === "rectArea" ||
      name === "dimensionLine" ||
      name === "linearLine" ||
      name === "polygonArea"
    ) {
      const points = shape.points();

      // Iterate through points and adjust with the shape's position
      for (let i = 0; i < points.length; i += 2) {
        const pointX = points[i] + x; // No need for scaleX, points are absolute
        const pointY = points[i + 1] + y; // No need for scaleY, points are absolute

        // Update bounding box values using point coordinates
        topMost = Math.min(topMost, pointY);
        leftMost = Math.min(leftMost, pointX);
        rightMost = Math.max(rightMost, pointX);
        bottomMost = Math.max(bottomMost, pointY);
      }
    } else if (name === "calloutText" || name === "textBoxInput") {
      const width = shape.width() * scaleX;
      const height = shape.height() * scaleY;

      // Update bounding box values for text shapes
      topMost = Math.min(topMost, y);
      leftMost = Math.min(leftMost, x);
      rightMost = Math.max(rightMost, x + width);
      bottomMost = Math.max(bottomMost, y + height);
    }
  });

  // Return false if no valid shapes were found
  if (
    topMost === Infinity &&
    leftMost === Infinity &&
    rightMost === Infinity &&
    bottomMost === Infinity
  ) {
    return false;
  }

  return {
    topMost,
    leftMost,
    rightMost,
    bottomMost,
  };
}

function getRectCorners(rect) {
  if (!rect) return;
  if (!(rect instanceof Konva.Rect)) return;
  const x = rect.x();
  const y = rect.y();
  const height = rect.height();
  const width = rect.width();
  const topLeft = [x, y];
  const topRight = [x + width, y];
  const bottomLeft = [x, y + height];
  const bottomRight = [x + width, y + height];

  const corners = [...topLeft, ...topRight, ...bottomLeft, ...bottomRight];

  return corners;
}

// Function to update only the relevant anchor positions
function updateAnchorPositions(rectShape, anchors, draggedIndex) {
  const points = rectShape.points();
  const shapePos = rectShape.position();
  const anchorOffsetX = anchors[0].width() / 2; // Assuming all anchors have the same size
  const anchorOffsetY = anchors[0].height() / 2;

  if (draggedIndex === 0) {
    // Top-left corner
    // Adjust bottom-left (index 3) and top-right (index 1)
    anchors[1].position({
      x: points[2] + shapePos.x - anchorOffsetX, // Top-right x remains the same
      y: points[1] + shapePos.y - anchorOffsetY, // Align with new y of top-left
    });

    anchors[3].position({
      x: points[0] + shapePos.x - anchorOffsetX, // Align with new x of top-left
      y: points[7] + shapePos.y - anchorOffsetY, // Bottom-left y remains the same
    });
  } else if (draggedIndex === 1) {
    // Top-right corner
    // Adjust top-left (index 0) and bottom-right (index 2)
    anchors[0].position({
      x: points[0] + shapePos.x - anchorOffsetX, // Top-left x remains the same
      y: points[1] + shapePos.y - anchorOffsetY, // Align with new y of top-right
    });

    anchors[2].position({
      x: points[4] + shapePos.x - anchorOffsetX, // Align with new x of top-right
      y: points[5] + shapePos.y - anchorOffsetY, // Bottom-right y remains the same
    });
  } else if (draggedIndex === 2) {
    // Bottom-right corner
    // Adjust top-right (index 1) and bottom-left (index 3)
    anchors[1].position({
      x: points[2] + shapePos.x - anchorOffsetX, // Top-right x remains the same
      y: points[3] + shapePos.y - anchorOffsetY, // Align with new y of bottom-right
    });

    anchors[3].position({
      x: points[6] + shapePos.x - anchorOffsetX, // Align with new x of bottom-right
      y: points[7] + shapePos.y - anchorOffsetY, // Bottom-left y remains the same
    });
  } else if (draggedIndex === 3) {
    // Bottom-left corner
    // Adjust top-left (index 0) and bottom-right (index 2)
    anchors[0].position({
      x: points[0] + shapePos.x - anchorOffsetX, // Align with new x of bottom-left
      y: points[1] + shapePos.y - anchorOffsetY, // Top-left y remains the same
    });

    anchors[2].position({
      x: points[4] + shapePos.x - anchorOffsetX, // Bottom-right x remains the same
      y: points[5] + shapePos.y - anchorOffsetY, // Align with new y of bottom-left
    });
  }
}

// Create an object with all the functions
const utils = {
  getDynamicStrokeWidth,
  calculateCloudPoints,
  getRelativePointerPosition,
  calculateLength,
  calculatePolygonArea,
  calculateRectangleArea,
  checkZeroShape,
  getImageBorders,
  updateTextAreaPosition,
  generatePointsForCallout,
  createTextareaOverShape,
  isWithinBounds,
  syncLinearTextPosition,
  syncRectTextPosition,
  resizeAndPositionAnchors,
  zoomHome,
  zoomIn,
  zoomOut,
  adjustAnchorsAndShapesSize,
  updateCloudShapeOnZoom,
  getNewPastePosition,
  calculateBoundingBox,
  getRectCorners,
  resizeAndPositionRectAnchors,
  updateAnchorPositions,
};

// Export the object
export default utils;
