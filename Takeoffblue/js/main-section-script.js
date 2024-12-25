import utils from "../js/utils.js";
import loadPageService from "../js/loadPage.js";
import undoRedoService from "../js/undoRedo.js";
import databaseService from "../js/databaseService.js";



const log = console.log;

// Global state
export const globalState = {
  stage: null,
  imageLayer: null,
  drawLayer: null,
  drawingScale: null,
  dpi: 72,
  imageScale: 2,
  mode: "select",
  lastSelectedShape: null,
  imageBounds: { top: 0, left: 0, right: 0, bottom: 0 },
  isEditing: false,
  shapeInEdit: null,
  activeShape: null,
  activeText: null,
  isDrawing: false,
  globalPoints: [],
  tempDashedLine: null,
  transformer: null,
  cutShape: null,
  copiedShape: null,
  selectionRect: null,
  selecting: false,
  selectionBox: null,
  selectedShapes: [],
  selectionBoxPosition: null,
  multiCopiedShapes: [],
  cutMultiShape: [],
};


const upload = document.getElementById("fileInput");
const selectBtn = document.getElementById("single-select-btn");
const multiSelectBtn = document.getElementById("multi-select-btn");
const dimensionLineBtn = document.getElementById("dimension-line-btn");
const highlightBtn = document.getElementById("highlight-btn");
const cloudShapeBtn = document.getElementById("cloud-btn");
const linearBtn = document.getElementById("linear-shape-btn");
const scaleSelect = document.getElementById("scaleSelect");
const calloutBtn = document.getElementById("callout-btn");
const textBoxBtn = document.getElementById("text-box-btn");
const zoomInBtn = document.getElementById("zoom-in-btn");
const zoomOutBtn = document.getElementById("zoom-out-btn");
const zoomHomeBtn = document.getElementById("zoom-home-btn");
const polygonAreaBtn = document.getElementById("area-shape-btn");
const rectAreaBtn = document.getElementById("area-rect-btn");

// const rectLinearBtn = document.getElementById("linear-rect-btn");
// const rectSurfaceBtn = document.getElementById("surfaceArea-rect-btn");
// const lineSurfaceBtn = document.getElementById("surfaceArea-shape-btn");
// const deleteBtn = document.getElementById('delete-btn');


const copyBtn = document.getElementById('rightSidebar-copy-btn');
const cutBtn = document.getElementById('cut-btn');
const pasteBtn = document.getElementById('paste-btn');

// const loadStateBtn = document.getElementById("loadStateBtn");
// const fillStateBtn = document.getElementById("fillStateBtn");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");
// const panBtn = document.getElementById("panBtn");


// let globalState.stage , imageLayer , drawLayer;

const containerWidth = document.getElementById('main-content').offsetWidth;
const containerHeight = document.getElementById('main-content').offsetHeight;


globalState.stage = new Konva.Stage({
    container: "container",
    width: containerWidth,
    height: containerHeight - 75,
    draggable: true,
});

globalState.imageLayer = new Konva.Layer();
globalState.drawLayer = new Konva.Layer();
globalState.stage.add(globalState.imageLayer);
globalState.stage.add(globalState.drawLayer);




// Function to handle "View" button click event
function showImageinStage(imageUrl){

    // Load the image into the imageLayer
    const imageObj = new Image();
    imageObj.src = imageUrl;

     // Clear any existing images from the globalState.stage
    globalState.imageLayer.destroyChildren(); // Remove all children from the imageLayer
    globalState.drawLayer.destroyChildren(); // Remove all children from the imageLayer
    globalState.stage.clear(); // Clear the globalState.stage itself if necessary
    
    imageObj.onload = function () {

        // Remove any existing images in imageLayer if necessary
        const scaleX = globalState.stage.width() / imageObj.width;
        const scaleY = globalState.stage.height() / imageObj.height;
        const scale = Math.min(scaleX, scaleY); // Choose the smaller scale factor

        // Apply the scale to the globalState.stage content
        globalState.stage.scale({ x: scale, y: scale });

        // Position the globalState.stage content (image) at the center
        const offsetX = (globalState.stage.width() - imageObj.width * scale) / 2;
        const offsetY = (globalState.stage.height() - imageObj.height * scale) / 2;
        globalState.stage.position({ x: offsetX, y: offsetY });

        // Adjust shadow size based on the image size
        const shadowBlur = imageObj.width / 100; // For example, blur is 1/100th of image width
        const shadowOffsetY = imageObj.height / 100; // Shadow offset is 1/100th of image height


        // Create a Konva image object and add it to the imageLayer
        const konvaImage = new Konva.Image({
            image: imageObj,
            x: 0,
            y: 0,
            width: imageObj.width,
            height: imageObj.height,
            opacity: 1,
            shadowColor: "rgba(0, 0, 0, 0.4)",
            shadowBlur: shadowBlur,
            shadowOffset: { x: 0, y: shadowOffsetY },
            shadowOpacity: 1,
            id: "drawingImage",
            shadowForStrokeEnabled: false,
        });

        globalState.imageLayer.add(konvaImage); // Add the image to the layer
        globalState.imageLayer.draw(); // Draw the layer to display the image
        globalState.imageBounds = utils.getImageBorders(konvaImage);
    };

}

function handleViewButtonClick() {
    document.querySelectorAll('.view-btn').forEach(viewButton => {
        viewButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the default action (form submission, etc.)

            // Get the image URL from the button's data attribute
            const imageUrl = e.target.getAttribute('data-img-url');
            const figure = e.target.closest('.card').querySelector('figure');
            const figureTitle = figure.getAttribute('title') || figure.textContent.trim();

            // Deactivate all other list items and the overview link
            document.querySelectorAll('.canvas-li').forEach(li => li.classList.remove('active'));
            document.getElementById('li-overview-link').classList.remove('active');

            // Check if the image is already in the list
            let existingListItem = document.querySelector(`.canvas-a[data-img-url="${imageUrl}"]`);

            if (!existingListItem) {
                // Create a new <li> with the image and close button
                createImageListItem(imageUrl, figureTitle);

                // Make the newly created list item active
                const ul = document.getElementById('navbar-items');
                const newListItem = ul.querySelector(`.canvas-a[data-img-url="${imageUrl}"]`).closest('.canvas-li');
                newListItem.classList.add('active');

            } else {
                // If the item already exists, make it active
                existingListItem.closest('.canvas-li').classList.add('active');
            }

            // Hide the imageSection and show the container
            document.getElementById('imageSection').style.display = 'none';
            document.getElementById('container').style.display = 'block';

        
            showImageinStage(imageUrl);
        });
    });
}


function createImageListItem(imageUrl, figureTitle) {
    const listItem = document.createElement('li');
    listItem.className = 'nav-item canvas-li';
    listItem.innerHTML = `
        <a href="#imageCanvas" class="nav-link text-dark text-truncate canvas-a" data-img-url="${imageUrl}" title="${figureTitle}">${figureTitle}</a>
        <button class="btn-close" type="button" aria-label="Close"></button>
    `;

    const ul = document.getElementById('navbar-items'); // Assuming there's a <ul> with id="navbar-items"
    ul.appendChild(listItem);

    // Add event listener to the close button
    listItem.querySelector('.btn-close').addEventListener('click', function() {
        ul.removeChild(listItem);
        document.getElementById('imageSection').style.display = 'block';
        document.getElementById('container').style.display = 'none';
    });

    // Add event listener to the <a> to show the image in the canvas when clicked
    listItem.querySelector('.canvas-a').addEventListener('click', function(e) {
        e.preventDefault();

        // Remove 'active' class from all other list items
        document.querySelectorAll('.canvas-li').forEach(li => li.classList.remove('active'));

        // Add 'active' class to the clicked list item
        listItem.classList.add('active');

        // Hide the imageSection and show the container
        document.getElementById('imageSection').style.display = 'none';
        document.getElementById('container').style.display = 'block';

        const imageUrl = this.getAttribute('data-img-url');
        showImageinStage(imageUrl);
    });
}

// Handle the overview-link click to show the imageSection and hide the container
document.getElementById('li-overview-link').addEventListener('click', function() {
    document.getElementById('imageSection').style.display = 'block';
    document.getElementById('container').style.display = 'none';

    // Remove 'active' class from all list items and add 'active' class to the overview link
    document.querySelectorAll('.canvas-li').forEach(li => li.classList.remove('active'));
    this.classList.add('active');
});


upload.addEventListener("change", (event) => {
    // Get the uploaded file from the file input element
    const file = event.target.files[0];
    if (file && !file.type) {
        alert("Failed to determine file type.");
    }
    // Check if the uploaded file type exists and if the type is a PDF
    if (file?.type && file.type !== "application/pdf") {
        alert("Please upload a PDF file."); // Alert the user if it's not a PDF
        return; // Exit the function if the file is not a PDF
    }


    // Create a FileReader to read the file's content
    const fileReader = new FileReader();

    // Define what happens when the FileReader successfully reads the file
    fileReader.onload = function () {
        // Convert the file content to a typed array for PDF.js
        const typedArray = new Uint8Array(this.result);

        // Load the PDF using PDF.js
        pdfjsLib.getDocument(typedArray).promise.then((pdf) => {

            const cardContainer = document.getElementById('cardContainer');
            
            // Loop through each page of the PDF
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                pdf.getPage(pageNum).then((page) => {
                // Set the viewport scale (1 means the original size)
                const viewport = page.getViewport({ scale: globalState.imageScale });

                // Create a canvas element to render the PDF page
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                context.imageSmoothingEnabled = false;

                // Set the canvas dimensions to match the PDF page's viewport
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Define the rendering context with the canvas and viewport
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                // Render the PDF page into the canvas
                page.render(renderContext).promise.then(() => {
                    // Create an Image object from the canvas content
                    const image = new Image();
                    image.src = canvas.toDataURL("image/png"); // Convert canvas to PNG image data URL

                    // Once the image is loaded, create a card for the page
                    image.onload = () => {
                        
                        const card = document.createElement('div');
                        card.className = 'card col-xl-5 col-lg-10 p-1 ps-4 pe-4 position-relative';

                        // Create the card content with the image and other elements
                        card.innerHTML = `
                            <form action="" method="get" class="position-absolute" style="left: 13px;">
                                <input type="checkbox" name="check_image" id="check_image" class="form-check-input checkbox position-absolute z-1">
                            </form>
                            <div class="images">
                                <img src="${image.src}" alt="Page ${pageNum}" width="100%" height="100%"> 
                            </div>
                            <figure title="Page ${pageNum}" class="text-truncate">
                                NEW CONSTRUCTION FLOOR PLAN ${pageNum}
                            </figure>
                            <button class="submit-btn view-btn text-white rounded" data-img-url="${image.src}">View</button>
                        `;
                        
                        // Append the card to the cardContainer
                        cardContainer.appendChild(card);

                        // Add event listener for the "View" button to handle image display
                        // Get the view button and attach the event handler function

                        // const viewButton = card.querySelector('.view-btn');
                        handleViewButtonClick(); // Invoke the function for each view button
                    };
                });

                });
            }

        });
    };

    // Read the file as an ArrayBuffer (needed for PDF.js)
    fileReader.readAsArrayBuffer(file);

});


handleViewButtonClick();

// function hexToRgba(hex, alpha) {
//     let r = parseInt(hex.slice(1, 3), 16);
//     let g = parseInt(hex.slice(3, 5), 16);
//     let b = parseInt(hex.slice(5, 7), 16);
//     return `rgba(${r}, ${g}, ${b}, ${alpha})`;
// }

// function getFillColor() {
//     const noFillCheckbox = document.getElementById('no-fill');
//     const fillColorInput1 = document.getElementById('fill-area-color').value;
//     const fillColorInput = hexToRgba(fillColorInput1, 0.5);

//     if (noFillCheckbox.checked) {
//         return noFillCheckbox.value; // "transparent"
//     } else {
//         return fillColorInput; // The selected color value
//     }
// }

// function strokeAreaRectColor(){
//     const strokeAreaColor = document.getElementById('stroke-area-color').value;
//     return strokeAreaColor;
// }


document.querySelectorAll('.prop-right-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Get the closest parent with class 'btn-group'
        const btnGroup = this.closest('.btn-group');

        if (btnGroup) {
            // Remove 'active' class from all 'group-prop-btn' inside other 'btn-group' containers
            document.querySelectorAll('.btn-group .group-prop-btn').forEach(groupBtn => groupBtn.classList.remove('active'));

            // Add 'active' class to the '.group-prop-btn' inside the same '.btn-group'
            const groupPropBtn = btnGroup.querySelector('.group-prop-btn');
            if (groupPropBtn) {
                groupPropBtn.classList.add('active');
            }
        }

        // Remove 'active' class from all '.prop-right-btn' inside the current 'btn-group'
        btnGroup.querySelectorAll('.prop-right-btn').forEach(btn => btn.classList.remove('active'));

        // Add 'active' class to the clicked button
        this.classList.add('active');
    });
});


