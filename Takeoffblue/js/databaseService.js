const log = console.log;
let globalId = 23145;
// get a deep copy of filtered attributes
function getFilteredAttrs(shape) {
  const attrs = shape.getAttrs();
  const filteredAttrs = {};
  // add position
  filteredAttrs["x"] = shape.x();
  filteredAttrs["y"] = shape.y();
  // add scale
  filteredAttrs["scaleX"] = shape.scaleX();
  filteredAttrs["scaleY"] = shape.scaleY();
  for (const property in attrs) {
    if (
      property !== "associatedText" &&
      property !== "anchors" &&
      property !== "associatedCallout" &&
      property !== "associatedBox" &&
      property !== "sceneFunc" &&
      property !== "dragBoundFunc" &&
      property !== "curvePoints" &&
      property !== "calloutPoints"
    ) {
      filteredAttrs[property] = attrs[property];
    }
  }
  const deepCopy = JSON.parse(JSON.stringify(filteredAttrs));
  return deepCopy;
}

// push create functions
function pushShapeById(shape) {
  if (!shape) return;
  const name = shape.name();
  if (name === "dimensionLine") {
    return pushDimensionLineNotation(shape);
  } else if (name === "linearLine") {
    return pushLinearLineTakeoff(shape);
  } else if (name === "polygonArea") {
    return pushPolygonTakeoff(shape);
  } else if (name === "rectArea") {
    return pushRectTakeoff(shape);
  } else if (name === "highlight") {
    return pushHighlightNotation(shape);
  } else if (name === "cloud") {
    return pushCloudNotation(shape);
  } else if (name === "calloutText") {
    return pushCalloutNotation(shape);
  } else if (name === "textBoxInput") {
    return pushTextBoxNotation(shape);
  }
}
function pushDimensionLineNotation(shape) {
  const shapeObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  shapeObj["mainNode"] = mainNodeFilteredAttrs;
  const associatedText = shape.getAttr("associatedText");
  const assocaitedNodeAttrs = getFilteredAttrs(associatedText);
  shapeObj["associatedText"] = assocaitedNodeAttrs;
  const anchors = [];
  const assocaitedAnchors = shape.getAttr("anchors");
  assocaitedAnchors.forEach((anchor) => {
    const anchorAttrs = getFilteredAttrs(anchor);
    anchors.push(anchorAttrs);
  });
  shapeObj["anchors"] = anchors;
  // add pageId, projectId fields then,
  // Push shapeObj to database.
  // return the obj from database
  return { id: `id-${globalId++}` }; // testing
}
function pushLinearLineTakeoff(shape) {
  const shapeObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  shapeObj["mainNode"] = mainNodeFilteredAttrs;
  const associatedText = shape.getAttr("associatedText");
  const assocaitedNodeAttrs = getFilteredAttrs(associatedText);
  shapeObj["associatedText"] = assocaitedNodeAttrs;
  const anchors = [];
  const assocaitedAnchors = shape.getAttr("anchors");
  assocaitedAnchors.forEach((anchor) => {
    const anchorAttrs = getFilteredAttrs(anchor);
    anchors.push(anchorAttrs);
  });
  shapeObj["anchors"] = anchors;
  // add takeoffId, pageId, projectId fields then,
  // Push shapeObj to database.
  // return the obj from database
  return { id: `id-${globalId++}` }; // testing
}
function pushPolygonTakeoff(shape) {
  const shapeObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  shapeObj["mainNode"] = mainNodeFilteredAttrs;
  const associatedText = shape.getAttr("associatedText");
  const assocaitedNodeAttrs = getFilteredAttrs(associatedText);
  shapeObj["associatedText"] = assocaitedNodeAttrs;
  const anchors = [];
  const assocaitedAnchors = shape.getAttr("anchors");
  assocaitedAnchors.forEach((anchor) => {
    const anchorAttrs = getFilteredAttrs(anchor);
    anchors.push(anchorAttrs);
  });
  shapeObj["anchors"] = anchors;
  // add takeoffId, pageId, projectId fields then,
  // Push shapeObj to database.
  // return the obj from database
  return { id: `id-${globalId++}` }; // testing
}
function pushRectTakeoff(shape) {
  const shapeObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  shapeObj["mainNode"] = mainNodeFilteredAttrs;
  const associatedText = shape.getAttr("associatedText");
  const assocaitedNodeAttrs = getFilteredAttrs(associatedText);
  shapeObj["associatedText"] = assocaitedNodeAttrs;
  // add takeoffId, pageId, projectId fields then,
  // Push shapeObj to database.
  // return the obj from database
  return { id: `id-${globalId++}` }; // testing
}
function pushHighlightNotation(shape) {
  const shapeObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  shapeObj["mainNode"] = mainNodeFilteredAttrs;
  // add takeoffId, pageId, projectId fields then,
  // Push shapeObj to database.
  // return the obj from database
  return { id: `id-${globalId++}` }; // testing
}
function pushCloudNotation(shape) {
  const shapeObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  const curvePoints = shape.getAttr("curvePoints");
  shapeObj["mainNode"] = mainNodeFilteredAttrs;
  shapeObj["curvePoints"] = curvePoints;
  // add takeoffId, pageId, projectId fields then,
  // Push shapeObj to database.
  // return the obj from database
  return { id: `id-${globalId++}` }; // testing
}
function pushCalloutNotation(shape) {
  const shapeObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  const calloutPoints = shape.getAttr("calloutPoints");
  shapeObj["mainNode"] = mainNodeFilteredAttrs;
  shapeObj["calloutPoints"] = calloutPoints;
  const associatedCallout = shape.getAttr("associatedCallout");
  const associatedCalloutAttrs = getFilteredAttrs(associatedCallout);
  shapeObj["associatedCallout"] = associatedCalloutAttrs;
  // add takeoffId, pageId, projectId fields then,
  // Push shapeObj to database.
  // return the obj from database
  return { id: `id-${globalId++}` }; // testing
}
function pushTextBoxNotation(shape) {
  const shapeObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  shapeObj["mainNode"] = mainNodeFilteredAttrs;
  const associatedBox = shape.getAttr("associatedBox");
  const associatedBoxAttrs = getFilteredAttrs(associatedBox);
  shapeObj["associatedBox"] = associatedBoxAttrs;
  // add takeoffId, pageId, projectId fields then,
  // Push shapeObj to database.
  // return the obj from database
  return { id: `id-${globalId++}` }; // testing
}

