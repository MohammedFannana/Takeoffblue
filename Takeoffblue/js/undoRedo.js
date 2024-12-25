/*
This file handles state managmement for load, undo/redo functionality
*/
import databaseService from "./databaseService.js";
import {
  deselectAllShapes,
  selectShape,
  disableLastSelectedShape,
  globalState,
  boundFuncForShapeMove,
} from "./main-section-script.js";
import utils from "./utils.js";
const log = console.log;

let stateList = [[]];
let step = 0;

/* ----- add shape from layer to state ----- */
// Initial fill of the state. (Loading state from current layer);
// Call it on page load.
function fillStateFromLayer() {
  let state = [];
  // get all shapes
  const shapes = globalState.drawLayer.getChildren();
  const filterdShapes = shapes.filter((node) => {
    const name = node.name();
    if (
      name === "dimensionLine" ||
      name === "linearLine" ||
      name === "polygonArea" ||
      name === "rectArea" ||
      name === "highlight" ||
      name === "cloud" ||
      name === "calloutText" ||
      name === "textBoxInput"
    ) {
      return true;
    }
    return false;
  });
  if (filterdShapes?.length === 0) return;
  for (const shape of filterdShapes) {
    let stateItem = null;
    // Check if initial state is already filled.
    if (stateList[1] && stateList[1].length > 1) return;
    if (shape.name() === "dimensionLine") {
      stateItem = addDimensionLineToState(shape);
    } else if (shape.name() === "linearLine") {
      stateItem = addLinearLineToState(shape);
    } else if (shape.name() === "polygonArea") {
      stateItem = addPolygonAreaToState(shape);
    } else if (shape.name() === "rectArea") {
      stateItem = addRectAreaToState(shape);
    } else if (shape.name() === "highlight") {
      stateItem = addHighlightToState(shape);
    } else if (shape.name() === "cloud") {
      stateItem = addCloudToState(shape);
    } else if (shape.name() === "calloutText") {
      stateItem = addCalloutTextToState(shape);
    } else if (shape.name() === "textBoxInput") {
      stateItem = addTextBoxInputToState(shape);
    }
    state.push(stateItem);
  }
  stateList.push(state);
  step++;
}

function addDimensionLineToState(shape) {
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    // Get second level attributes
    const associatedText = shape.getAttr("associatedText");
    if (associatedText) {
      stateObj["associatedText"] =
        databaseService.getFilteredAttrs(associatedText);
    }
    const anchors = shape.getAttr("anchors");
    if (anchors?.length > 0) {
      const copyAnchors = [];
      anchors.forEach((anchor) => {
        const anchorCopy = databaseService.getFilteredAttrs(anchor);
        copyAnchors.push(anchorCopy);
      });
      stateObj["anchors"] = copyAnchors;
    }
    return stateObj;
  }
}
function addLinearLineToState(shape) {
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    // Get second level attributes
    const associatedText = shape.getAttr("associatedText");
    if (associatedText) {
      stateObj["associatedText"] =
        databaseService.getFilteredAttrs(associatedText);
    }
    const anchors = shape.getAttr("anchors");
    if (anchors?.length > 0) {
      const copyAnchors = [];
      anchors.forEach((anchor) => {
        const anchorCopy = databaseService.getFilteredAttrs(anchor);
        copyAnchors.push(anchorCopy);
      });
      stateObj["anchors"] = copyAnchors;
    }
    return stateObj;
  }
}
function addPolygonAreaToState(shape) {
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    // Get second level attributes
    const associatedText = shape.getAttr("associatedText");
    if (associatedText) {
      stateObj["associatedText"] =
        databaseService.getFilteredAttrs(associatedText);
    }
    const anchors = shape.getAttr("anchors");
    if (anchors?.length > 0) {
      const copyAnchors = [];
      anchors.forEach((anchor) => {
        const anchorCopy = databaseService.getFilteredAttrs(anchor);
        copyAnchors.push(anchorCopy);
      });
      stateObj["anchors"] = copyAnchors;
    }
    return stateObj;
  }
}
function addRectAreaToState(shape) {
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    // Get second level attributes
    const associatedText = shape.getAttr("associatedText");
    if (associatedText) {
      stateObj["associatedText"] =
        databaseService.getFilteredAttrs(associatedText);
    }

    const anchors = shape.getAttr("anchors");
    if (anchors?.length > 0) {
      const copyAnchors = [];
      anchors.forEach((anchor) => {
        const anchorCopy = databaseService.getFilteredAttrs(anchor);
        copyAnchors.push(anchorCopy);
      });
      stateObj["anchors"] = copyAnchors;
    }

    return stateObj;
  }
}
function addHighlightToState(shape) {
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;

    return stateObj;
  }
}
function addCloudToState(shape) {
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    // Get second level attributes
    const curvePoints = shape.getAttr("curvePoints");
    if (curvePoints) {
      stateObj["curvePoints"] = curvePoints;
    }

    return stateObj;
  }
}
function addCalloutTextToState(shape) {
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    // Get second level attributes
    const associatedCallout = shape.getAttr("associatedCallout");
    if (associatedCallout) {
      stateObj["associatedCallout"] =
        databaseService.getFilteredAttrs(associatedCallout);
    }

    const calloutPoints = shape.getAttr("calloutPoints");
    if (calloutPoints) {
      stateObj["calloutPoints"] = calloutPoints;
    }

    return stateObj;
  }
}
function addTextBoxInputToState(shape) {
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    // Get second level attributes
    const associatedBox = shape.getAttr("associatedBox");
    if (associatedBox) {
      stateObj["associatedBox"] =
        databaseService.getFilteredAttrs(associatedBox);
    }

    return stateObj;
  }
}