// Handle with takeoff in right-sidebar using class names
// Select the button with class 'start-area-measuring' and add a click event listener
const AreaButtons = document.getElementsByClassName('start-area-measuring');
for (let i = 0; i < AreaButtons.length; i++) {
    AreaButtons[i].addEventListener('click', function() {
         // Select the button with ID 'draw-area-btn'
    const drawAreaBtn = document.getElementById('draw-area-btn');
    
    // Enable the button by removing the 'disabled' attribute
    drawAreaBtn.removeAttribute('disabled');
    
    // Change the SVG path fill color to white
    const svgPath = drawAreaBtn.querySelector('svg path');
    svgPath.setAttribute('fill', 'white'); // White color
    });
}


// Select the buttons with class 'start-linear-measuring' and add a click event listener
const linearButtons = document.getElementsByClassName('start-linear-measuring');
for (let i = 0; i < linearButtons.length; i++) {
    linearButtons[i].addEventListener('click', function() {
        const drawAreaGroupBtn = document.getElementById('draw-areaGroup-btn');
        drawAreaGroupBtn.style.setProperty('display', 'none', 'important');
        document.getElementById('draw-surfaceAreaGroup-btn').style.display = 'none';
        document.getElementById('draw-countGroup-btn').style.display = 'none';
        document.getElementById('draw-linearGroup-btn').style.display = 'flex';
    });
}

// Select the buttons with class 'start-count-measuring' and add a click event listener
const countButtons = document.getElementsByClassName('start-count-measuring');
for (let i = 0; i < countButtons.length; i++) {
    countButtons[i].addEventListener('click', function() {
        const drawAreaGroupBtn = document.getElementById('draw-areaGroup-btn');
        drawAreaGroupBtn.style.setProperty('display', 'none', 'important');
        document.getElementById('draw-linearGroup-btn').style.display = 'none';
        document.getElementById('draw-surfaceAreaGroup-btn').style.display = 'none';
        document.getElementById('draw-countGroup-btn').style.display = 'flex';
    });
}

// Select the buttons with class 'start-surface-measuring' and add a click event listener
const surfaceButtons = document.getElementsByClassName('start-surface-measuring');
for (let i = 0; i < surfaceButtons.length; i++) {
    surfaceButtons[i].addEventListener('click', function() {
        const drawAreaGroupBtn = document.getElementById('draw-areaGroup-btn');
        drawAreaGroupBtn.style.setProperty('display', 'none', 'important');
        document.getElementById('draw-linearGroup-btn').style.display = 'none';
        document.getElementById('draw-countGroup-btn').style.display = 'none';
        document.getElementById('draw-surfaceAreaGroup-btn').style.display = 'flex';
    });
}


// function updateButtonsState(isActive) {

//     const buttons = ['delete-btn', 'rightSidebar-copy-btn', 'cut-btn'];

//     buttons.forEach(buttonId => {
//         const button = document.getElementById(buttonId);
//         const svgPaths = button.querySelectorAll('svg path');

//         if (isActive) {
//             button.style.color = 'white'; // Set button background color
//             button.disabled = false; // Enable button
//             svgPaths.forEach(path => {
//                 path.setAttribute('fill', 'white'); // Set fill color for each path
//             });
//         } else {
//             button.style.color = '#888'; // Reset button background color
//             button.disabled = true; // Disable button
//             svgPaths.forEach(path => {
//                 path.setAttribute('fill', '#888'); // Set fill color for each path
//             });
//         }
//     });
// }

// // Function to update button states and styles for Takeoff measure
// function updateTakeoffButtonState(isActive) {
//     const buttons = ['draw-areaGroupCut-btn', 'merge-btn','rotate-btn','flip-horizontal-btn'
//         ,'flip-vertical-btn'];

//     buttons.forEach(buttonId => {
//         const button = document.getElementById(buttonId);
//         const svgPaths = button.querySelectorAll('svg path');
//         const svgG = button.querySelectorAll('svg g');


//         if (isActive) {
//             button.style.color = 'white'; // Set button background color
//             button.disabled = false; // Enable button
//             svgPaths.forEach(path => {
//                 path.setAttribute('fill', 'white'); // Set fill color for each path
//             });
            
//         } else {
//             button.style.color = '#888'; // Reset button background color
//             button.disabled = true; // Disable button
//             svgPaths.forEach(path => {
//                 path.setAttribute('fill', '#888'); // Set fill color for each path
//             });
//         }
//     });
// }


// Listen for single clicks to start drawing or add points
globalState.stage.on("click", (e) => {
    e.evt.preventDefault();
    const pos = utils.getRelativePointerPosition(globalState.stage);
    if (globalState.isEditing && globalState.shapeInEdit) {
        globalState.isEditing = false;
        globalState.shapeInEdit = null;
    }
    // Ensure the click is within the image bounds
    if (!utils.isWithinBounds(pos.x, pos.y)) {
        console.log("Click is outside image bounds. Drawing not allowed.");
        return;
    }

    // Handle all drawing modes
    handleDrawingModes(pos);
    // Handle select mode
    if (globalState.mode === "select") {
        const shape = e.target;
        handleSelectMode(shape);
    } else if (globalState.mode === "multiSelect") {
        if (!globalState.selecting) {

            startSelectionRect(pos);
        } else {
            finalizeSelectionRect();
        }
    }
});

globalState.stage.on("mousemove touchmove", (e) => {
e.evt.preventDefault();
if (!globalState.isDrawing && !globalState.selecting) {
    return;
}
if (!globalState.activeShape && !globalState.selectionRect) {
    return;
}
const pos = utils.getRelativePointerPosition(globalState.stage);


if (!utils.isWithinBounds(pos.x, pos.y)) {
    console.log("Click is outside image bounds. Drawing not allowed.");
    return;
}

handleUpdateDrawing(pos);
globalState.drawLayer.draw();
});

// Listen for double-click to finalize drawing
globalState.stage.on("dblclick dbltap", (e) => {
e.evt.preventDefault();
const pos = utils.getRelativePointerPosition(globalState.stage);
const shape = e.target;
const isEmptySpace = shape instanceof Konva.Image;

if (!utils.isWithinBounds(pos.x, pos.y)) {
    console.log(
    "Double-click is outside image bounds. Finalizing not allowed."
    );
    return;
}

if (!globalState.isDrawing && globalState.mode !== "select") {
    return;
}

if (globalState.isDrawing) {
    if (!utils.checkZeroShape(globalState.activeShape)) {
      // destroy the shape when it has a length or area of zero
      destroyZeroShape();
      return;
    }
}

  // Remove the last two points (four values) added by the previous click
  if (
    globalState.globalPoints?.length > 4 &&
    (globalState.mode === "linear" || globalState.mode === "polygonArea")
  ) {
    globalState.globalPoints.splice(-4);
  }

  if (globalState.mode === "dimension line") {
    // Add the second point on double-click to finalize the dimension line
    globalState.globalPoints.push(pos.x, pos.y);
    globalState.activeShape.points(globalState.globalPoints);
    globalState.activeShape.opacity(0.6);

    // Finalize the text position and content
    utils.syncLinearTextPosition(globalState.activeShape);

    finalizeLine();
    globalState.activeText = null;
  } else if (globalState.mode === "linear") {
    globalState.globalPoints.push(pos.x, pos.y);
    utils.syncLinearTextPosition(globalState.activeShape);

    finalizeLine();
    globalState.activeText = null;
  } else if (globalState.mode === "polygonArea") {
    globalState.globalPoints.push(pos.x, pos.y);
    finalizePolygonArea();
  } else if (globalState.mode === "rectArea") {
    finalizeRectangle();
  } else if (globalState.mode === "highlight") {
    finalizeGeneralShape();
  } else if (globalState.mode === "cloud") {
    finalizeGeneralShape();
  } else if (globalState.mode === "callout") {
    finalizeCalloutShape();
  } else if (globalState.mode === "textBox") {
    finalizeTextBoxShape();
  } else if (globalState.mode === "select") {
    if (shape && !isEmptySpace) {
      if (shape.name() === "calloutText" || shape.name() === "textBoxInput") {
        globalState.isEditing = true;
        globalState.shapeInEdit = shape;
        utils.createTextareaOverShape("update");
      }
    } else if (shape && isEmptySpace) {
      return;
    }
  }
});

// Handles drawing actions based on the current mode, initializing or adding points to shapes


// Handles drawing actions based on the current globalState.mode, initializing or adding points to shapes
function handleDrawingModes(pos) {
  if (globalState.mode === "dimension line") {
    if (!globalState.isDrawing) {
      startDimensionLineDrawing(pos);
    }
    // No action on single clicks after the first point
  } else if (globalState.mode === "linear") {
    if (!globalState.isDrawing) {
      startLinearLineDrawing(pos);
    } else {
      addPointsToLinearShape(pos);
    }
  } else if (globalState.mode === "polygonArea") {
    if (!globalState.isDrawing) {
      startPolygonAreaDrawing(pos);
    } else {
      addPointsToLinearShape(pos);
    }
  } else if (globalState.mode === "rectArea") {
    if (!globalState.isDrawing) {
      startRectangleDrawing(pos);
    }
  } else if (globalState.mode === "highlight") {
    if (!globalState.isDrawing) {
      startHighlightDrawing(pos);
    }
  } else if (globalState.mode === "cloud") {
    if (!globalState.isDrawing) {
      startCloudShapeDrawing(pos);
    }
  } else if (globalState.mode === "callout") {
    if (!globalState.isDrawing) {
      startCallOutDrawing(pos);
    }
  } else if (globalState.mode === "textBox") {
    if (!globalState.isDrawing) {
      startTextBoxDrawing(pos);
    }
  }
}

function handleUpdateDrawing(pos) {
  if (globalState.mode === "dimension line") {
    updateDimensionLineDrawing(pos);
  } else if (globalState.mode === "linear") {
    updateLinearLineDrawing(pos);
  } else if (globalState.mode === "polygonArea") {
    updatePolygonAreaDrawing(pos);
  } else if (globalState.mode === "rectArea") {
    updateRectangleDrawing(pos);
  } else if (globalState.mode === "highlight") {
    updateHighlightDrawing(pos);
  } else if (globalState.mode === "cloud") {
    updateCloudShape(pos);
  } else if (globalState.mode === "callout") {
    updateCalloutShape(globalState.activeShape, pos);
  } else if (globalState.mode === "textBox") {
    updateTextBoxDrawing(pos);
  } else if (globalState.mode === "multiSelect") {
    updateSelectionRect(pos);
  } else {
    log("Updating for this shape is not handled.");
  }
}

// Handles selection logic for shapes, enabling dragging, adjusting opacity, and managing anchors
function handleSelectMode(shape) {
  const isEmptySpace = shape instanceof Konva.Image;
  const isAnchor = shape.name() === "anchor";
  if (
    shape &&
    !isEmptySpace &&
    shape !== globalState.lastSelectedShape &&
    !isAnchor
  ) {
    disableLastSelectedShape();
    selectShape(shape);
  } else if (shape && isEmptySpace) {
    disableLastSelectedShape();
    disableMultiSelection();
  }
}
/* (For click to start drawing) */
function startDimensionLineDrawing(pos) {
  globalState.isDrawing = true;
  globalState.globalPoints = [pos.x, pos.y];

  globalState.activeShape = new Konva.Arrow({
    stroke: "blue",
    fill: "blue",
    strokeWidth: utils.getDynamicStrokeWidth(undefined, undefined, 20),
    points: globalState.globalPoints,
    pointerLength: utils.getDynamicStrokeWidth(undefined, undefined, 30),
    pointerWidth: utils.getDynamicStrokeWidth(undefined, undefined, 30),
    pointerAtBeginning: true,
    lineJoin: "miter",
    name: "dimensionLine",
    shadowForStrokeEnabled: false,
  });
  globalState.activeText = new Konva.Text({
    x: pos.x,
    y: pos.y + 10,
    text: "0",
    fontSize: utils.getDynamicStrokeWidth(undefined, 20, 60),
    fill: "blue",
    name: "dimensionLineLabel",
    listening: false,
    shadowForStrokeEnabled: false,
  });
  globalState.activeShape.setAttr("associatedText", globalState.activeText);
  globalState.drawLayer.add(globalState.activeShape, globalState.activeText);
}

function startLinearLineDrawing(pos) {
  globalState.isDrawing = true;
  globalState.globalPoints = [pos.x, pos.y];

  globalState.activeShape = new Konva.Line({
    stroke: "blue",
    strokeWidth: utils.getDynamicStrokeWidth(undefined, undefined, 20),
    points: globalState.globalPoints,
    name: "linearLine",
    shadowForStrokeEnabled: false,
  });

  globalState.activeText = new Konva.Text({
    x: pos.x,
    y: pos.y + 10,
    text: "0",
    fontSize: utils.getDynamicStrokeWidth(undefined, 20, 60),
    fill: "blue",
    name: "linearLineLabel",
    listening: false,
    shadowForStrokeEnabled: false,
  });

  globalState.activeShape.setAttr("associatedText", globalState.activeText);

  globalState.drawLayer.add(globalState.activeShape, globalState.activeText);
}

function startPolygonAreaDrawing(pos) {
  globalState.isDrawing = true;
  globalState.globalPoints = [pos.x, pos.y];

  globalState.activeShape = new Konva.Line({
    stroke: "blue",
    strokeWidth: utils.getDynamicStrokeWidth(undefined, undefined, 15),
    points: globalState.globalPoints,
    name: "polygonArea",
    shadowForStrokeEnabled: false,
  });

  globalState.activeText = new Konva.Text({
    x: pos.x,
    y: pos.y + 10,
    text: "0",
    fontSize: utils.getDynamicStrokeWidth(undefined, 20, 60),
    fontFamily: "Arial",
    fill: "blue",
    name: "areaLabel",
    listening: false,
    shadowForStrokeEnabled: false,
  });

  globalState.activeShape.setAttr("associatedText", globalState.activeText);

  globalState.drawLayer.add(globalState.activeShape, globalState.activeText);
}

