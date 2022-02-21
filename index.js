// we have only one input so we can use querySelector
const input = document.querySelector('input')

// we have only one canvas so we can use querySelector
const canvas = document.querySelector('canvas')

const graphPropertiesForm = document.querySelector('#graphPropertiesForm')

const graphTitle = document.querySelector('#graphTitle')

// An array of coordinates in this format: [[x,y], [x1, y1]...]
let coords;
let graphProperties = {};

// load the default graphProperties
updateGraphProperties()

input.onchange = async () => {
    // if no files were supplied
    if (!input.files || input.files.length == 0) return;

    const file = input.files[0];

    if (file instanceof File) {
        const text = await file.text()
        coords = parseTextCSV(text)
        sortCoords()
        drawGraph()
    }
    input.value = ""
}

graphPropertiesForm.oninput = () => {
    updateGraphProperties()
    drawGraph()
}

// updates the graphProperties object according to the form data
function updateGraphProperties(){
    const formData = new FormData(graphPropertiesForm);
    for (let [key, value] of formData) {
        graphProperties[key] = value;
    }
}

function parseTextCSV(text) {
    if (typeof text !== "string") return // used for autocopmletions
    let coordMap = new Map() // used to shadow repetetive values

    text.split(/(?:\n)|(?:\r\n)/) // seperate rows using regex
        .forEach(row => { // parse data into a list of coordinates
            // this might set numbers as NaN when string is given
            let [x, y] = row.split(',').map(val => parseFloat(val))
            // won't save if invalid
            if (isInvalidNum(x)) return

            coordMap.set(x, y)
        })
    // parse the entries to array because it's an iterator
    return Array.from(coordMap.entries())
}

function isInvalidNum(num) {
    return typeof num === "undefined" || isNaN(num)
}

// The canvas treats the point (0,0) as its top left, so increasing the y value of a point means
// moving it down, and not up. This is not how our users expect y values to work, so we must invert
// the y values that we get as input to convert them to canvas space. 
function convertPointToCanvasSpace(point) {
    const [x, y] = point
    return [x, canvas.height - y]
}

// sorts the coordinates by their x value in an ascending order.
function sortCoords() {
    coords.sort(([x1, _y1], [x2, _y2]) => x1 - x2)
}

function drawGraph() {
    // if we don't have at least 2 points we can't draw a graph
    if (coords.length < 2) {
        // make sure to hide the title
        graphTitle.textContent = '';
        return;
    }

    graphTitle.textContent = graphProperties.graphTitle

    // clear the canvas
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // draw a line connecting all the points
    ctx.strokeStyle = graphProperties.lineColor
    const firstPoint = coords[0]
    ctx.moveTo(...convertPointToCanvasSpace(firstPoint))
    for (const point of coords.slice(1)) {
        ctx.lineTo(...convertPointToCanvasSpace(point))
    }
    ctx.stroke()
}