// update functions (Use for updating shapes like callout text or text box or toolbar for edits.)
function updateShapeById(shape) {
  if (!shape) return;
  const name = shape.name();
  if (name === "dimensionLine") {
    updateDimensionLineById(shape);
  } else if (name === "linearLine") {
    updateLinearLineTakeoffById(shape);
  } else if (name === "polygonArea") {
    updatePolygonTakeoffById(shape);
  } else if (name === "rectArea") {
    updateRectTakeoffById(shape);
  } else if (name === "highlight") {
    updateHighlightNotationById(shape);
  } else if (name === "cloud") {
    updateCloudNotationById(shape);
  } else if (name === "calloutText") {
    updateCalloutNotationById(shape);
  } else if (name === "textBoxInput") {
    updateTextBoxNotation(shape);
  }
}
function updateDimensionLineById(dimensionLine) {
  const updateObj = {};
  const newMainAttrs = getFilteredAttrs(dimensionLine);
  updateObj["mainNode"] = newMainAttrs;
  const associatedText = dimensionLine.getAttr("associatedText");
  const associatedTextAttrs = getFilteredAttrs(associatedText);
  updateObj["associatedText"] = associatedTextAttrs;
  const anchors = [];
  const assocaitedAnchors = dimensionLine.getAttr("anchors");
  assocaitedAnchors.forEach((anchor) => {
    const anchorAttrs = getFilteredAttrs(anchor);
    anchors.push(anchorAttrs);
  });
  updateObj["anchors"] = anchors;
  // update dimentionLine table by id using the updateObj;
}
function updateLinearLineTakeoffById(shape) {
  const updateObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  updateObj["mainNode"] = mainNodeFilteredAttrs;
  const associatedText = shape.getAttr("associatedText");
  const associatedTextAttrs = getFilteredAttrs(associatedText);
  updateObj["associatedText"] = associatedTextAttrs;
  const anchors = [];
  const assocaitedAnchors = shape.getAttr("anchors");
  assocaitedAnchors.forEach((anchor) => {
    const anchorAttrs = getFilteredAttrs(anchor);
    anchors.push(anchorAttrs);
  });
  updateObj["anchors"] = anchors;
  // update linear takeoff table by id using the updateObj;
}
function updatePolygonTakeoffById(shape) {
  const updateObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  updateObj["mainNode"] = mainNodeFilteredAttrs;
  const associatedText = shape.getAttr("associatedText");
  const associatedTextAttrs = getFilteredAttrs(associatedText);
  updateObj["associatedText"] = associatedTextAttrs;
  const anchors = [];
  const assocaitedAnchors = shape.getAttr("anchors");
  assocaitedAnchors.forEach((anchor) => {
    const anchorAttrs = getFilteredAttrs(anchor);
    anchors.push(anchorAttrs);
  });
  updateObj["anchors"] = anchors;
  // update linear takeoff table by id using the updateObj;
}
function updateRectTakeoffById(shape) {
  const updateObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  updateObj["mainNode"] = mainNodeFilteredAttrs;
  const associatedText = shape.getAttr("associatedText");
  const associatedTextAttrs = getFilteredAttrs(associatedText);
  updateObj["associatedText"] = associatedTextAttrs;
  // Push updateObj to database to update by id.
}
function updateHighlightNotationById(shape) {
  const updateObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  updateObj["mainNode"] = mainNodeFilteredAttrs;
  // Update highlight by id using the updateObj.
}
function updateCloudNotationById(shape) {
  const updateObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  const curvePoints = shape.getAttr("curvePoints");
  updateObj["mainNode"] = mainNodeFilteredAttrs;
  updateObj["curvePoints"] = curvePoints;
  // update cloud table by id using the shapeObj.
}
function updateCalloutNotationById(shape) {
  const updateObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  const calloutPoints = shape.getAttr("calloutPoints");
  updateObj["mainNode"] = mainNodeFilteredAttrs;
  updateObj["calloutPoints"] = calloutPoints;
  const associatedCallout = shape.getAttr("associatedCallout");
  const associatedCalloutAttrs = getFilteredAttrs(associatedCallout);
  updateObj["associatedCallout"] = associatedCalloutAttrs;
  // Update callout talbe by id using updateObj.
}
function updateTextBoxNotation(shape) {
  const updateObj = {};
  const mainNodeFilteredAttrs = getFilteredAttrs(shape);
  updateObj["mainNode"] = mainNodeFilteredAttrs;
  const associatedBox = shape.getAttr("associatedBox");
  const associatedBoxAttrs = getFilteredAttrs(associatedBox);
  updateObj["associatedBox"] = associatedBoxAttrs;
  // update text box table by id using updateObj.
}