function startRectangleDrawing(pos) {
  globalState.isDrawing = true;
  globalState.globalPoints = [pos.x, pos.y]; // Store the first click point

  globalState.activeShape = new Konva.Line({
    stroke: "orange",
    strokeWidth: utils.getDynamicStrokeWidth(undefined, undefined, 15),
    points: globalState.globalPoints,
    closed: true, // Closed shape for rectangle
    name: "rectArea",
    shadowForStrokeEnabled: false,
  });

  globalState.activeText = new Konva.Text({
    x: pos.x,
    y: pos.y + 10,
    text: "0",
    fontSize: utils.getDynamicStrokeWidth(undefined, 20, 60),
    fontFamily: "Arial",
    fill: "orange",
    name: "rectAreaLabel",
    listening: false,
    align: "center",
    verticalAlign: "middle",
    shadowForStrokeEnabled: false,
  });

  globalState.activeShape.setAttr("associatedText", globalState.activeText);

  globalState.drawLayer.add(globalState.activeShape, globalState.activeText);
}

function startHighlightDrawing(pos) {
  globalState.isDrawing = true;
  globalState.globalPoints = [pos.x, pos.y];

  globalState.activeShape = new Konva.Rect({
    x: pos.x,
    y: pos.y,
    width: 0,
    height: 0,
    stroke: "yellow",
    strokeWidth: 1,
    fill: "rgba(255, 255, 0, 0.25)",
    name: "highlight",
    strokeScaleEnabled: false,
    shadowForStrokeEnabled: false,
  });

  globalState.drawLayer.add(globalState.activeShape);

  globalState.globalPoints = [pos.x, pos.y];
}

function startCloudShapeDrawing(pos) {
  globalState.isDrawing = true;
  globalState.globalPoints = [pos.x, pos.y];

  const baseWidth = pos.x - globalState.globalPoints[0];
  const baseHeight = pos.y - globalState.globalPoints[1];
  const scallopWidth = utils.getDynamicStrokeWidth(0.15, 30, 150);
  const scallopHeight = utils.getDynamicStrokeWidth(0.15, 30, 150);
  const curvePoints = utils.calculateCloudPoints(
    baseWidth,
    baseHeight,
    scallopWidth,
    scallopHeight
  );

  globalState.activeShape = new Konva.Shape({
    x: pos.x,
    y: pos.y,
    width: Math.abs(baseWidth),
    height: Math.abs(baseHeight),
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
    stroke: "rgba(255, 0,0,0.8)",
    strokeWidth: 8,
    name: "cloud",
    shadowForStrokeEnabled: false,
  });
  globalState.drawLayer.add(globalState.activeShape);
  globalState.drawLayer.draw();
}

function startCallOutDrawing(pos) {
  globalState.isDrawing = true;
  globalState.globalPoints = [pos.x, pos.y];

  const callout = new Konva.Shape({
    x: pos.x,
    y: pos.y,
    width: 0,
    height: 0,
    sceneFunc: function (context, shape) {
      context.beginPath();
      context.moveTo(0, 0);
      context.closePath();
      context.fillStrokeShape(shape);
    },
    fill: "rgba(255, 234, 0, 0.75)",
    stroke: "rgba(253, 218, 13, 0.75)",
    shadowForStrokeEnabled: false,
    name: "callout",
  });
  globalState.activeShape = callout;
  // Create editable text (initially hidden)
  const text = new Konva.Text({
    x: pos.x,
    y: pos.y,
    text: "",
    fontSize: 22,
    fill: "black",
    width: 0,
    height: 0,
    name: "calloutText",
    shadowForStrokeEnabled: false,
    visible: false, // Initially invisible
    padding: 10,
  });
  globalState.activeText = text;

  text.setAttr("associatedCallout", callout);
  callout.setAttr("associatedText", text);
  globalState.drawLayer.add(callout, text);

  globalState.drawLayer.draw();
}

function startTextBoxDrawing(pos) {
  globalState.isDrawing = true;
  globalState.globalPoints = [pos.x, pos.y];

  const textBoxRect = new Konva.Rect({
    x: pos.x,
    y: pos.y,
    width: 0,
    height: 0,
    fill: "rgba(255, 245, 238,0.80)",
    stroke: "rgb(115, 147, 179)",
    strokeWidth: utils.getDynamicStrokeWidth(undefined, undefined, 15),
    name: "textBoxRect",
    strokeScaleEnabled: true,
    shadowForStrokeEnabled: false,
  });

  globalState.activeShape = textBoxRect;
  // Create editable text (initially hidden)
  const textBoxInput = new Konva.Text({
    x: pos.x,
    y: pos.y,
    text: "",
    fontSize: 22,
    fill: "black",
    width: 0,
    height: 0,
    name: "textBoxInput",
    shadowForStrokeEnabled: false,
    visible: false, // Initially invisible
    padding: 10,
  });
  globalState.activeText = textBoxInput;

  textBoxInput.setAttr("associatedBox", textBoxRect);
  textBoxRect.setAttr("associatedText", textBoxInput);

  globalState.drawLayer.add(textBoxRect, textBoxInput);

  globalState.drawLayer.draw();
}

function startSelectionRect(pos) {
  globalState.selecting = true;
  globalState.globalPoints = [pos.x, pos.y];

  globalState.selectionRect = new Konva.Rect({
    x: pos.x,
    y: pos.y,
    width: 0,
    height: 0,
    fill: "rgba(0,0,255,0.5)",
    visible: false,
    // disable events to not interrupt with events
    listening: false,
  });

  globalState.drawLayer.add(globalState.selectionRect);
}

/* (For mousemove while drawing) */
function updateDimensionLineDrawing(pos) {
  if (!globalState.isDrawing) return;
  globalState.activeShape.points(
    globalState.globalPoints.concat([pos.x, pos.y])
  );

  // Update text position for line based shapes
  let textValue = null;

  if (globalState.mode === "dimension line") {
    textValue = utils.calculateLength(globalState.activeShape.points());
  }
  const midX = (globalState.globalPoints[0] + pos.x) / 2;
  const midY = (globalState.globalPoints[1] + pos.y) / 2;
  globalState.activeText.position({ x: midX, y: midY + 10 });
  globalState.activeText.text(textValue);
}

function updateLinearLineDrawing(pos) {
  if (!globalState.isDrawing) return;
  globalState.activeShape.points(
    globalState.globalPoints.concat([pos.x, pos.y])
  );

  let textValue = null;
  textValue = utils.calculateLength(globalState.activeShape.points());
  const midX = (globalState.globalPoints[0] + pos.x) / 2;
  const midY = (globalState.globalPoints[1] + pos.y) / 2;
  globalState.activeText.position({ x: midX, y: midY + 10 });
  globalState.activeText.text(textValue);
}

function updatePolygonAreaDrawing(pos) {
  if (!globalState.isDrawing) return;
  globalState.activeShape.points(
    globalState.globalPoints.concat([pos.x, pos.y])
  );

  // Update text position for line based shapes
  let textValue = null;
  textValue = utils.calculatePolygonArea(globalState.activeShape.points());

  const midX = (globalState.globalPoints[0] + pos.x) / 2;
  const midY = (globalState.globalPoints[1] + pos.y) / 2;
  globalState.activeText.position({ x: midX, y: midY + 10 });
  globalState.activeText.text(textValue);
  createDashedLine(pos);
}

function updateRectangleDrawing(pos) {
  if (!globalState.isDrawing) return;

  const startX = globalState.globalPoints[0];
  const startY = globalState.globalPoints[1];

  // Define the four corners of the rectangle
  const updatedPoints = [
    startX,
    startY, // top-left corner
    pos.x,
    startY, // top-right corner
    pos.x,
    pos.y, // bottom-right corner
    startX,
    pos.y, // bottom-left corner
  ];

  globalState.activeShape.points(updatedPoints);

  utils.syncRectTextPosition(globalState.activeShape);

  globalState.drawLayer.draw(); // Efficient redraw
}

function updateHighlightDrawing(pos) {
  const width = pos.x - globalState.globalPoints[0];
  const height = pos.y - globalState.globalPoints[1];

  globalState.activeShape.width(Math.abs(width));
  globalState.activeShape.height(Math.abs(height));

  if (width < 0) globalState.activeShape.x(pos.x);
  if (height < 0) globalState.activeShape.y(pos.y);

  globalState.drawLayer.draw();
}