/*
Handle create actions. $Use them when a user finalizes a new shape.
*/
function addCreateShapeActionToState(shape) {
  if (shape.name() === "dimensionLine") {
    addCreateDimensionLineActionToState(shape);
  } else if (shape.name() === "linearLine") {
    addCreateLinearLineActionToState(shape);
  } else if (shape.name() === "polygonArea") {
    addCreatePolygonAreaActionToState(shape);
  } else if (shape.name() === "rectArea") {
    addCreateRectAreaActionToState(shape);
  } else if (shape.name() === "highlight") {
    addCreateHighlightActionToState(shape);
  } else if (shape.name() === "cloud") {
    addCreateCloudActionToState(shape);
  } else if (shape.name() === "calloutText") {
    addCreateCalloutTextActionToState(shape);
  } else if (shape.name() === "textBoxInput") {
    addCreateTextBoxInputActionToState(shape);
  }
  log(stateList); // testing
  log(`Step: ${step}`); // testing
}

function addCreateDimensionLineActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    const associatedText = shape.getAttr("associatedText");
    if (associatedText) {
      stateObj["associatedText"] =
        databaseService.getFilteredAttrs(associatedText);
    }
    const anchors = shape.getAttr("anchors");
    if (anchors?.length > 0) {
      const copyAnchors = [];
      anchors.forEach((anchor) => {
        const anchorCopy = databaseService.getFilteredAttrs(anchor);
        copyAnchors.push(anchorCopy);
      });
      stateObj["anchors"] = copyAnchors;
    }
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}
function addCreateLinearLineActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";

    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    // Get second level attributes
    const associatedText = shape.getAttr("associatedText");
    if (associatedText) {
      stateObj["associatedText"] =
        databaseService.getFilteredAttrs(associatedText);
    }
    const anchors = shape.getAttr("anchors");
    if (anchors?.length > 0) {
      const copyAnchors = [];
      anchors.forEach((anchor) => {
        const anchorCopy = databaseService.getFilteredAttrs(anchor);
        copyAnchors.push(anchorCopy);
      });
      stateObj["anchors"] = copyAnchors;
    }
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}
function addCreatePolygonAreaActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    // Get second level attributes
    const associatedText = shape.getAttr("associatedText");
    if (associatedText) {
      stateObj["associatedText"] =
        databaseService.getFilteredAttrs(associatedText);
    }
    const anchors = shape.getAttr("anchors");
    if (anchors?.length > 0) {
      const copyAnchors = [];
      anchors.forEach((anchor) => {
        const anchorCopy = databaseService.getFilteredAttrs(anchor);
        copyAnchors.push(anchorCopy);
      });
      stateObj["anchors"] = copyAnchors;
    }
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}
function addCreateRectAreaActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    // Get second level attributes
    const associatedText = shape.getAttr("associatedText");
    if (associatedText) {
      stateObj["associatedText"] =
        databaseService.getFilteredAttrs(associatedText);
    }

    const anchors = shape.getAttr("anchors");
    if (anchors?.length > 0) {
      const copyAnchors = [];
      anchors.forEach((anchor) => {
        const anchorCopy = databaseService.getFilteredAttrs(anchor);
        copyAnchors.push(anchorCopy);
      });
      stateObj["anchors"] = copyAnchors;
    }
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}
function addCreateHighlightActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}
function addCreateCloudActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    const curvePoints = shape.getAttr("curvePoints");
    if (curvePoints) {
      stateObj["curvePoints"] = curvePoints;
    }
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}
function addCreateCalloutTextActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    const associatedCallout = shape.getAttr("associatedCallout");
    if (associatedCallout) {
      stateObj["associatedCallout"] =
        databaseService.getFilteredAttrs(associatedCallout);
    }

    const calloutPoints = shape.getAttr("calloutPoints");
    if (calloutPoints) {
      stateObj["calloutPoints"] = calloutPoints;
    }
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}
function addCreateTextBoxInputActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "create";
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    const associatedBox = shape.getAttr("associatedBox");
    if (associatedBox) {
      stateObj["associatedBox"] =
        databaseService.getFilteredAttrs(associatedBox);
    }
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}

