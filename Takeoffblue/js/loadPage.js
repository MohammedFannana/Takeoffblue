import {
  dimensionLineShapes,
  linearTakeoffShapes,
  polygonTakeoffShapes,
  rectTakeoffShapes,
  highlightShapes,
  cloudShapes,
  calloutTextShapes,
  textBoxInputShapes,
} from "./exampleDatabase.js";
import { boundFuncForShapeMove, globalState } from "./main-section-script.js";
import utils from "./utils.js";

const log = console.log;
/* ------------------------- Load page state from database and add shapes to layer ---------------------------------------------- */

function loadPageFromDB() {
  loadDimensionLineShapes();
  loadLinearTakeoffShapes();
  loadPolygonTakeoffShapes();
  loadRectTakeoffShapes();
  loadHighlightShapes();
  loadCloudShapes();
  loadCalloutTextShapes();
  loadTextBoxInputShapes();
  utils.adjustAnchorsAndShapesSize();
  globalState.drawLayer.draw();
}

function loadDimensionLineShapes() {
  if (!dimensionLineShapes || dimensionLineShapes.length === 0) {
    return;
  }
  dimensionLineShapes.forEach((dimensionLineShape) => {
    const { name } = dimensionLineShape["mainNode"];
    if (name === "dimensionLine") {
      addDimensionLineStateToLayer(dimensionLineShape);
    }
  });
}
function loadLinearTakeoffShapes() {
  if (!linearTakeoffShapes || linearTakeoffShapes.length === 0) {
    return;
  }
  linearTakeoffShapes.forEach((linearTakeoffShape) => {
    const { name } = linearTakeoffShape["mainNode"];
    if (name === "linearLine") {
      addLinearLineStateToLayer(linearTakeoffShape);
    } else if (name === "polygonArea") {
      addpolygonAreaStateToLayer(linearTakeoffShape);
    }
  }); /// seperate polygon XXXX
}
function loadPolygonTakeoffShapes() {
  if (!polygonTakeoffShapes || polygonTakeoffShapes.length === 0) {
    return;
  }
  polygonTakeoffShapes.forEach((polygonTakeoffShape) => {
    const { name } = polygonTakeoffShape["mainNode"];
    if (name === "polygonArea") {
      addpolygonAreaStateToLayer(polygonTakeoffShape);
    }
  }); /// seperate polygon XXXX
}
function loadRectTakeoffShapes() {
  if (!rectTakeoffShapes || rectTakeoffShapes.length === 0) {
    return;
  }
  rectTakeoffShapes.forEach((rectTakeoffShape) => {
    const { name } = rectTakeoffShape["mainNode"];
    if (name === "rectArea") {
      addRectStateToLayer(rectTakeoffShape);
    }
  });
}
function loadHighlightShapes() {
  if (!highlightShapes || highlightShapes.length === 0) {
    return;
  }
  highlightShapes.forEach((highlightShape) => {
    const { name } = highlightShape["mainNode"];
    if (name === "highlight") {
      addHighlightStateToLayer(highlightShape);
    }
  });
}
function loadCloudShapes() {
  if (!cloudShapes || cloudShapes.length === 0) {
    return;
  }
  cloudShapes.forEach((cloudShape) => {
    const { name } = cloudShape["mainNode"];
    if (name === "cloud") {
      addCloudStateToLayer(cloudShape);
    }
  });
}
function loadCalloutTextShapes() {
  if (!calloutTextShapes || calloutTextShapes.length === 0) {
    return;
  }
  calloutTextShapes.forEach((calloutTextShape) => {
    const { name } = calloutTextShape["mainNode"];
    if (name === "calloutText") {
      addCalloutStateToLayer(calloutTextShape);
    }
  });
}
function loadTextBoxInputShapes() {
  if (!textBoxInputShapes || textBoxInputShapes.length === 0) {
    return;
  }
  textBoxInputShapes.forEach((textBoxInputShape) => {
    const { name } = textBoxInputShape["mainNode"];
    if (name === "textBoxInput") {
      addTextBoxInputStateToLayer(textBoxInputShape);
    }
  });
}