// delete functions
function deleteShapeById(shape) {
  if (!shape) return;
  const name = shape.name();
  if (name === "dimensionLine") {
    deleteDimensionLineById(shape.id());
  } else if (name === "linearLine") {
    deleteLinearLineTakeoffById(shape.id());
  } else if (name === "polygonArea") {
    deletePolygonTakeoffById(shape.id());
  } else if (name === "rectArea") {
    deleteRectTakeoffById(shape.id());
  } else if (name === "highlight") {
    deleteHighlightNotationById(shape.id());
  } else if (name === "cloud") {
    deleteCloudNotationById(shape.id());
  } else if (name === "calloutText") {
    deleteCalloutNotationById(shape.id());
  } else if (name === "textBoxInput") {
    deleteTextBoxNotation(shape.id());
  }
}

function deleteDimensionLineById(id) {
  // delete dimentionLine by id
  // draw layer again
}
function deleteLinearLineTakeoffById(id) {
  // delete Linear Line by id
  // draw layer again
}
function deletePolygonTakeoffById(id) {
  // delete polygon by id
  // draw layer again
}
function deleteRectTakeoffById(id) {
  // delete rect by id
  // draw layer again
}
function deleteHighlightNotationById(id) {
  // delete highlight by id
  // draw layer again
}
function deleteCloudNotationById(id) {
  // delete cloud by id
  // draw layer again
}
function deleteCalloutNotationById(id) {
  // delete callout by id
  // draw layer again
}
function deleteTextBoxNotation(id) {
  // delete text box by id
  // draw layer again
}

const databaseService = {
  getFilteredAttrs,
  pushShapeById,
  updateShapeById,
  deleteShapeById,
};
export default databaseService;

// Let's make it a default export in the future