/*
Handle delete actions $Use them when a user deletes an existing shape.
*/
function addDeleteShapeActionToState(shape) {
  if (shape.name() === "dimensionLine") {
    addDeleteDimensionLineActionToState(shape);
  } else if (shape.name() === "linearLine") {
    addDeleteLinearLineActionToState(shape);
  } else if (shape.name() === "polygonArea") {
    addDeletePolygonAreaActionToState(shape);
  } else if (shape.name() === "rectArea") {
    addDeleteRectAreaActionToState(shape);
  } else if (shape.name() === "highlight") {
    addDeleteHighlightActionToState(shape);
  } else if (shape.name() === "cloud") {
    addDeleteCloudActionToState(shape);
  } else if (shape.name() === "calloutText") {
    addDeleteCalloutTextActionToState(shape);
  } else if (shape.name() === "textBoxInput") {
    addDeleteTextBoxInputActionToState(shape);
  }
}

function addDeleteDimensionLineActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "singleDelete";
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    const associatedText = shape.getAttr("associatedText");
    if (associatedText) {
      stateObj["associatedText"] =
        databaseService.getFilteredAttrs(associatedText);
    }
    const anchors = shape.getAttr("anchors");
    if (anchors?.length > 0) {
      const copyAnchors = [];
      anchors.forEach((anchor) => {
        const anchorCopy = databaseService.getFilteredAttrs(anchor);
        copyAnchors.push(anchorCopy);
      });
      stateObj["anchors"] = copyAnchors;
    }
    stateObj["selectState"] = "singleSelected";
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}
function addDeleteLinearLineActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "singleDelete";
    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    // Get second level attributes
    const associatedText = shape.getAttr("associatedText");
    if (associatedText) {
      stateObj["associatedText"] =
        databaseService.getFilteredAttrs(associatedText);
    }
    const anchors = shape.getAttr("anchors");
    if (anchors?.length > 0) {
      const copyAnchors = [];
      anchors.forEach((anchor) => {
        const anchorCopy = databaseService.getFilteredAttrs(anchor);
        copyAnchors.push(anchorCopy);
      });
      stateObj["anchors"] = copyAnchors;
    }
    stateObj["selectState"] = "singleSelected";
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}
function addDeletePolygonAreaActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "singleDelete";

    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    // Get second level attributes
    const associatedText = shape.getAttr("associatedText");
    if (associatedText) {
      stateObj["associatedText"] =
        databaseService.getFilteredAttrs(associatedText);
    }
    const anchors = shape.getAttr("anchors");
    if (anchors?.length > 0) {
      const copyAnchors = [];
      anchors.forEach((anchor) => {
        const anchorCopy = databaseService.getFilteredAttrs(anchor);
        copyAnchors.push(anchorCopy);
      });
      stateObj["anchors"] = copyAnchors;
    }
    stateObj["selectState"] = "singleSelected";
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}
function addDeleteRectAreaActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "singleDelete";

    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    // Get second level attributes
    const associatedText = shape.getAttr("associatedText");
    if (associatedText) {
      stateObj["associatedText"] =
        databaseService.getFilteredAttrs(associatedText);
    }
    const anchors = shape.getAttr("anchors");
    if (anchors?.length > 0) {
      const copyAnchors = [];
      anchors.forEach((anchor) => {
        const anchorCopy = databaseService.getFilteredAttrs(anchor);
        copyAnchors.push(anchorCopy);
      });
      stateObj["anchors"] = copyAnchors;
    }
    stateObj["selectState"] = "singleSelected";
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}
function addDeleteHighlightActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "singleDelete";

    // get first level attributes
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    stateObj["selectState"] = "singleSelected";
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}
function addDeleteCloudActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "singleDelete";

    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    const curvePoints = shape.getAttr("curvePoints");
    if (curvePoints) {
      stateObj["curvePoints"] = curvePoints;
    }
    stateObj["selectState"] = "singleSelected";
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}
function addDeleteCalloutTextActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "singleDelete";

    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    const associatedCallout = shape.getAttr("associatedCallout");
    if (associatedCallout) {
      stateObj["associatedCallout"] =
        databaseService.getFilteredAttrs(associatedCallout);
    }

    const calloutPoints = shape.getAttr("calloutPoints");
    if (calloutPoints) {
      stateObj["calloutPoints"] = calloutPoints;
    }
    stateObj["selectState"] = "singleSelected";
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}
function addDeleteTextBoxInputActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "singleDelete";

    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    const associatedBox = shape.getAttr("associatedBox");
    if (associatedBox) {
      stateObj["associatedBox"] =
        databaseService.getFilteredAttrs(associatedBox);
    }
    stateObj["selectState"] = "singleSelected";
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}

