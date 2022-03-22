// we have only one input so we can use querySelector
const input = document.querySelector('input')

// we have only one canvas so we can use querySelector
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const graphPropertiesForm = document.querySelector('#graphPropertiesForm')

const graphTitle = document.querySelector('#graphTitle')

// An array of coordinates in this format: [[x,y], [x1, y1]...]
let coords;
let origin;
let graphProperties = {};

// load the default graphProperties
updateGraphProperties()
const zoomSpeed = 1.1

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
function updateGraphProperties() {
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

            // will convert the points to canvas space once before rendering
            // as it won't be used later
            coordMap.set(...convertPointToCanvasSpace([x, y]))

            origin = [0, canvas.height]
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
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // draw a line connecting all the points
    ctx.strokeStyle = graphProperties.lineColor
    ctx.beginPath()
    const firstPoint = coords[0]
    ctx.moveTo(...firstPoint)
    for (const point of coords.slice(1)) {
        ctx.lineTo(...point)
    }
    ctx.stroke()
    ctx.closePath()

    drawAxes()
}

function drawAxes() {
    let [originX, originY] = origin;

    ctx.strokeStyle = '#000000'

    // draw the y axis
    ctx.beginPath()
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, canvas.height);
    ctx.stroke()
    ctx.closePath()

    // draw the x axis
    ctx.beginPath()
    ctx.moveTo(0, originY);
    ctx.lineTo(canvas.width, originY);
    ctx.stroke()
    ctx.closePath()
}

canvas.onmousemove = event => {
    if (!(event instanceof MouseEvent) || !coords) return // return for invalid cases
    if (event.buttons != 1) return // return if haven't clicked

    function movePoint([x, y]) {
        return [x + event.movementX, y + event.movementY]
    }

    // transform the context's matrix as per the movement 
    // not using ctx.translate() because it changes the
    // matrix for clearing the canvas which leaves trails
    coords = coords.map(movePoint)
    origin = movePoint(origin)

    drawGraph()
}

canvas.onwheel = event => {
    if (!(event instanceof WheelEvent) || !coords) return // return for invalid cases

    // translates the scrolled delta Y into a positive number n
    // 0 < n < 1 when scrolling down and n > 1 when scrolling up

    const zoomFactor = zoomSpeed ** -Math.sign(event.deltaY) // using Math.sign to equal speed for all devices

    // calculating the distance of the zoomed point before and after scaling
    // to adjust the graph so the zoomed in point will stay in the same location
    // on the canvas
    const scaleOffsetX = (zoomFactor - 1) * event.offsetX
    const scaleOffsetY = (zoomFactor - 1) * event.offsetY


    function scalePoint([x, y]) {
        return [x * zoomFactor - scaleOffsetX, y * zoomFactor - scaleOffsetY]
    }

    // the new points scaled up and substracted by the distance between the zoomed point before and after scaling
    // which means that the zoomed into point will be in the same coords before zooming
    coords = coords.map(scalePoint)
    origin = scalePoint(origin)
    drawGraph()
}