function updateCloudShape(pos) {
  if (!globalState.isDrawing) return;

  let baseWidth = pos.x - globalState.globalPoints[0];
  let baseHeight = pos.y - globalState.globalPoints[1];

  const scallopWidth = utils.getDynamicStrokeWidth(0.15, 20, 100);
  const scallopHeight = utils.getDynamicStrokeWidth(0.15, 20, 100);

  // Recalculate the curve points using absolute width/height
  const newCurvePoints = utils.calculateCloudPoints(
    Math.abs(baseWidth),
    Math.abs(baseHeight),
    scallopWidth,
    scallopHeight
  );
  globalState.activeShape.setAttr("curvePoints", newCurvePoints);
  // Set width and height to positive values
  globalState.activeShape.width(Math.abs(baseWidth));
  globalState.activeShape.height(Math.abs(baseHeight));

  // Adjust position if the baseWidth or baseHeight is negative
  if (baseWidth < 0) globalState.activeShape.x(pos.x);
  if (baseHeight < 0) globalState.activeShape.y(pos.y);

  // Update the sceneFunc for correct drawing
  globalState.activeShape.sceneFunc(function (context, shape) {
    context.beginPath();
    context.moveTo(0, 0);

    for (let i = 0; i < newCurvePoints?.length; i += 6) {
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

  globalState.drawLayer.draw();
}

function updateCalloutShape(callout, pos) {
  // Calculate width and height based on the current mouse position (pos) and the starting point (globalState.globalPoints)
  let width = pos.x - globalState.globalPoints[0];
  let height = pos.y - globalState.globalPoints[1];

  // Adjust the position if the width or height is negative to ensure the top-left corner follows the mouse
  const newPosX = width < 0 ? pos.x : globalState.globalPoints[0];
  const newPosY = height < 0 ? pos.y : globalState.globalPoints[1];

  // Update the callout's position so that the top-left corner stays with the mouse
  callout.position({ x: newPosX, y: newPosY });

  // Adjust the size of the callout
  globalState.activeText.width(Math.abs(width));
  globalState.activeText.height(Math.abs(height) * 0.7);
  globalState.activeText.position({ x: newPosX, y: newPosY });
  globalState.activeText.visible(true);

  // Generate points for the callout (no flipping)
  const calloutPoints = utils.generatePointsForCallout(
    Math.abs(width),
    Math.abs(height)
  );
  globalState.activeText.setAttr("calloutPoints", calloutPoints);
  // Update the shape rendering function
  callout.sceneFunc(function (context, shape) {
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
  });

  // Set the width and height using the absolute values to prevent flipping
  callout.width(Math.abs(width));
  callout.height(Math.abs(height));

  globalState.drawLayer.draw();
}

function updateTextBoxDrawing(pos) {
  // implementation is identical to the highlight function but we need it for readability.
  const width = pos.x - globalState.globalPoints[0];
  const height = pos.y - globalState.globalPoints[1];

  // takes care of textBox rect
  globalState.activeShape.width(Math.abs(width));
  globalState.activeShape.height(Math.abs(height));

  // takes care of textBox input
  globalState.activeText.width(Math.abs(width));
  globalState.activeText.height(Math.abs(height));

  // takes care of textBox rect
  if (width < 0) globalState.activeShape.x(pos.x);
  if (height < 0) globalState.activeShape.y(pos.y);

  // takes care of textBox input
  if (width < 0) globalState.activeText.x(pos.x);
  if (height < 0) globalState.activeText.y(pos.y);

  globalState.activeText.visible(true);

  globalState.drawLayer.draw();
}

function updateSelectionRect(pos) {
  const width = pos.x - globalState.globalPoints[0];
  const height = pos.y - globalState.globalPoints[1];

  globalState.selectionRect.width(Math.abs(width));
  globalState.selectionRect.height(Math.abs(height));

  globalState.selectionRect.visible(true);

  // If width or height is negative, adjust the position of the globalState.selectionRect
  if (width < 0) globalState.selectionRect.x(pos.x);
  if (height < 0) globalState.selectionRect.y(pos.y);

  globalState.drawLayer.draw();
}

/* (Additional drawing functions) */
function addPointsToLinearShape(pos) {
  globalState.globalPoints.push(pos.x, pos.y);
  globalState.activeShape.points(globalState.globalPoints);
  globalState.drawLayer.draw();
}

// For mousemove while drawing
function createDashedLine(pos) {
  if (globalState.activeShape.points()?.length > 4) {
    // Ensure there are more than 2 points (4 coordinates)
    // Create or update the dashed line from the first point to the current position
    if (!globalState.tempDashedLine) {
      globalState.tempDashedLine = new Konva.Line({
        stroke: "blue",
        strokeWidth: utils.getDynamicStrokeWidth(undefined, undefined, 20),
        dash: [10, 5], // Dashed pattern
        points: [
          globalState.globalPoints[0],
          globalState.globalPoints[1],
          pos.x,
          pos.y,
        ], // First point to current mouse position
        name: "tempDashedLine",
        shadowForStrokeEnabled: false,
      });
      globalState.drawLayer.add(globalState.tempDashedLine);
    } else {
      // Update the points of the dashed line to match the new position
      globalState.tempDashedLine.points([
        globalState.globalPoints[0],
        globalState.globalPoints[1],
        pos.x,
        pos.y,
      ]);
    }
  }
}

function generateAnchorsForLinearShape(shape) {
  const anchors = [];
  const points = shape.points();
  for (let i = 0; i < points?.length; i += 2) {
    const pointX = points[i];
    const pointY = points[i + 1];
    let anchorSize = utils.getDynamicStrokeWidth(undefined, 2.5, 60);

    // Create an anchor for each vertex
    const anchor = new Konva.Rect({
      x: pointX - anchorSize / 2,
      y: pointY - anchorSize / 2,
      width: anchorSize,
      height: anchorSize,
      fill: "#FFFFFF",
      stroke: "rgb(0, 161, 255)",
      strokeWidth: utils.getDynamicStrokeWidth(undefined, 0.3, 5),
      draggable: true,
      visible: false, // Initially hidden
      name: "anchor",
      shadowForStrokeEnabled: false,
    });
    anchor.dragBoundFunc(boundFuncForShapeMove);

    globalState.drawLayer.add(anchor);
    anchors.push(anchor);
  }
  shape.setAttr("anchors", anchors);
}

/* (For dblclick to end drawing) */
function finalizeLine() {
  globalState.isDrawing = false;
  generateAnchorsForLinearShape(globalState.activeShape);
  globalState.drawLayer.draw();
  const name = globalState.activeShape.name();
  if (name === "dimensionLine" || name === "linearLine") {
    const pushedNode = databaseService.pushShapeById(globalState.activeShape); // push to database
    globalState.activeShape.id(pushedNode.id); // set id from Database
  }
  undoRedoService.addCreateShapeActionToState(globalState.activeShape);
  globalState.activeShape = null;
  globalState.activeText = null;
  globalState.globalPoints = [];
}

function finalizePolygonArea() {
  // Remove the temporary dashed line
  if (globalState.tempDashedLine) {
    globalState.tempDashedLine.destroy();
    globalState.tempDashedLine = null;
  }
  // Add the last point to close the shape
  globalState.globalPoints.push(
    globalState.globalPoints[0],
    globalState.globalPoints[1]
  );
  globalState.activeShape.points(globalState.globalPoints);
  globalState.activeShape.closed(true);
  globalState.activeShape.stroke("blue");
  globalState.activeShape.fill("rgba(0,0,255, 0.4)");
  // Calculate the polygonArea and update the text
  utils.syncLinearTextPosition(globalState.activeShape);
  // Generate anchors for the polygonArea shape
  generateAnchorsForLinearShape(globalState.activeShape);

  const pushedNode = databaseService.pushShapeById(globalState.activeShape); // push to database
  globalState.activeShape.id(pushedNode.id); // set id from Database

  undoRedoService.addCreateShapeActionToState(globalState.activeShape);
  // Finish the drawing process
  globalState.isDrawing = false;
  globalState.activeShape = null;
  globalState.activeText = null;
  globalState.globalPoints = [];
  globalState.drawLayer.draw();
}

function finalizeRectangle() {
  if (!globalState.isDrawing) return;
  globalState.activeShape.closed(true); // Close the rectangle shape
  globalState.activeShape.stroke("orange");
  globalState.activeShape.fill("rgba(255, 165, 0, 0.4)"); // Optional fill color
  utils.syncRectTextPosition(globalState.activeShape);
  // Generate anchors for manipulation if needed
  generateAnchorsForLinearShape(globalState.activeShape);

  // Save shape to the database and set its ID
  const pushedNode = databaseService.pushShapeById(globalState.activeShape);
  globalState.activeShape.id(pushedNode.id);

  // Add to undo/redo history
  undoRedoService.addCreateShapeActionToState(globalState.activeShape);

  // Finalize and reset states
  globalState.isDrawing = false;
  globalState.activeShape = null;
  globalState.activeText = null;
  globalState.globalPoints = [];
  globalState.drawLayer.draw(); // Final redraw
}

function finalizeGeneralShape() {
  globalState.isDrawing = false;
  if (globalState.activeShape.name() === "highlight") {
    // drag bound
    globalState.activeShape.dragBoundFunc(boundFuncForShapeMove);
    // push to database
    const pushedNode = databaseService.pushShapeById(globalState.activeShape);
    globalState.activeShape.id(pushedNode.id);
  }
  if (globalState.activeShape.name().split(" ")[0] === "cloud") {
    // drag bound
    globalState.activeShape.dragBoundFunc(boundFuncForShapeMove);
    const pushedNode = databaseService.pushShapeById(globalState.activeShape);
    globalState.activeShape.id(pushedNode.id);
  }
  undoRedoService.addCreateShapeActionToState(globalState.activeShape);
  globalState.activeShape = null;
  globalState.activeText = null;
  globalState.globalPoints = [];
  globalState.drawLayer.draw();
}

function finalizeCalloutShape() {
  globalState.isEditing = true;
  // drag bound
  globalState.activeText.dragBoundFunc(boundFuncForShapeMove);
  globalState.shapeInEdit = globalState.activeText;
  utils.createTextareaOverShape();
  globalState.isDrawing = false;
  globalState.activeShape = null;
  globalState.activeText = null;
  globalState.globalPoints = [];
  changeMode("select", "special");
  globalState.drawLayer.draw();
}

function finalizeTextBoxShape() {
  // implementation is identical to the highlight function but we need it for readability. for now!
  globalState.isEditing = true;
  // drag bound
  globalState.activeText.dragBoundFunc(boundFuncForShapeMove);
  globalState.shapeInEdit = globalState.activeText;
  utils.createTextareaOverShape();
  globalState.isDrawing = false;

  globalState.activeShape = null;
  globalState.activeText = null;
  globalState.globalPoints = [];
  changeMode("select", "special");
  globalState.drawLayer.draw();
}

function finalizeSelectionRect() {
  if (!globalState.selectionRect.visible()) {
    return;
  }
  globalState.selectionRect.visible(false);
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
  const box = globalState.selectionRect.getClientRect();
  globalState.selectedShapes = filterdShapes.filter((shape) =>
    Konva.Util.haveIntersection(box, shape.getClientRect())
  );
  createSelectionBox();

  if (globalState.selectedShapes?.length === 1) {
    const tempoShape = globalState.selectedShapes[0];
    // This is added because changeMode("select"); sets globalState.selectedShapes to null
    changeMode("select");
    selectShape(tempoShape);
  }

  // Clear drawing state
  if (globalState.selectionRect) globalState.selectionRect.destroy();
  // Here I am passing the flag special to avoid deselecting the multi select on fist creation of it.
  if (globalState.selectionBox) {
    changeMode("select", "special");
    selectShape(globalState.selectionBox);
  }
  globalState.globalPoints = [];

  globalState.selecting = false;
  globalState.selectionRect = null;
  globalState.drawLayer.draw();
}

/* (For custom anchors control) */
function toggleAnchorsVisibility(shape, status) {
  const anchors = shape.getAttr("anchors");
  if (shape && anchors) {
    anchors.forEach((anchor, index) => {
      anchor.visible(status);
    });
  }
}

function toggleAnchorDragEvents(shape, action) {
  const anchors = shape.getAttr("anchors");
  if (!shape || !anchors) return;

  if (action) {
    anchors.forEach((anchor, index) => {
      anchor.on("dragmove", () => {
        const points = shape.points();

        const shapePos = shape.position();

        let anchorX = anchor.x();
        let anchorY = anchor.y();
        let adjustedX = anchorX;
        let adjustedY = anchorY;

        // // Check if the anchor's position is within the image bounds
        // if (anchorX < globalState.imageBounds.left) {
        //   adjustedX = globalState.imageBounds.left;
        // } else if (anchorX > globalState.imageBounds.right) {
        //   adjustedX = globalState.imageBounds.right;
        // }

        // if (anchorY < globalState.imageBounds.top) {
        //   adjustedY = globalState.imageBounds.top;
        // } else if (anchorY > globalState.imageBounds.bottom) {
        //   adjustedY = globalState.imageBounds.bottom;
        // }

        // Update the anchor's position with the adjusted values
        // anchor.position({ x: adjustedX, y: adjustedY });

        const anchorOffsetX = anchor.width() / 2;
        const anchorOffsetY = anchor.height() / 2;
        // Update the respective point on the line based on the anchor's new position
        points[index * 2] = adjustedX - shapePos.x + anchorOffsetX;
        points[index * 2 + 1] = adjustedY - shapePos.y + anchorOffsetY;

        shape.points(points);

        // update the text label
        utils.syncLinearTextPosition(shape);
        globalState.drawLayer.draw();
      });
      anchor.on("dragend", () => {
        const name = shape.name();
        if (name === "dimensionLine") databaseService.updateShapeById(shape);
        if (name === "linearLine") databaseService.updateShapeById(shape);
        if (name === "polygonArea") databaseService.updateShapeById(shape);
      });
    });
  } else {
    anchors.forEach((anchor) => {
      anchor.off("dragmove");
      anchor.off("dragstart");
      anchor.off("dragend");
    });
  }
}

function toggleRectAnchorDragEvents(rectShape, action) {
  const anchors = rectShape.getAttr("anchors");
  if (!rectShape || !anchors) return;

  if (action) {
    anchors.forEach((anchor, index) => {
      anchor.on("dragmove", () => {
        const points = rectShape.points();
        const shapePos = rectShape.position();

        let anchorX = anchor.x();
        let anchorY = anchor.y();
        let adjustedX = anchorX;
        let adjustedY = anchorY;

        const anchorOffsetX = anchor.width() / 2;
        const anchorOffsetY = anchor.height() / 2;

        // Adjust points based on the dragged corner
        if (index === 0) {
          // Top-left corner (adjust top and left sides)
          points[0] = adjustedX - shapePos.x + anchorOffsetX; // x1 (top-left)
          points[1] = adjustedY - shapePos.y + anchorOffsetY; // y1 (top-left)

          points[6] = adjustedX - shapePos.x + anchorOffsetX; // x4 (bottom-left)
          points[7] = points[7]; // y4 remains unchanged (bottom-left)

          points[2] = points[2]; // x2 remains unchanged (top-right)
          points[3] = adjustedY - shapePos.y + anchorOffsetY; // y2 (top-right)
        } else if (index === 1) {
          // Top-right corner (adjust top and right sides)
          points[2] = adjustedX - shapePos.x + anchorOffsetX; // x2 (top-right)
          points[3] = adjustedY - shapePos.y + anchorOffsetY; // y2 (top-right)

          points[4] = adjustedX - shapePos.x + anchorOffsetX; // x3 (bottom-right)
          points[5] = points[5]; // y3 remains unchanged (bottom-right)

          points[0] = points[0]; // x1 remains unchanged (top-left)
          points[1] = adjustedY - shapePos.y + anchorOffsetY; // y1 (top-left)
        } else if (index === 2) {
          // Bottom-right corner (adjust right and bottom sides)
          points[4] = adjustedX - shapePos.x + anchorOffsetX; // x3 (bottom-right)
          points[5] = adjustedY - shapePos.y + anchorOffsetY; // y3 (bottom-right)

          points[2] = adjustedX - shapePos.x + anchorOffsetX; // x2 (top-right)
          points[3] = points[3]; // y2 remains unchanged (top-right)

          points[6] = points[6]; // x4 remains unchanged (bottom-left)
          points[7] = adjustedY - shapePos.y + anchorOffsetY; // y4 (bottom-left)
        } else if (index === 3) {
          // Bottom-left corner (adjust left and bottom sides)
          points[6] = adjustedX - shapePos.x + anchorOffsetX; // x4 (bottom-left)
          points[7] = adjustedY - shapePos.y + anchorOffsetY; // y4 (bottom-left)

          points[0] = adjustedX - shapePos.x + anchorOffsetX; // x1 (top-left)
          points[1] = points[1]; // y1 remains unchanged (top-left)

          points[4] = points[4]; // x3 remains unchanged (bottom-right)
          points[5] = adjustedY - shapePos.y + anchorOffsetY; // y3 (bottom-right)
        }

        rectShape.points(points);

        utils.updateAnchorPositions(rectShape, anchors, index);

        // Sync any related text (e.g., area or dimensions)
        utils.syncRectTextPosition(rectShape);
        globalState.drawLayer.draw(); // Redraw the layer with updated points
      });

      anchor.on("dragend", () => {
        const name = rectShape.name();
        if (name === "rectangleLine")
          databaseService.updateShapeById(rectShape); // Save updates to the database
      });
    });
  } else {
    anchors.forEach((anchor) => {
      anchor.off("dragmove");
      anchor.off("dragend");
    });
  }
}

function changeMode(newMode, type = "standard") {
  if (globalState.isDrawing && globalState.activeShape) {
    // Remove the temporary shape from the layer if not finalized
    // Hide and destroy anchors if they exist
    const anchors = globalState.activeShape.getAttr("anchors");
    if (anchors) {
      anchors.forEach((anchor) => anchor.destroy());
    }
    globalState.activeShape.destroy();
    const text = globalState.activeShape.getAttr("associatedText");
    if (text) text.destroy();

    if (globalState.tempDashedLine) globalState.tempDashedLine.destroy();
  }

  if (globalState.lastSelectedShape) {
    toggleAnchorsVisibility(globalState.lastSelectedShape, false);
    toggleAnchorDragEvents(globalState.lastSelectedShape, false);
    deselectAllShapes();
  }
  // Reset drawing state
  globalState.isDrawing = false;
  globalState.globalPoints = [];
  globalState.activeShape = null;
  globalState.activeText = null;
  globalState.tempDashedLine = null;

  // Disable dragging for the last selected shape when switching modes
  if (type === "standard") {
    disableLastSelectedShape();
  }
  if (type === "standard") {
    disableMultiSelection();
  }
  if (newMode === "select") {
    globalState.stage.container().style.cursor = "default";
  }
  globalState.drawLayer.draw();
  globalState.mode = newMode; // Change the globalState.mode
}

function destroyZeroShape() {
  if (globalState.isDrawing && globalState.activeShape) {
    // Remove the temporary shape from the layer if not finalized
    // Hide and destroy anchors if they exist
    const anchors = globalState.activeShape.getAttr("anchors");
    if (anchors) {
      anchors.forEach((anchor) => anchor.destroy());
    }
    const text = globalState.activeShape.getAttr("associatedText");
    if (text) {
      text.destroy();
    }
    globalState.activeShape.destroy();
  }

  // Reset drawing state
  globalState.isDrawing = false;
  globalState.globalPoints = [];
  globalState.activeShape = null;
  globalState.activeText = null;

  globalState.drawLayer.draw();
}

function disableLastSelectedShape() {
  if (globalState.lastSelectedShape) {
    toggleAnchorsVisibility(globalState.lastSelectedShape, false);
    toggleAnchorDragEvents(globalState.lastSelectedShape, false);
    deselectAllShapes();
    globalState.lastSelectedShape.draggable(false);
    globalState.lastSelectedShape.off("dragmove");
    globalState.lastSelectedShape.off("dragstart");
    globalState.lastSelectedShape.off("dragend");
    globalState.lastSelectedShape.off("transform");
    globalState.lastSelectedShape.off("transformend");

    globalState.lastSelectedShape.name() === "dimensionLine"
      ? globalState.lastSelectedShape.opacity(0.6)
      : globalState.lastSelectedShape.opacity(1);
    globalState.lastSelectedShape = null;
  }
  globalState.drawLayer.draw();
}

function disableMultiSelection() {
  if (globalState.selectionBox) {
    globalState.selectionBox.off("dragmove");
    globalState.selectionBox.destroy();
  }
  if (globalState.selectionRect) globalState.selectionRect.destroy();
  globalState.selectedShapes = [];
  globalState.selectionRect = null;
  globalState.selectionBox = null;
  globalState.selectionBoxPosition = null;
  globalState.selecting = false;

  globalState.drawLayer.draw();
}

function selectShape(shape) {
  const name = shape.name();
  if (name === "dimensionLine") shape.opacity(1);
  shape.draggable(true);
  globalState.lastSelectedShape = shape;
  if (name === "dimensionLine" || name === "linearLine") {
    handleSelectDragArrowAndLine(shape);
    utils.resizeAndPositionAnchors(shape);
    toggleAnchorsVisibility(shape, true);
    toggleAnchorDragEvents(shape, true);
  } else if (name === "polygonArea") {
    handleSelectDragPolygonArea(shape);
    utils.resizeAndPositionAnchors(shape);
    toggleAnchorsVisibility(shape, true);
    toggleAnchorDragEvents(shape, true);
  } else if (name === "rectArea") {
    handleSelectDragRectangle(shape);
    utils.resizeAndPositionAnchors(shape);
    toggleAnchorsVisibility(shape, true);
    toggleRectAnchorDragEvents(shape, true);
  } else if (name === "highlight") {
    handleSelectDragHighlight(shape);
  } else if (name.split(" ")[0] === "cloud") {
    handleSelectDragCloud(shape);
  } else if (name === "calloutText") {
    handleSelectDragCallout(shape);
  } else if (name === "textBoxInput") {
    handleSelectDragTextBox(shape);
  } else if (name === "selectionBox") {
    handleSelectDragSelectionBox();
  } else {
    log("This shape is not taken care of yet.");
  }

  globalState.drawLayer.draw();
}

function createSelectionBox() {
  const selectionBoxValues = utils.calculateBoundingBox(
    globalState.selectedShapes
  );
  if (selectionBoxValues && globalState.selectedShapes?.length > 1) {
    globalState.selectionBox = new Konva.Rect({
      x: selectionBoxValues.leftMost,
      y: selectionBoxValues.topMost,
      width: Math.abs(
        selectionBoxValues.leftMost - selectionBoxValues.rightMost
      ),
      height: Math.abs(
        selectionBoxValues.topMost - selectionBoxValues.bottomMost
      ),
      stroke: "rgb(0, 150, 255)",
      fill: "rgba(0, 150, 255, 0)",
      strokeWidth: utils.getDynamicStrokeWidth(undefined, 3, 30),
      dash: [30, 10],
      name: "selectionBox",
    });
    globalState.selectionBox.dragBoundFunc(boundFuncForShapeMove);
    globalState.selectionBoxPosition = JSON.parse(
      JSON.stringify(globalState.selectionBox.position())
    );
    globalState.drawLayer.add(globalState.selectionBox);
  }
  globalState.drawLayer.draw();
}

/* (For select and drag) */
function handleSelectDragArrowAndLine(line) {
  line.on("dragmove", (e) => {
    const lineX = line.x();
    const lineY = line.y();
    const points = line.points();
    let needsAdjustment = false;
    let xAdjustment = 0;
    let yAdjustment = 0;

    // Check each point of the line against the bounds
    for (let i = 0; i < points?.length; i += 2) {
      let absoluteX = lineX + points[i];
      let absoluteY = lineY + points[i + 1];

      // Check X bounds
      if (absoluteX < globalState.imageBounds.left) {
        xAdjustment = Math.max(
          xAdjustment,
          globalState.imageBounds.left - absoluteX
        );
        needsAdjustment = true;
      } else if (absoluteX > globalState.imageBounds.right) {
        xAdjustment = Math.min(
          xAdjustment,
          globalState.imageBounds.right - absoluteX
        );
        needsAdjustment = true;
      }

      // Check Y bounds
      if (absoluteY < globalState.imageBounds.top) {
        yAdjustment = Math.max(
          yAdjustment,
          globalState.imageBounds.top - absoluteY
        );
        needsAdjustment = true;
      } else if (absoluteY > globalState.imageBounds.bottom) {
        yAdjustment = Math.min(
          yAdjustment,
          globalState.imageBounds.bottom - absoluteY
        );
        needsAdjustment = true;
      }
    }

    // If adjustment is needed, update the line's position
    if (needsAdjustment) {
      line.x(lineX + xAdjustment);
      line.y(lineY + yAdjustment);
      e.cancelBubble = true;
    }

    // Retrieve the associated text directly from the line
    const textShape = line.getAttr("associatedText");

    // Update text position
    if (textShape) {
      const midX = (points[0] + points[2]) / 2;
      const midY = (points[1] + points[3]) / 2;
      textShape.position({ x: midX + line.x(), y: midY + line.y() + 10 });
    }

    globalState.drawLayer.draw();
  });

  // Here we are hiding anchors while and selected shape is being dragged (Abdullah)
  line.on("dragstart", () => {
    toggleAnchorsVisibility(line, false);
  });

  line.on("dragend", () => {
    utils.resizeAndPositionAnchors(line);
    const name = line.name();
    if (name === "dimensionLine") databaseService.updateShapeById(line);
    if (name === "linearLine") databaseService.updateShapeById(line);
    toggleAnchorsVisibility(line, true);
  });
}

function handleSelectDragPolygonArea(areaShape) {
  areaShape.on("dragmove", (e) => {
    // 1. Check each point of the polygonArea against the bounds
    // 2. If adjustment is needed, update the polygonArea's position
    checkBoundLinearShape(areaShape, e);

    // 3. Move the anchors along with the shape
    utils.resizeAndPositionAnchors(areaShape);

    // 5. Retrieve the associated text directly from the polygonArea shape
    // 6. Update the text position (center of the polygonArea) and its content
    utils.syncLinearTextPosition(areaShape);

    globalState.drawLayer.draw();
  });

  // Hide anchors while the polygonArea is being dragged
  areaShape.on("dragstart", () => {
    toggleAnchorsVisibility(areaShape, false);
  });

  // Show anchors again after dragging ends
  areaShape.on("dragend", () => {
    toggleAnchorsVisibility(areaShape, true);
    databaseService.updateShapeById(areaShape);
  });
}

function handleSelectDragRectangle(rect) {
  rect.on("dragstart", () => {
    toggleAnchorsVisibility(rect, false);
  });
  rect.on("dragmove", (e) => {
    checkBoundLinearShape(rect, e);

    utils.resizeAndPositionAnchors(rect);
    utils.syncRectTextPosition(rect);
  });

  rect.on("dragend", () => {
    // databaseService.updateShapeById(rect); // review
    // should update undo/redo state too.
  });

  rect.on("dragend", () => {
    toggleAnchorsVisibility(rect, true);
  });

  globalState.drawLayer.draw();
}

function checkBoundLinearShape(shape, e) {
  const shapeX = shape.x();
  const shapeY = shape.y();
  const points = shape.points();
  let needsAdjustment = false;
  let xAdjustment = 0;
  let yAdjustment = 0;
  // 1. Check each point of the polygonArea against the bounds
  for (let i = 0; i < points?.length; i += 2) {
    let absoluteX = shapeX + points[i];
    let absoluteY = shapeY + points[i + 1];

    // Check X bounds
    if (absoluteX < globalState.imageBounds.left) {
      xAdjustment = Math.max(
        xAdjustment,
        globalState.imageBounds.left - absoluteX
      );
      needsAdjustment = true;
    } else if (absoluteX > globalState.imageBounds.right) {
      xAdjustment = Math.min(
        xAdjustment,
        globalState.imageBounds.right - absoluteX
      );
      needsAdjustment = true;
    }

    // Check Y bounds
    if (absoluteY < globalState.imageBounds.top) {
      yAdjustment = Math.max(
        yAdjustment,
        globalState.imageBounds.top - absoluteY
      );
      needsAdjustment = true;
    } else if (absoluteY > globalState.imageBounds.bottom) {
      yAdjustment = Math.min(
        yAdjustment,
        globalState.imageBounds.bottom - absoluteY
      );
      needsAdjustment = true;
    }
  }

  // 2. If adjustment is needed, update the polygonArea's position
  if (needsAdjustment) {
    shape.x(shapeX + xAdjustment);
    shape.y(shapeY + yAdjustment);
    e.cancelBubble = true;
  }
}

function handleSelectDragHighlight(shape) {
  if (!globalState.transformer) {
    globalState.transformer = new Konva.Transformer({
      nodes: [shape],
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
      rotateEnabled: false,
      borderEnabled: false,
      keepRatio: false,
      anchorDragBoundFunc: boundFuncForRectAnchors,
    });
    globalState.transformer.ignoreStroke(true);
    globalState.drawLayer.add(globalState.transformer);
    globalState.transformer.forceUpdate();
    globalState.drawLayer.draw();
  } else {
    globalState.transformer.nodes([shape]);
    globalState.transformer.moveToTop();
    globalState.transformer.forceUpdate();
    globalState.drawLayer.draw();
  }
  shape.on("dragend", () => {
    databaseService.updateShapeById(shape);
  });
  shape.on("transformend", () => {
    databaseService.updateShapeById(shape);
  });
}

function handleSelectDragCloud(shape) {
  if (!globalState.transformer) {
    globalState.transformer = new Konva.Transformer({
      nodes: [shape],
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
      rotateEnabled: false,
      borderEnabled: false,
      keepRatio: false,
      anchorDragBoundFunc: boundFuncForRectAnchors,
    });
    globalState.transformer.ignoreStroke(true);
    globalState.drawLayer.add(globalState.transformer);
    globalState.transformer.forceUpdate();
    globalState.drawLayer.draw();
  } else {
    globalState.transformer.nodes([shape]);
    globalState.transformer.moveToTop();
    globalState.transformer.forceUpdate();
    globalState.drawLayer.draw();
  }
  shape.on("dragend", () => {
    databaseService.updateShapeById(shape);
  });
  shape.on("transformend", () => {
    databaseService.updateShapeById(shape);
  });
}

function handleSelectDragCallout(shape) {
  if (!globalState.transformer) {
    globalState.transformer = new Konva.Transformer({
      nodes: [shape],
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
      rotateEnabled: false,
      borderEnabled: false,
      keepRatio: false,
      anchorDragBoundFunc: boundFuncForRectAnchors,
    });
    globalState.transformer.ignoreStroke(true);
    globalState.drawLayer.add(globalState.transformer);
    globalState.transformer.forceUpdate();
    globalState.drawLayer.draw();
  } else {
    globalState.transformer.nodes([shape]);
    globalState.transformer.moveToTop();
    globalState.transformer.forceUpdate();
    globalState.drawLayer.draw();
  }

  // handle callout scale

  shape.on("transform", () => {
    const associatedCallout = shape.getAttr("associatedCallout");
    associatedCallout.scale(shape.scale());
    associatedCallout.position(shape.position());
  });

  // handle callout drag
  shape.on("dragmove", () => {
    const associatedCallout = shape.getAttr("associatedCallout");
    associatedCallout.position(shape.position());
  });

  shape.on("dragend", () => {
    databaseService.updateShapeById(shape);
  });
  shape.on("transformend", () => {
    databaseService.updateShapeById(shape);
  });

  globalState.drawLayer.draw();
}

function handleSelectDragTextBox(shape) {
  if (!globalState.transformer) {
    globalState.transformer = new Konva.Transformer({
      nodes: [shape],
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
      rotateEnabled: false,
      // borderEnabled: false,
      keepRatio: false,
      anchorDragBoundFunc: boundFuncForRectAnchors,
    });
    globalState.transformer.ignoreStroke(true);
    globalState.transformer.borderEnabled(true);
    globalState.drawLayer.add(globalState.transformer);
    globalState.transformer.forceUpdate();
    globalState.drawLayer.draw();
  } else {
    globalState.transformer.nodes([shape]);
    globalState.transformer.moveToTop();
    globalState.transformer.forceUpdate();
    globalState.drawLayer.draw();
  }

  // handle callout scale

  shape.on("transform", () => {
    const associatedBox = shape.getAttr("associatedBox");
    associatedBox.scale(shape.scale());
    associatedBox.position(shape.position());
  });

  // handle callout drag
  shape.on("dragmove", () => {
    const associatedBox = shape.getAttr("associatedBox");
    associatedBox.position(shape.position());
  });

  shape.on("dragend", () => {
    databaseService.updateShapeById(shape);
  });
  shape.on("transformend", () => {
    databaseService.updateShapeById(shape);
  });

  globalState.drawLayer.draw();
}

function handleSelectDragSelectionBox() {
  // Set the dragmove event to sync the rectangle's text position during dragging
  globalState.selectionBox.on("dragmove", () => {
    const posChange = {
      x: globalState.selectionBox.x() - globalState.selectionBoxPosition.x,
      y: globalState.selectionBox.y() - globalState.selectionBoxPosition.y,
    };
    globalState.selectedShapes.forEach((selectedshape) => {
      const newPosition = {
        x: selectedshape.x() + posChange.x,
        y: selectedshape.y() + posChange.y,
      };
      if (
        selectedshape.name() === "dimensionLine" ||
        selectedshape.name() === "linearLine" ||
        selectedshape.name() === "polygonArea"
      ) {
        selectedshape.position(newPosition);
        utils.syncLinearTextPosition(selectedshape);
        utils.resizeAndPositionAnchors(selectedshape);
      } else if (selectedshape.name() === "rectArea") {
        selectedshape.position(newPosition);
        utils.syncRectTextPosition(selectedshape);
      } else if (selectedshape.name() === "calloutText") {
        selectedshape.position(newPosition);
        const associatedCallout = selectedshape.getAttr("associatedCallout");
        if (associatedCallout) {
          associatedCallout.position(newPosition);
        }
      } else if (selectedshape.name() === "textBoxInput") {
        selectedshape.position(newPosition);
        const associatedBox = selectedshape.getAttr("associatedBox");
        if (associatedBox) {
          associatedBox.position(newPosition);
        }
      } else if (selectedshape.name() === "cloud") {
        selectedshape.position(newPosition);
      } else if (selectedshape.name() === "highlight") {
        selectedshape.position(newPosition);
      }
    });

    globalState.selectionBoxPosition = JSON.parse(
      JSON.stringify(globalState.selectionBox.position())
    );
  });
  globalState.selectionBox.on("dragend", () => {
    globalState.selectedShapes.forEach((shape) => {
      databaseService.updateShapeById(shape);
    });
  });
  globalState.drawLayer.draw();
}

// boundFunc For Rect
function boundFuncForRectAnchors(oldAbsPos, newAbsPos, event) {
  // Get the current bounds of the image
  const bounds = globalState.imageBounds;

  // Convert the absolute position to local coordinates, considering stage transformations
  const transform = globalState.stage.getAbsoluteTransform().copy().invert();
  const localNewPos = transform.point(newAbsPos);

  // Constrain the position in the local coordinate system
  let newX = localNewPos.x;
  let newY = localNewPos.y;

  // Ensure the anchor stays within the image bounds
  if (newX < bounds.left) {
    newX = bounds.left;
  } else if (newX > bounds.right) {
    newX = bounds.right;
  }

  if (newY < bounds.top) {
    newY = bounds.top;
  } else if (newY > bounds.bottom) {
    newY = bounds.bottom;
  }

  // Convert the constrained local position back to absolute coordinates
  const constrainedAbsPos = globalState.stage
    .getAbsoluteTransform()
    .point({ x: newX, y: newY });

  // Return the constrained absolute position
  return constrainedAbsPos;
}

// dragBoundFunc for Text (constrained within bounds)
function boundFuncForShapeMove(pos) {
  const bounds = globalState.imageBounds; // Assume globalState.imageBounds is defined
  const shape = this; // The current shape being dragged (use `this` to access it)

  // Convert the absolute position to local coordinates
  const transform = globalState.stage.getAbsoluteTransform().copy().invert();
  const localPos = transform.point(pos);

  let newX = localPos.x;
  let newY = localPos.y;
  let associatedCallout = null;
  let calloutHeight = null;
  const isCallout = shape.name() === "calloutText";
  if (isCallout) {
    associatedCallout = shape.getAttr("associatedCallout");
    calloutHeight = associatedCallout.height() * shape.scaleY();
  }

  // Get the width and height of the shape
  const shapeWidth = shape.width() * shape.scaleX(); // Account for scaling
  const shapeHeight = !isCallout
    ? shape.height() * shape.scaleY()
    : calloutHeight; // Account for scaling

  // Constrain within horizontal bounds
  if (newX < bounds.left) {
    newX = bounds.left;
  } else if (newX + shapeWidth > bounds.right) {
    newX = bounds.right - shapeWidth; // Ensure the right edge stays within bounds
  }

  // Constrain within vertical bounds
  if (newY < bounds.top) {
    newY = bounds.top;
  } else if (newY + shapeHeight > bounds.bottom) {
    newY = bounds.bottom - shapeHeight; // Ensure the bottom edge stays within bounds
  }

  // Convert the constrained local position back to absolute coordinates
  const constrainedAbsPos = globalState.stage.getAbsoluteTransform().point({
    x: newX,
    y: newY,
  });

  return constrainedAbsPos;
}

function deselectAllShapes() {
  if (globalState.transformer) {
    globalState.transformer.nodes([]);
    globalState.transformer.forceUpdate();
  }

  globalState.drawLayer.draw();
}

// Cut tool function: remove the node but keep a reference to it
function cutShapeTool() {
  if (globalState.cutShape) return;
  if (globalState.mode === "multiSelect") return; // temporary
  if (globalState.mode === "select" && globalState.selectionBox) return; // temporary
  if (globalState.mode !== "select") return;
  if (globalState.lastSelectedShape) {
    // Clone the shape and store it in a global variable
    globalState.cutShape = globalState.lastSelectedShape.clone();
    cleanCloneEvents(globalState.cutShape);
    // test start

    // test end
    // Clone associated elements based on shape type
    if (
      globalState.cutShape.name() === "dimensionLine" ||
      globalState.cutShape.name() === "linearLine" ||
      globalState.cutShape.name() === "polygonArea" ||
      globalState.cutShape.name() === "rectArea"
    ) {
      // Clone associated text
      const associatedText =
        globalState.lastSelectedShape.getAttr("associatedText");
      if (associatedText) {
        globalState.cutShape.setAttr("associatedText", associatedText.clone());
        associatedText.destroy();
      }

      // Clone associated anchors
      const associatedAnchors =
        globalState.lastSelectedShape.getAttr("anchors");
      if (associatedAnchors) {
        const anchors = [];
        associatedAnchors.forEach((anchor) => {
          anchors.push(anchor.clone());
          anchor.destroy();
        });
        globalState.cutShape.setAttr("anchors", anchors);
      }
    } else if (globalState.cutShape.name() === "calloutText") {
      // Clone associated callout
      const associatedCallout =
        globalState.lastSelectedShape.getAttr("associatedCallout");
      if (associatedCallout) {
        globalState.cutShape.setAttr(
          "associatedCallout",
          associatedCallout.clone()
        );
        associatedCallout.destroy();
      }
    } else if (globalState.cutShape.name() === "textBoxInput") {
      // Clone associated box
      const associatedBox =
        globalState.lastSelectedShape.getAttr("associatedBox");
      if (associatedBox) {
        globalState.cutShape.setAttr("associatedBox", associatedBox.clone());
        associatedBox.destroy();
      }
    }

    if (globalState.transformer?.nodes()?.length > 0) {
      globalState.transformer.nodes([]);
      globalState.transformer.forceUpdate();
    }
    // delete from database
    databaseService.deleteShapeById(globalState.lastSelectedShape);
    // Finally, remove the shape from the layer
    globalState.lastSelectedShape.destroy();
    // Clear copy
    globalState.copiedShape = null;

    globalState.drawLayer.draw();
  }
  globalState.drawLayer.draw();
}

// Copy single shape tool
function copyShapeTool() {
  if (globalState.copiedShape) return;
  if (globalState.mode === "multiSelect") return; // temporary
  if (globalState.mode === "select" && globalState.selectionBox) return; // temporary
  if (globalState.mode !== "select" && globalState.mode !== "multiSelect")
    return;
  if (globalState.lastSelectedShape) {
    // Clone the shape and store it in a global variable
    globalState.copiedShape = globalState.lastSelectedShape.clone();
    cleanCloneEvents(globalState.copiedShape);

    // Clone associated elements based on shape type
    if (
      globalState.copiedShape.name() === "dimensionLine" ||
      globalState.copiedShape.name() === "linearLine" ||
      globalState.copiedShape.name() === "polygonArea" ||
      globalState.copiedShape.name() === "rectArea"
    ) {
      // Clone associated text
      const associatedText =
        globalState.lastSelectedShape.getAttr("associatedText");
      if (associatedText) {
        globalState.copiedShape.setAttr(
          "associatedText",
          associatedText.clone()
        );
      }

      // Clone associated anchors
      const associatedAnchors =
        globalState.lastSelectedShape.getAttr("anchors");
      if (associatedAnchors) {
        const anchors = associatedAnchors.map((anchor) => anchor.clone());
        globalState.copiedShape.setAttr("anchors", anchors);
      }
    } else if (globalState.copiedShape.name() === "calloutText") {
      // Clone associated callout
      const associatedCallout =
        globalState.lastSelectedShape.getAttr("associatedCallout");
      if (associatedCallout) {
        globalState.copiedShape.setAttr(
          "associatedCallout",
          associatedCallout.clone()
        );
      }
    } else if (globalState.copiedShape.name() === "textBoxInput") {
      // Clone associated box
      const associatedBox =
        globalState.lastSelectedShape.getAttr("associatedBox");
      if (associatedBox) {
        globalState.copiedShape.setAttr("associatedBox", associatedBox.clone());
      }
    }

    // clear cut
    globalState.cutShape = null;
  }
  globalState.drawLayer.draw();
}

// Paste single shape tool for cut tool
function pasteCutShapeTool() {
  disableLastSelectedShape();
  if (!globalState.cutShape) return;
  const shapeToPaste = globalState.cutShape;
  const newPosition = utils.getNewPastePosition(shapeToPaste);
  if (!newPosition) return;
  // Update the position of the shape to the new coordinates
  shapeToPaste.position({ x: newPosition.x, y: newPosition.y });
  globalState.drawLayer.add(shapeToPaste);

  // Handle pasting associated elements
  if (
    shapeToPaste.name() === "dimensionLine" ||
    shapeToPaste.name() === "linearLine" ||
    shapeToPaste.name() === "polygonArea" ||
    shapeToPaste.name() === "rectArea"
  ) {
    const associatedText = shapeToPaste.getAttr("associatedText");
    if (associatedText) globalState.drawLayer.add(associatedText);
    utils.syncLinearTextPosition(shapeToPaste);
  } else if (shapeToPaste.name() === "calloutText") {
    const associatedCallout = shapeToPaste.getAttr("associatedCallout");
    if (associatedCallout) {
      globalState.drawLayer.add(associatedCallout);
      associatedCallout.position({ x: newPosition.x, y: newPosition.y });
      associatedCallout.moveDown();
    }
  } else if (shapeToPaste.name() === "textBoxInput") {
    const associatedBox = shapeToPaste.getAttr("associatedBox");
    if (associatedBox) {
      globalState.drawLayer.add(associatedBox);
      associatedBox.position({ x: newPosition.x, y: newPosition.y });
    }
  }

  // Handle pasting anchors
  if (
    shapeToPaste.name() === "dimensionLine" ||
    shapeToPaste.name() === "linearLine" ||
    shapeToPaste.name() === "polygonArea" ||
    shapeToPaste.name() === "rectArea"
  ) {
    const aassociatedAnchors = shapeToPaste.getAttr("anchors");
    if (aassociatedAnchors?.length > 0) {
      aassociatedAnchors.forEach((anchor) => {
        globalState.drawLayer.add(anchor);
      });
    }
  }

  if (
    shapeToPaste.name() === "calloutText" ||
    shapeToPaste.name() === "textBoxInput"
  ) {
    shapeToPaste.moveUp();
  }
  // push database
  const pushedShape = databaseService.pushShapeById(shapeToPaste);
  shapeToPaste.id(pushedShape.id);
  // Deselect and Clear the references after pasting
  selectShape(shapeToPaste);
  globalState.cutShape = null;
  globalState.copiedShape = null;
  globalState.drawLayer.draw();
}

// Paste single shape tool for copy tool
function pasteCopyShapeTool() {
  disableLastSelectedShape();
  if (!globalState.copiedShape) return;
  const shapeToPaste = globalState.copiedShape;

  const newPosition = utils.getNewPastePosition(shapeToPaste);

  if (!newPosition) return;

  // Update position of shape to new coordinates
  shapeToPaste.position({ x: newPosition.x, y: newPosition.y });
  globalState.drawLayer.add(shapeToPaste);

  // Handle pasting associated elements
  if (
    shapeToPaste.name() === "dimensionLine" ||
    shapeToPaste.name() === "linearLine" ||
    shapeToPaste.name() === "polygonArea" ||
    shapeToPaste.name() === "rectArea"
  ) {
    const associatedText = shapeToPaste.getAttr("associatedText");
    if (associatedText) globalState.drawLayer.add(associatedText);
    utils.syncLinearTextPosition(shapeToPaste);
  } else if (shapeToPaste.name() === "calloutText") {
    const associatedCallout = shapeToPaste.getAttr("associatedCallout");
    if (associatedCallout) {
      globalState.drawLayer.add(associatedCallout);
      associatedCallout.position({ x: newPosition.x, y: newPosition.y });
      associatedCallout.moveDown();
    }
  } else if (shapeToPaste.name() === "textBoxInput") {
    const associatedBox = shapeToPaste.getAttr("associatedBox");
    if (associatedBox) {
      globalState.drawLayer.add(associatedBox);
      associatedBox.position({ x: newPosition.x, y: newPosition.y });
    }
  }

  // Handle pasting anchors
  if (
    shapeToPaste.name() === "dimensionLine" ||
    shapeToPaste.name() === "linearLine" ||
    shapeToPaste.name() === "polygonArea" ||
    shapeToPaste.name() === "rectArea"
  ) {
    const aassociatedAnchors = shapeToPaste.getAttr("anchors");
    if (aassociatedAnchors?.length > 0) {
      aassociatedAnchors.forEach((anchor) => {
        globalState.drawLayer.add(anchor);
      });
    }
  }

  if (
    shapeToPaste.name() === "calloutText" ||
    shapeToPaste.name() === "textBoxInput"
  ) {
    shapeToPaste.moveUp();
  }

  // push database
  const pushedShape = databaseService.pushShapeById(shapeToPaste);
  shapeToPaste.id(pushedShape.id);
  // Deselect and Clear the references after pasting
  selectShape(shapeToPaste);
  globalState.copiedShape = null;
  globalState.drawLayer.draw();
}

// clean events of shape after copying it
function cleanCloneEvents(shape) {
  shape.off("dragmove");
  shape.off("dragstart");
  shape.off("dragend");
  shape.off("transform");
  shape.off("transformend");
}

/* Multi Selection copy cut past tools */
function copyMultiShapeTool() {
  if (globalState.selectedShapes?.length < 2) return;
  if (globalState.multiCopiedShapes?.length > 1) return;
  if (globalState.mode !== "select") return;

  for (let i = 0; i < globalState.selectedShapes?.length; i++) {
    const shape = globalState.selectedShapes[i];
    // Clone the shape and store it in a global variable
    globalState.multiCopiedShapes.push(shape.clone());
    cleanCloneEvents(globalState.multiCopiedShapes[i]);

    // Clone associated elements based on shape type
    if (
      shape.name() === "dimensionLine" ||
      shape.name() === "linearLine" ||
      shape.name() === "polygonArea" ||
      shape.name() === "rectArea"
    ) {
      // Clone associated text
      const associatedText = shape.getAttr("associatedText");
      if (associatedText) {
        globalState.multiCopiedShapes[i].setAttr(
          "associatedText",
          associatedText.clone()
        );
      }

      // Clone associated anchors
      const associatedAnchors = shape.getAttr("anchors");
      if (associatedAnchors) {
        const anchors = associatedAnchors.map((anchor) => anchor.clone());
        globalState.multiCopiedShapes[i].setAttr("anchors", anchors);
      }
    }
    // else if (shape.name() === "rectArea") {
    //   // Clone associated text
    //   const associatedText = shape.getAttr("associatedText");
    //   if (associatedText) {
    //     globalState.multiCopiedShapes[i].setAttr(
    //       "associatedText",
    //       associatedText.clone()
    //     );
    //   }
    // }
    else if (shape.name() === "calloutText") {
      // Clone associated callout
      const associatedCallout = shape.getAttr("associatedCallout");
      if (associatedCallout) {
        globalState.multiCopiedShapes[i].setAttr(
          "associatedCallout",
          associatedCallout.clone()
        );
      }
    } else if (shape.name() === "textBoxInput") {
      // Clone associated box
      const associatedBox = shape.getAttr("associatedBox");
      if (associatedBox) {
        globalState.multiCopiedShapes[i].setAttr(
          "associatedBox",
          associatedBox.clone()
        );
      }
    }
  }

  // clear cut
  globalState.cutShape = null;

  globalState.cutMultiShape = [];

  globalState.copiedShape = null;

  globalState.drawLayer.draw();
}

// Paste single shape tool for copy tool
function pasteCopyMultiShapeTool() {
  if (globalState.multiCopiedShapes?.length < 2) return;

  for (let i = 0; i < globalState.multiCopiedShapes?.length; i++) {
    const shapeToPaste = globalState.multiCopiedShapes[i];
    const newPosition = utils.getNewPastePosition(shapeToPaste);

    if (!newPosition) return;

    // Update position of shape to new coordinates
    shapeToPaste.position({ x: newPosition.x, y: newPosition.y });
    globalState.drawLayer.add(shapeToPaste);

    // Handle pasting associated elements
    if (
      shapeToPaste.name() === "dimensionLine" ||
      shapeToPaste.name() === "linearLine" ||
      shapeToPaste.name() === "polygonArea" ||
      shapeToPaste.name() === "rectArea"
    ) {
      const associatedText = shapeToPaste.getAttr("associatedText");
      if (associatedText) globalState.drawLayer.add(associatedText);
      utils.syncLinearTextPosition(shapeToPaste);
    }
    // else if (shapeToPaste.name() === "rectArea") {
    //   const associatedText = shapeToPaste.getAttr("associatedText");
    //   if (associatedText) globalState.drawLayer.add(associatedText);
    //   utils.syncRectTextPosition(shapeToPaste);
    // }
    else if (shapeToPaste.name() === "calloutText") {
      const associatedCallout = shapeToPaste.getAttr("associatedCallout");
      if (associatedCallout) {
        globalState.drawLayer.add(associatedCallout);
        associatedCallout.position({ x: newPosition.x, y: newPosition.y });
        associatedCallout.moveDown();
      }
    } else if (shapeToPaste.name() === "textBoxInput") {
      const associatedBox = shapeToPaste.getAttr("associatedBox");
      if (associatedBox) {
        globalState.drawLayer.add(associatedBox);
        associatedBox.position({ x: newPosition.x, y: newPosition.y });
      }
    }

    // Handle pasting anchors
    if (
      shapeToPaste.name() === "dimensionLine" ||
      shapeToPaste.name() === "linearLine" ||
      shapeToPaste.name() === "polygonArea" ||
      shapeToPaste.name() === "rectArea"
    ) {
      const aassociatedAnchors = shapeToPaste.getAttr("anchors");
      if (aassociatedAnchors?.length > 0) {
        aassociatedAnchors.forEach((anchor) => {
          globalState.drawLayer.add(anchor);
        });
      }
    }

    if (
      shapeToPaste.name() === "calloutText" ||
      shapeToPaste.name() === "textBoxInput"
    ) {
      shapeToPaste.moveUp();
    }
    // push database
    const pushedShape = databaseService.pushShapeById(shapeToPaste);
    shapeToPaste.id(pushedShape.id);
  }

  disableLastSelectedShape();
  disableMultiSelection();
  globalState.selectedShapes = globalState.multiCopiedShapes;
  createSelectionBox();
  if (globalState.selectionBox) {
    changeMode("select", "special");
    selectShape(globalState.selectionBox);
  }
  // clear out
  globalState.multiCopiedShapes = [];

  globalState.cutShape = null;

  globalState.cutMultiShape = [];

  globalState.copiedShape = null;

  globalState.drawLayer.draw();
}

// cutMultiShapeTool
function cutMultiShapeTool() {
  if (globalState.selectedShapes?.length < 2) return;
  if (globalState.cutMultiShape?.length > 1) return;
  if (globalState.mode !== "select") return;

  for (let i = 0; i < globalState.selectedShapes?.length; i++) {
    // Clone the shape and store it in a global variable
    const shape = globalState.selectedShapes[i].clone();
    cleanCloneEvents(shape);
    globalState.cutMultiShape.push(shape);
    // Clone associated elements based on shape type
    if (
      shape.name() === "dimensionLine" ||
      shape.name() === "linearLine" ||
      shape.name() === "polygonArea" ||
      shape.name() === "rectArea"
    ) {
      // Clone associated text
      const associatedText =
        globalState.selectedShapes[i].getAttr("associatedText");
      if (associatedText) {
        shape.setAttr("associatedText", associatedText.clone());
        associatedText.destroy();
      }

      // Clone associated anchors
      const associatedAnchors =
        globalState.selectedShapes[i].getAttr("anchors");
      if (associatedAnchors) {
        const anchors = [];
        associatedAnchors.forEach((anchor) => {
          anchors.push(anchor.clone());
          anchor.destroy();
        });
        shape.setAttr("anchors", anchors);
      }
    }
    // else if (shape.name() === "rectArea") {
    //   // Clone associated text
    //   const associatedText =
    //     globalState.selectedShapes[i].getAttr("associatedText");
    //   if (associatedText) {
    //     shape.setAttr("associatedText", associatedText.clone());
    //     associatedText.destroy();
    //   }
    // }
    else if (shape.name() === "calloutText") {
      // Clone associated callout
      const associatedCallout =
        globalState.selectedShapes[i].getAttr("associatedCallout");
      if (associatedCallout) {
        shape.setAttr("associatedCallout", associatedCallout.clone());
        associatedCallout.destroy();
      }
    } else if (shape.name() === "textBoxInput") {
      // Clone associated box
      const associatedBox =
        globalState.selectedShapes[i].getAttr("associatedBox");
      if (associatedBox) {
        shape.setAttr("associatedBox", associatedBox.clone());
        associatedBox.destroy();
      }
    }

    if (globalState.transformer?.nodes()?.length > 0) {
      globalState.transformer.nodes([]);
      globalState.transformer.forceUpdate();
    }
    // delete from database
    databaseService.deleteShapeById(globalState.selectedShapes[i]);
    // Finally, remove the shape from the layer
    globalState.selectedShapes[i].destroy();
    // Clear copy
    globalState.copiedShape = null;

    globalState.drawLayer.draw();
  }

  disableLastSelectedShape();
  disableMultiSelection();

  globalState.copiedShape = null;
  globalState.multiCopiedShapes = [];

  globalState.cutShape = null;

  globalState.drawLayer.draw();
}

function pasteCutMultiShapeTool() {
  if (globalState.cutMultiShape?.length < 2) return;

  for (let i = 0; i < globalState.cutMultiShape?.length; i++) {
    const shapeToPaste = globalState.cutMultiShape[i];

    const newPosition = utils.getNewPastePosition(shapeToPaste);
    if (!newPosition) return;
    // Update the position of the shape to the new coordinates
    shapeToPaste.position({ x: newPosition.x, y: newPosition.y });
    globalState.drawLayer.add(shapeToPaste);

    // Handle pasting associated elements
    if (
      shapeToPaste.name() === "dimensionLine" ||
      shapeToPaste.name() === "linearLine" ||
      shapeToPaste.name() === "polygonArea" ||
      shapeToPaste.name() === "rectArea"
    ) {
      const associatedText = shapeToPaste.getAttr("associatedText");
      if (associatedText) globalState.drawLayer.add(associatedText);
      utils.syncLinearTextPosition(shapeToPaste);
    }
    // else if (shapeToPaste.name() === "rectArea") {
    //   const associatedText = shapeToPaste.getAttr("associatedText");
    //   if (associatedText) globalState.drawLayer.add(associatedText);
    //   utils.syncRectTextPosition(shapeToPaste);
    // }
    else if (shapeToPaste.name() === "calloutText") {
      const associatedCallout = shapeToPaste.getAttr("associatedCallout");
      if (associatedCallout) {
        globalState.drawLayer.add(associatedCallout);
        associatedCallout.position({ x: newPosition.x, y: newPosition.y });
        associatedCallout.moveDown();
      }
    } else if (shapeToPaste.name() === "textBoxInput") {
      const associatedBox = shapeToPaste.getAttr("associatedBox");
      if (associatedBox) {
        globalState.drawLayer.add(associatedBox);
        associatedBox.position({ x: newPosition.x, y: newPosition.y });
      }
    }

    // Handle pasting anchors
    if (
      shapeToPaste.name() === "dimensionLine" ||
      shapeToPaste.name() === "linearLine" ||
      shapeToPaste.name() === "polygonArea" ||
      shapeToPaste.name() === "rectArea"
    ) {
      const aassociatedAnchors = shapeToPaste.getAttr("anchors");
      if (aassociatedAnchors?.length > 0) {
        aassociatedAnchors.forEach((anchor) => {
          globalState.drawLayer.add(anchor);
        });
      }
    }

    if (
      shapeToPaste.name() === "calloutText" ||
      shapeToPaste.name() === "textBoxInput"
    ) {
      shapeToPaste.moveUp();
    }
    // push database
    const pushedShape = databaseService.pushShapeById(shapeToPaste);
    shapeToPaste.id(pushedShape.id);
  }

  disableLastSelectedShape();
  disableMultiSelection();
  globalState.selectedShapes = globalState.cutMultiShape;
  createSelectionBox();
  if (globalState.selectionBox) {
    changeMode("select", "special");
    selectShape(globalState.selectionBox);
    globalState.selectedShapes = globalState.cutMultiShape;
  }
  // clear out
  globalState.multiCopiedShapes = [];

  globalState.cutShape = null;

  globalState.cutMultiShape = [];

  globalState.copiedShape = null;

  globalState.drawLayer.draw();
}

// Delete last selected shape.
function deleteSingleSelectedShape() {
  if (globalState.lastSelectedShape) {
    // Remove the selected shape from the layer
    globalState.lastSelectedShape.destroy();
    deselectAllShapes();

    const associatedText =
      globalState.lastSelectedShape.getAttr("associatedText");
    if (associatedText) {
      associatedText.destroy();
    }

    const anchors = globalState.lastSelectedShape.getAttr("anchors");
    if (anchors) {
      anchors.forEach((anchor) => anchor.destroy()); // Remove each anchor
    }

    if (globalState.lastSelectedShape.name() === "calloutText") {
      const associatedCallout =
        globalState.lastSelectedShape.getAttr("associatedCallout");
      if (associatedCallout) {
        associatedCallout.destroy();
      }
    }

    if (globalState.lastSelectedShape.name() === "textBoxInput") {
      const associatedBox =
        globalState.lastSelectedShape.getAttr("associatedBox");
      if (associatedBox) {
        associatedBox.destroy();
      }
    }
    databaseService.deleteShapeById(globalState.lastSelectedShape);
    undoRedoService.addDeleteShapeActionToState(globalState.lastSelectedShape);
    globalState.lastSelectedShape = null;
    // Redraw the layer to reflect the deletion
    globalState.drawLayer.draw();
  }
}

// Delete multiple shapes
function deleteMultiSelectedShape() {
  if (globalState.selectedShapes?.length < 2) {
    return;
  }
  for (let i = 0; i < globalState.selectedShapes.length; i++) {
    const shape = globalState.selectedShapes[i];
    shape.destroy();
    const associatedText = shape.getAttr("associatedText");
    if (associatedText) {
      associatedText.destroy();
    }

    const anchors = shape.getAttr("anchors");
    if (anchors) {
      anchors.forEach((anchor) => anchor.destroy()); // Remove each anchor
    }

    if (shape.name() === "calloutText") {
      const associatedCallout = shape.getAttr("associatedCallout");
      if (associatedCallout) {
        associatedCallout.destroy();
      }
    }

    if (shape.name() === "textBoxInput") {
      const associatedBox = shape.getAttr("associatedBox");
      if (associatedBox) {
        associatedBox.destroy();
      }
    }
    databaseService.deleteShapeById(globalState.lastSelectedShape);
  }
  disableLastSelectedShape();
  disableMultiSelection();
  globalState.selectedShapes = [];

  // Redraw the layer to reflect the deletion
  globalState.drawLayer.draw();
}

// Zoom and Pan
globalState.stage.on("wheel", (e) => {
  // Prevent the default behavior of the wheel event, such as scrolling the page.
  e.evt.preventDefault();

  // This is a shadllow way of doing it, you can improve it (Abdullah)
  const oldScale = globalState.stage.scaleX();

  // Get the current pointer (mouse or touch) position relative to the stage.
  const pointer = globalState.stage.getPointerPosition();

  // Calculate the point in the content that is currently under the pointer
  // (in the content's coordinate system, not the stage's coordinate system).
  // This is achieved by subtracting the stage's position from the pointer position
  // and then dividing by the current scale (oldScale).
  //
  // mousePointTo.x and mousePointTo.y are the coordinates of the point on
  // the content that will remain under the pointer after zooming.

  // This is another way of doing it. Keep this comment please. I might use it.  (Abdullah)
  /*
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
  */

  const mousePointTo = utils.getRelativePointerPosition(globalState.stage);

  // Determine the zoom direction based on the wheel's deltaY value:
  // - A positive deltaY (scroll down) means zoom in (increase the scale).
  // - A negative deltaY (scroll up) means zoom out (reduce the scale).

  const direction = e.evt.deltaY > 0 ? -1 : 1;

  // set max scale
  if (globalState.stage.scaleX() >= 4 && direction > 0) {
    log("Hit max zoom in");
    return;
  }

  if (globalState.stage.scaleX() <= 0.15 && direction < 0) {
    log("Hit max zoom out");
    return;
  }

  // Calculate the new scale based on the zoom direction.
  // - If zooming in, multiply the old scale by 1.10.
  // - If zooming out, divide the old scale by 1.10.
  const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1;

  // Apply the new scale to the stage.
  globalState.stage.scale({ x: newScale, y: newScale });

  // Calculate the new position of the stage such that the content under the
  // pointer before zooming remains under the pointer after zooming.
  //
  // The new position is calculated by adjusting the current pointer position
  // by the difference between the old and new scales.
  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };

  // Update the stage's position with the newly calculated position.
  globalState.stage.position(newPos);

  // Adjust anchors size and position based on zoom level if there's a selected shape
  // Scale arrow lines according to the stage's new scale
  // Scale linear lines according to the stage's new scale
  // Scale polygonAreas according to the stage's new scale
  // scale clouds
  // Update positon of text area when editing
  utils.adjustAnchorsAndShapesSize();

  // Redraw the stage
  globalState.stage.draw();
});

// panBtn.addEventListener("click", () => {
//   changeMode("pan");
//   globalState.stage.draggable(true);
//   globalState.stage.container().style.cursor = "crosshair";
// });

dimensionLineBtn.addEventListener("click", () => {
  changeMode("dimension line");
  globalState.stage.draggable(true);
  globalState.stage.container().style.cursor = "crosshair";
});

linearBtn.addEventListener("click", () => {
  changeMode("linear");
  globalState.stage.draggable(true);
  globalState.stage.container().style.cursor = "crosshair";
});

polygonAreaBtn.addEventListener("click", () => {
  changeMode("polygonArea");
  globalState.stage.draggable(true);
  globalState.stage.container().style.cursor = "crosshair";
});

rectAreaBtn.addEventListener("click", () => {
  changeMode("rectArea");
  globalState.stage.draggable(true);
  globalState.stage.container().style.cursor = "crosshair";
});

selectBtn.addEventListener("click", () => {
  changeMode("select");
  globalState.stage.draggable(true);
  globalState.stage.container().style.cursor = "default";
});

highlightBtn.addEventListener("click", () => {
  changeMode("highlight");
  globalState.stage.draggable(true);
  globalState.stage.container().style.cursor = "crosshair";
});

cloudShapeBtn.addEventListener("click", () => {
  changeMode("cloud");
  globalState.stage.draggable(true);
  globalState.stage.container().style.cursor = "crosshair";
});

calloutBtn.addEventListener("click", () => {
  changeMode("callout");
  globalState.stage.draggable(true);
  globalState.stage.container().style.cursor = "crosshair";
});

textBoxBtn.addEventListener("click", () => {
  changeMode("textBox");
  globalState.stage.draggable(true);
  globalState.stage.container().style.cursor = "crosshair";
});

zoomHomeBtn.addEventListener("click", () => {
  if (globalState.selectionBox) {
    changeMode("pan", "special");
  } else {
    changeMode("pan");
  }

  globalState.stage.draggable(true);
  globalState.stage.container().style.cursor = "crosshair";
  utils.zoomHome();
});

zoomInBtn.addEventListener("click", () => {
  if (globalState.selectionBox) {
    changeMode("pan", "special");
  } else {
    changeMode("pan");
  }
  globalState.stage.draggable(true);
  globalState.stage.container().style.cursor = "crosshair";
  utils.zoomIn();
});

zoomOutBtn.addEventListener("click", () => {
  if (globalState.selectionBox) {
    changeMode("pan", "special");
  } else {
    changeMode("pan");
  }
  globalState.stage.draggable(true);
  globalState.stage.container().style.cursor = "crosshair";
  utils.zoomOut();
});

cutBtn.addEventListener("click", () => {
  if (globalState.mode === "select" && !globalState.selectionBox) {
    cutShapeTool();
  } else if (globalState.mode === "select" && globalState.selectionBox) {
    cutMultiShapeTool();
  }
});

pasteBtn.addEventListener("click", () => {
  if (globalState.cutShape) pasteCutShapeTool();
  if (globalState.copiedShape) pasteCopyShapeTool();
  if (globalState.multiCopiedShapes?.length > 1) {
    pasteCopyMultiShapeTool();
  }
  if (globalState.cutMultiShape?.length > 1) {
    pasteCutMultiShapeTool();
  }
});

copyBtn.addEventListener("click", () => {
  if (globalState.mode === "select" && !globalState.selectionBox) {
    copyShapeTool();
  } else if (globalState.mode === "select" && globalState.selectionBox) {
    copyMultiShapeTool(); // Handle muli shape copy
  }
});

multiSelectBtn.addEventListener("click", () => {
  changeMode("multiSelect");
  globalState.stage.draggable(true);
  globalState.stage.container().style.cursor = "crosshair";
});



undoBtn.addEventListener("click", () => {
  undoRedoService.handleSingleUndo();
});

redoBtn.addEventListener("click", () => {
  undoRedoService.handleSingleRedo();
});

scaleSelect.addEventListener("change", function () {
  // Update the global variable with the selected value from the dropdown
  globalState.drawingScale = parseFloat(this.value);
  console.log("Current scale set to:", globalState.drawingScale);

  // Enable the other controls when a valid scale is selected
  if (globalState.drawingScale) {
    selectBtn.disabled = false;
    dimensionLineBtn.disabled = false;
    linearBtn.disabled = false;
    polygonAreaBtn.disabled = false;
    rectAreaBtn.disabled = false;
    highlightBtn.disabled = false;
    cloudShapeBtn.disabled = false;
    calloutBtn.disabled = false;
    textBoxBtn.disabled = false;
    zoomHomeBtn.disabled = false;
    zoomInBtn.disabled = false;
    zoomOutBtn.disabled = false;
    cutBtn.disabled = false;
    pasteBtn.disabled = false;
    copyBtn.disabled = false;
    multiSelectBtn.disabled = false;

    undoBtn.disabled = false;
    redoBtn.disabled = false;
  }
});

// Listen for the keydown event globally (you can also attach this to the stage)
window.addEventListener("keydown", function (e) {
  // Check if the Delete key is pressed (key code 46 is for the 'Delete' key)
  if (e.key === "Delete" || e.keyCode === 46) {
    // Check if a shape is currently selected and single delete
    deleteSingleSelectedShape();
    deleteMultiSelectedShape();
  }
});

// Add a window resize event listener
window.addEventListener("resize", function () {
  // Update the stage dimensions to match the new window size
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  // Adjust the stage size
  globalState.stage.width(newWidth);
  globalState.stage.height(newHeight);

  // Get the image on the stage (assuming it's named "drawingImage")
  const image = globalState.stage.findOne("#drawingImage");
  if (image) {
    // Apply the same centering and scaling logic you provided

    // Calculate scale factor to fit the image inside the stage
    const scaleX = globalState.stage.width() / image.width();
    const scaleY = globalState.stage.height() / image.height();
    const scale = Math.min(scaleX, scaleY); // Choose the smaller scale factor

    // Apply the scale to the stage content
    globalState.stage.scale({ x: scale, y: scale });

    // Position the stage content (image) at the center
    const offsetX = (globalState.stage.width() - image.width() * scale) / 2;
    const offsetY = (globalState.stage.height() - image.height() * scale) / 2;
    globalState.stage.position({ x: offsetX, y: offsetY });

    // Update positon of text area when editing
    utils.updateTextAreaPosition();

    globalState.stage.draw(); // Redraw the stage to apply changes
  }
  utils.adjustAnchorsAndShapesSize();
});

export {
  boundFuncForShapeMove,
  deselectAllShapes,
  selectShape,
  disableLastSelectedShape,
};