/*
Handle update actions $Use them when a user updates an existing shape.
*/
function addUpdateShapeActionToState(shape) {
  if (shape.name() === "dimensionLine") {
    addUpdateDimensionLineActionToState(shape);
  }
  // else if (shape.name() === "linearLine") {
  //   addUpdateLinearLineActionToState(shape);
  // } else if (shape.name() === "polygonArea") {
  //   addUpdatePolygonAreaActionToState(shape);
  // } else if (shape.name() === "rectArea") {
  //   addUpdateRectAreaActionToState(shape);
  // } else if (shape.name() === "highlight") {
  //   addUpdateHighlightActionToState(shape);
  // } else if (shape.name() === "cloud") {
  //   addUpdateCloudActionToState(shape);
  // } else if (shape.name() === "calloutText") {
  //   addUpdateCalloutTextActionToState(shape);
  // } else if (shape.name() === "textBoxInput") {
  //   addUpdateTextBoxInputActionToState(shape);
  // }
}

function addUpdateDimensionLineActionToState(shape) {
  handleStateBranchOut();
  let state = [];
  const stateObj = {};
  if (shape) {
    stateObj["id"] = shape.id();
    stateObj["actionType"] = "update";
    const mainNodeAttrs = databaseService.getFilteredAttrs(shape);
    stateObj["mainNode"] = mainNodeAttrs;
    const associatedText = shape.getAttr("associatedText");
    if (associatedText) {
      stateObj["associatedText"] =
        databaseService.getFilteredAttrs(associatedText);
    }
    const anchors = shape.getAttr("anchors");
    if (anchors?.length > 0) {
      const copyAnchors = [];
      anchors.forEach((anchor) => {
        const anchorCopy = databaseService.getFilteredAttrs(anchor);
        copyAnchors.push(anchorCopy);
      });
      stateObj["anchors"] = copyAnchors;
    }
    // stateObj["selectState"] = "singleSelected"; // Probably not needed.
    state.push(stateObj);
  }
  stateList.push(state);
  step++;
}