function addDimensionLineStateToLayer(shapeInfo) {
  const nodeExists = globalState.drawLayer.findOne(`#${shapeInfo["id"]}`);
  if (!nodeExists) {
    const { name } = shapeInfo["mainNode"];
    const mainNode = new Konva.Arrow({
      id: shapeInfo["id"],
      name,
      ...shapeInfo["mainNode"],
    });
    const associatedText = new Konva.Text({
      ...shapeInfo["associatedText"],
    });
    mainNode.setAttr("associatedText", associatedText);
    globalState.drawLayer.add(mainNode, associatedText);
    const anchors = [];
    shapeInfo["anchors"].forEach((anchor) => {
      const anchorNode = new Konva.Rect({
        ...anchor,
      });
      anchors.push(anchorNode);
      globalState.drawLayer.add(anchorNode);
    });
    mainNode.setAttr("anchors", anchors);
  }
}
function addLinearLineStateToLayer(shapeInfo) {
  const nodeExists = globalState.drawLayer.findOne(`#${shapeInfo["id"]}`);
  if (!nodeExists) {
    const { name } = shapeInfo["mainNode"];
    const mainNode = new Konva.Line({
      id: shapeInfo["id"],
      name,
      ...shapeInfo["mainNode"],
    });
    const assocaitedNode = new Konva.Text({
      ...shapeInfo["associatedText"],
    });
    mainNode.setAttr("associatedText", assocaitedNode);
    globalState.drawLayer.add(mainNode, assocaitedNode);
    const anchors = [];
    shapeInfo["anchors"].forEach((anchor) => {
      const anchorNode = new Konva.Rect({
        ...anchor,
      });
      anchors.push(anchorNode);
      globalState.drawLayer.add(anchorNode);
    });
    mainNode.setAttr("anchors", anchors);
    globalState.drawLayer.draw();
  }
}
function addpolygonAreaStateToLayer(shapeInfo) {
  const nodeExists = globalState.drawLayer.findOne(`#${shapeInfo["id"]}`);
  if (!nodeExists) {
    const { name } = shapeInfo["mainNode"];
    const mainNode = new Konva.Line({
      id: shapeInfo["id"],
      name,
      ...shapeInfo["mainNode"],
    });
    const assocaitedNode = new Konva.Text({
      ...shapeInfo["associatedText"],
    });
    mainNode.setAttr("associatedText", assocaitedNode);
    globalState.drawLayer.add(mainNode, assocaitedNode);
    const anchors = [];
    shapeInfo["anchors"].forEach((anchor) => {
      const anchorNode = new Konva.Rect({
        ...anchor,
      });
      anchors.push(anchorNode);
      globalState.drawLayer.add(anchorNode);
    });
    mainNode.setAttr("anchors", anchors);
  }
}
function addRectStateToLayer(shapeInfo) {
  const nodeExists = globalState.drawLayer.findOne(`#${shapeInfo["id"]}`);
  if (!nodeExists) {
    const { name } = shapeInfo["mainNode"];
    const mainNode = new Konva.Line({
      id: shapeInfo["id"],
      name,
      ...shapeInfo["mainNode"],
    });
    const assocaitedNode = new Konva.Text({
      ...shapeInfo["associatedText"],
    });
    mainNode.setAttr("associatedText", assocaitedNode);

    globalState.drawLayer.add(mainNode, assocaitedNode);
    const anchors = [];
    shapeInfo["anchors"].forEach((anchor) => {
      const anchorNode = new Konva.Rect({
        ...anchor,
      });
      anchors.push(anchorNode);
      globalState.drawLayer.add(anchorNode);
    });
    mainNode.setAttr("anchors", anchors);
  }
}
function addHighlightStateToLayer(shapeInfo) {
  const nodeExists = globalState.drawLayer.findOne(`#${shapeInfo["id"]}`);
  if (!nodeExists) {
    const { name } = shapeInfo["mainNode"];
    const mainNode = new Konva.Rect({
      id: shapeInfo["id"],
      name,
      ...shapeInfo["mainNode"],
    });
    mainNode.dragBoundFunc(boundFuncForShapeMove);
    globalState.drawLayer.add(mainNode);
  }
}
function addCloudStateToLayer(shapeInfo) {
  const nodeExists = globalState.drawLayer.findOne(`#${shapeInfo["id"]}`);
  if (!nodeExists) {
    const { name } = shapeInfo["mainNode"];
    const { curvePoints } = shapeInfo;
    const mainNode = new Konva.Shape({
      id: shapeInfo["id"],
      name,
      ...shapeInfo["mainNode"],
      sceneFunc: function (context, shape) {
        context.beginPath();
        context.moveTo(0, 0);
        for (let i = 0; i < curvePoints?.length; i += 6) {
          // Draw the bezier curve
          context.bezierCurveTo(
            curvePoints[i],
            curvePoints[i + 1],
            curvePoints[i + 2],
            curvePoints[i + 3],
            curvePoints[i + 4],
            curvePoints[i + 5]
          );
        }

        context.closePath();
        context.fillStrokeShape(shape);
      },
    });
    mainNode.dragBoundFunc(boundFuncForShapeMove);
    mainNode.setAttr("curvePoints", curvePoints);
    globalState.drawLayer.add(mainNode);
  }
}
function addCalloutStateToLayer(shapeInfo) {
  const nodeExists = globalState.drawLayer.findOne(`#${shapeInfo["id"]}`);
  if (!nodeExists) {
    const { calloutPoints } = shapeInfo;
    const mainNode = new Konva.Text({
      id: shapeInfo["id"],
      ...shapeInfo["mainNode"],
    });
    const assocaitedNode = new Konva.Shape({
      ...shapeInfo["associatedCallout"],
      sceneFunc: function (context, shape) {
        context.beginPath();
        calloutPoints.forEach((calloutPoint, index) => {
          if (index === 0) {
            context.moveTo(calloutPoint.x, calloutPoint.y);
          } else {
            context.lineTo(calloutPoint.x, calloutPoint.y);
          }
        });
        context.closePath();
        context.fillStrokeShape(shape);
      },
    });
    mainNode.dragBoundFunc(boundFuncForShapeMove);
    mainNode.setAttr("associatedCallout", assocaitedNode);
    assocaitedNode.setAttr("associatedText", mainNode);
    mainNode.setAttr("calloutPoints", calloutPoints);
    globalState.drawLayer.add(assocaitedNode, mainNode);
  }
}
function addTextBoxInputStateToLayer(shapeInfo) {
  const nodeExists = globalState.drawLayer.findOne(`#${shapeInfo["id"]}`);
  if (!nodeExists) {
    const assocaitedNode = new Konva.Rect({
      ...shapeInfo["associatedBox"],
    });
    const mainNode = new Konva.Text({
      id: shapeInfo["id"],
      ...shapeInfo["mainNode"],
    });

    mainNode.dragBoundFunc(boundFuncForShapeMove);
    mainNode.setAttr("associatedBox", assocaitedNode);
    assocaitedNode.setAttr("associatedText", mainNode);
    globalState.drawLayer.add(assocaitedNode, mainNode);
  }
}

const loadPageService = {
  loadPageFromDB,
};

export default loadPageService;