/*
Handle undo actions
*/
function handleSingleUndo() {
  if (step === 1 && stateList[1] && stateList[1].length > 1) return;
  if (stateList[step]?.length === 0) return;
  const currentState = stateList[step];
  const currentStateItem = currentState[0];

  // Handle single delete
  if (currentStateItem.actionType === "singleDelete") {
    const result = createShape(currentStateItem);
    if (result === true) step--;
  }
  // Handle single create
  else if (currentStateItem.actionType === "create") {
    const result = deleteShape(currentStateItem);
    if (result === true) step--;
  }

  // adjust size and thickness of all shapes
  utils.adjustAnchorsAndShapesSize();
}

function handleSingleRedo() {
  // At the end of the state list
  if (step === stateList?.length - 1) return;
  // does next step exist?
  if (!stateList[step + 1]) return;
  const nextState = stateList[step + 1];
  const nextStateItem = nextState[0];
  if (!nextStateItem) return;
  // Handle single delete
  if (nextStateItem.actionType === "singleDelete") {
    const result = deleteShape(nextStateItem);
    if (result === true) step++;
  }
  // Handle single create
  else if (nextStateItem.actionType === "create") {
    const result = createShape(nextStateItem);
    if (result === true) step++;
  }

  // adjust size and thickness of all shapes
  utils.adjustAnchorsAndShapesSize();
}

function createShape(stateItem) {
  if (!stateItem) return;
  const { name } = stateItem["mainNode"];
  if (name === "dimensionLine") {
    return createDimensionLine(stateItem);
  } else if (name === "linearLine") {
    return createLinearLine(stateItem);
  } else if (name === "polygonArea") {
    return createPolygonArea(stateItem);
  } else if (name === "rectArea") {
    return createRectArea(stateItem);
  } else if (name === "highlight") {
    return createHighlight(stateItem);
  } else if (name === "cloud") {
    return createCloud(stateItem);
  } else if (name === "calloutText") {
    return createCalloutText(stateItem);
  } else if (name === "textBoxInput") {
    return createTextBoxInput(stateItem);
  }
}

function deleteShape(stateItem) {
  if (!stateItem) return;
  const { name } = stateItem["mainNode"];
  if (
    name === "dimensionLine" ||
    name === "linearLine" ||
    name === "polygonArea" ||
    name === "rectArea" ||
    name === "highlight" ||
    name === "cloud" ||
    name === "calloutText" ||
    name === "textBoxInput"
  ) {
    return deleteAnyShape(stateItem); // this function should be added to this file.
  }
}

/*
Handle create/delete single shape and add it to layer.
*/
function createDimensionLine(stateItem) {
  const { id, name } = stateItem["mainNode"];
  const nodeExists = globalState.drawLayer.findOne(`#${id}`);
  if (nodeExists) return;
  const mainNode = new Konva.Arrow({
    id: stateItem["id"],
    name,
    ...stateItem["mainNode"],
  });
  const assocaitedNode = new Konva.Text({
    ...stateItem["associatedText"],
  });
  mainNode.setAttr("associatedText", assocaitedNode);
  globalState.drawLayer.add(mainNode, assocaitedNode);
  const anchors = [];
  stateItem["anchors"].forEach((anchor) => {
    const anchorNode = new Konva.Rect({
      ...anchor,
    });
    anchors.push(anchorNode);
    globalState.drawLayer.add(anchorNode);
  });
  mainNode.setAttr("anchors", anchors);
  databaseService.pushShapeById(mainNode); // push to database
  if (
    stateItem["selectState"] &&
    stateItem["selectState"] === "singleSelected"
  ) {
    disableLastSelectedShape();
    selectShape(mainNode); // test
  }

  globalState.drawLayer.draw();
  return true;
}

function createLinearLine(stateItem) {
  const { id, name } = stateItem["mainNode"];
  const nodeExists = globalState.drawLayer.findOne(`#${id}`);
  if (nodeExists) return;
  const mainNode = new Konva.Line({
    id: stateItem["id"],
    name,
    ...stateItem["mainNode"],
  });
  const assocaitedNode = new Konva.Text({
    ...stateItem["associatedText"],
  });
  mainNode.setAttr("associatedText", assocaitedNode);
  globalState.drawLayer.add(mainNode, assocaitedNode);
  const anchors = [];
  stateItem["anchors"].forEach((anchor) => {
    const anchorNode = new Konva.Rect({
      ...anchor,
    });
    anchors.push(anchorNode);
    globalState.drawLayer.add(anchorNode);
  });
  mainNode.setAttr("anchors", anchors);
  databaseService.pushShapeById(mainNode); // push to database
  if (
    stateItem["selectState"] &&
    stateItem["selectState"] === "singleSelected"
  ) {
    disableLastSelectedShape();
    selectShape(mainNode); // test
  }
  globalState.drawLayer.draw();
  return true;
}

function createPolygonArea(stateItem) {
  const { id, name } = stateItem["mainNode"];
  const nodeExists = globalState.drawLayer.findOne(`#${id}`);
  if (nodeExists) return;
  const mainNode = new Konva.Line({
    id: stateItem["id"],
    name,
    ...stateItem["mainNode"],
  });
  const assocaitedNode = new Konva.Text({
    ...stateItem["associatedText"],
  });
  mainNode.setAttr("associatedText", assocaitedNode);
  globalState.drawLayer.add(mainNode, assocaitedNode);
  const anchors = [];
  stateItem["anchors"].forEach((anchor) => {
    const anchorNode = new Konva.Rect({
      ...anchor,
    });
    anchors.push(anchorNode);
    globalState.drawLayer.add(anchorNode);
  });
  mainNode.setAttr("anchors", anchors);
  databaseService.pushShapeById(mainNode); // push to database
  if (
    stateItem["selectState"] &&
    stateItem["selectState"] === "singleSelected"
  ) {
    disableLastSelectedShape();
    selectShape(mainNode); // test
  }
  globalState.drawLayer.draw();
  return true;
}

function createRectArea(stateItem) {
  const { id, name } = stateItem["mainNode"];
  const nodeExists = globalState.drawLayer.findOne(`#${id}`);
  if (nodeExists) return;
  const mainNode = new Konva.Line({
    id: stateItem["id"],
    name,
    ...stateItem["mainNode"],
  });
  const assocaitedNode = new Konva.Text({
    ...stateItem["associatedText"],
  });
  mainNode.setAttr("associatedText", assocaitedNode);
  globalState.drawLayer.add(mainNode, assocaitedNode);

  const anchors = [];
  stateItem["anchors"].forEach((anchor) => {
    const anchorNode = new Konva.Rect({
      ...anchor,
    });
    anchors.push(anchorNode);
    globalState.drawLayer.add(anchorNode);
  });
  mainNode.setAttr("anchors", anchors);

  databaseService.pushShapeById(mainNode); // push to database
  if (
    stateItem["selectState"] &&
    stateItem["selectState"] === "singleSelected"
  ) {
    disableLastSelectedShape();
    selectShape(mainNode); // test
  }
  globalState.drawLayer.draw();
  return true;
}

function createHighlight(stateItem) {
  const { id, name } = stateItem["mainNode"];
  const nodeExists = globalState.drawLayer.findOne(`#${id}`);
  if (nodeExists) return;
  const mainNode = new Konva.Rect({
    id: stateItem["id"],
    name,
    ...stateItem["mainNode"],
  });
  mainNode.dragBoundFunc(boundFuncForShapeMove);
  globalState.drawLayer.add(mainNode);
  databaseService.pushShapeById(mainNode); // push to database
  if (
    stateItem["selectState"] &&
    stateItem["selectState"] === "singleSelected"
  ) {
    disableLastSelectedShape();
    selectShape(mainNode); // test
  }
  globalState.drawLayer.draw();
  return true;
}

function createCloud(stateItem) {
  const { id, name } = stateItem["mainNode"];
  const { curvePoints } = stateItem;
  const nodeExists = globalState.drawLayer.findOne(`#${id}`);
  if (nodeExists) return;
  const mainNode = new Konva.Shape({
    id: stateItem["id"],
    name,
    ...stateItem["mainNode"],
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
  databaseService.pushShapeById(mainNode); // push to database
  if (
    stateItem["selectState"] &&
    stateItem["selectState"] === "singleSelected"
  ) {
    disableLastSelectedShape();
    selectShape(mainNode); // test
  }
  globalState.drawLayer.draw();
  return true;
}

function createCalloutText(stateItem) {
  const { id } = stateItem["mainNode"];
  const { calloutPoints } = stateItem;
  const nodeExists = globalState.drawLayer.findOne(`#${id}`);
  if (nodeExists) return;
  const mainNode = new Konva.Text({
    id: stateItem["id"],
    ...stateItem["mainNode"],
  });
  const associatedCallout = new Konva.Shape({
    ...stateItem["associatedCallout"],
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
  mainNode.setAttr("associatedCallout", associatedCallout);
  associatedCallout.setAttr("associatedText", mainNode);
  mainNode.setAttr("calloutPoints", calloutPoints);
  globalState.drawLayer.add(associatedCallout, mainNode);
  databaseService.pushShapeById(mainNode); // push to database
  if (
    stateItem["selectState"] &&
    stateItem["selectState"] === "singleSelected"
  ) {
    disableLastSelectedShape();
    selectShape(mainNode);
  }
  globalState.drawLayer.draw();
  return true;
}

function createTextBoxInput(stateItem) {
  const { id } = stateItem["mainNode"];
  const nodeExists = globalState.drawLayer.findOne(`#${id}`);
  if (nodeExists) return;

  const associatedBox = new Konva.Rect({
    ...stateItem["associatedBox"],
  });
  const mainNode = new Konva.Text({
    id: stateItem["id"],
    ...stateItem["mainNode"],
  });

  mainNode.dragBoundFunc(boundFuncForShapeMove);
  mainNode.setAttr("associatedBox", associatedBox);
  associatedBox.setAttr("associatedText", mainNode);
  globalState.drawLayer.add(associatedBox, mainNode);
  databaseService.pushShapeById(mainNode); // push to database
  if (
    stateItem["selectState"] &&
    stateItem["selectState"] === "singleSelected"
  ) {
    disableLastSelectedShape();
    selectShape(mainNode);
  }
  globalState.drawLayer.draw();
  return true;
}

// This can delete any shape of any type
function deleteAnyShape(stateItem) {
  const { id } = stateItem["mainNode"];
  const deletedNode = globalState.drawLayer.findOne(`#${id}`);
  if (!deletedNode) return;
  if (globalState.lastSelectedShape?.id() === deletedNode?.id()) {
    deselectAllShapes();
    globalState.lastSelectedShape = null;
  }
  deletedNode.destroy();
  // Get second level attributes
  const associatedText = deletedNode.getAttr("associatedText");
  if (associatedText) {
    associatedText.destroy();
  }
  const anchors = deletedNode.getAttr("anchors");
  if (anchors?.length > 0) {
    anchors.forEach((anchor) => {
      anchor.destroy();
    });
  }

  if (deletedNode.name() === "calloutText") {
    const associatedCallout = deletedNode.getAttr("associatedCallout");
    if (associatedCallout) {
      associatedCallout.destroy();
    }
  }

  if (deletedNode.name() === "textBoxInput") {
    const associatedBox = deletedNode.getAttr("associatedBox");
    if (associatedBox) {
      associatedBox.destroy();
    }
  }
  databaseService.deleteShapeById(deletedNode);

  // Redraw the layer to reflect the deletion
  globalState.drawLayer.draw();
  return true;
}

/*
If we have 2 states and we undo, then if we create a new node, all states after current step should get deleted
before adding the new state for newly created node
*/
function handleStateBranchOut() {
  if (step + 1 < stateList?.length) {
    stateList.length = step + 1;
  }
}

const undoRedoService = {
  fillStateFromLayer,
  handleSingleUndo,
  handleSingleRedo,
  addCreateShapeActionToState,
  addDeleteShapeActionToState,
  addUpdateShapeActionToState,
};

// Export the object
export default undoRedoService;
