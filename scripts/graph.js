// we have only one input so we can use querySelector
const csvInput = document.querySelector('#csv')
const table = document.getElementById('raw-data')

// we have only one canvas so we can use querySelector
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const graphPropertiesForm = document.querySelector('#graph-form')

const graphTitle = document.querySelector('#graph-title')

// An array of coordinates in this format: [[x,y], [x1, y1]...]
let coords;
let origin;
let graphProperties = {};

// load the default graphProperties
updateGraphProperties()
const zoomSpeed = 1.1

csvInput.onchange = async () => {
    // if no files were supplied
    if (!csvInput.files || csvInput.files.length == 0) return;

    const file = csvInput.files[0];

    if (file instanceof File) {
        const text = await file.text()
        coords = parseTextCSV(text)
        sortCoords()
        addCoordsToRawTable()
        chooseInitialTransformation()
        drawGraph()
    }
    csvInput.value = ""
}

function addCoordsToRawTable() {
    table.innerHTML = ''
    coords.forEach(([x,y]) => {
        let xTd = document.createElement('td')
        let yTd = document.createElement('td')
        let tr = document.createElement('tr')

        tr.appendChild(xTd)
        tr.appendChild(yTd)
        table.appendChild(tr)

        xTd.innerText = x
        yTd.innerText = y
    })
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

            // the origin for graphs is expected to be at the bottom left, 
            // and in canvas units the bottom left is represented as the following:
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

// find the boundaries of the given points
function foundBoundariesOfPoints(points) {
    let [firstPointX, firstPointY] = points[0]
    let left = firstPointX
    let right = firstPointX
    let top = firstPointY
    let bottom = firstPointY

    // skip the first point because we already used it
    for (let [x, y] of points.slice(1)) {
        if (x < left) {
            left = x
        }
        if (x > right) {
            right = x
        }
        if (y < top) {
            top = y
        }
        if (y > bottom) {
            bottom = y
        }
    }

    return {left, right, top, bottom}
}

// zooms the given point by the given zoom factor according to the given zoom origin
function zoomPoint(point, zoomFactor, zoomOrigin) {
    const [originX, originY] = zoomOrigin;
    const [x, y] = point;
    let dx = x - originX;
    let dy = y - originY;
    return [originX + dx * zoomFactor, originY + dy * zoomFactor]
}

// moves the given point by the given movement
function movePoint(point, movement) {
    const [x, y] = point;
    const [moveX, moveY] = movement
    return [x + moveX, y + moveY]
}

// applies the given function to all points, including the origin.
function mapAllPoints(fn) {
    coords = coords.map(fn)
    origin = fn(origin)
}

// chooses an initial zoom value which fits the entire graph inside of the canvas.
function chooseInitialTransformation() {
    // found a boundary which contains all points including the origin
    let boundaries = foundBoundariesOfPoints([...coords, origin])

    // find the dimensions of the boundary around all the points and the origin
    const width = boundaries.right - boundaries.left;
    const height = boundaries.bottom - boundaries.top;

    // the desired zoom value to make the whole width of the boundary fit inside the canvas.
    const widthZoomValue = canvas.width / width;

    // the desired zoom value to make the whole height of the boundary fit inside the canvas.
    const heightZoomValue = canvas.height / height

    // we want to choose the smaller one of the 2 zoom values that we found so that both the width 
    // and the height fit.
    const zoomFactor = Math.min(widthZoomValue, heightZoomValue)

    mapAllPoints((point) => zoomPoint(point, zoomFactor, origin))

    // move the points so that all of them are in the screen.
    //
    // to do that we should find the new boundaries after zooming the points, and move all points to make
    // the left boundary 0, which is the left of the canvas, and move all points to make the bottom boundary 
    // equal to canvas.height, which is the bottom of the graph.
    const boundariesAfterZoom = foundBoundariesOfPoints([...coords, origin])
    const movement = [-boundariesAfterZoom.left, -(boundariesAfterZoom.bottom - canvas.height)]
    mapAllPoints((point) => movePoint(point, movement))
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

// draws a line from point a to point b
function drawLine(a, b) {
    ctx.beginPath()
    ctx.moveTo(...a)
    ctx.lineTo(...b)
    ctx.stroke()
    ctx.closePath()
}

function drawAxes() {

    let [originX, originY] = origin;

    // all the axis and their titles are black
    ctx.strokeStyle = '#000000'

    // setup for the axis titles
    ctx.textBaseline = 'middle'
    ctx.font = `17px Arial`

    // draw the y axis
    drawLine([originX, 0], [originX, canvas.height])

    // draw the title for the y axis
    const yTitle = graphProperties['yTitle'];
    // save the current transformation of the context so that we don't mess up further uses of it. the transformation
    // is restored when calling the `restore` method on the context.
    ctx.save()
    ctx.rotate(-Math.PI / 2)
    const yTitleWidth = ctx.measureText(yTitle).width;
    // if we can draw the y title above the x axis then we want to do that, but if we don't have enought space 
    // to draw it above the x axis, we want to draw it below it. the text is drawn with a 90 degree angle, so the 
    // width of it represents its hight when drawn to the canvas. thus we need to check if its hight when drawn is 
    // bigger than `originY` which is the space from the top of the screen to the x axis. If  it's bigger then we 
    // don't have enough space and we should draw it below, otherwise we do have enough space and we should draw it
    // above the x axis.
    if (yTitleWidth >= originY) {
        ctx.textAlign = 'left'
        ctx.fillText(yTitle, -canvas.height, originX)
    } else {
        ctx.textAlign = 'right'
        ctx.fillText(yTitle, 0, originX)
    }
    // restore the transformation of the context before the rotation.
    ctx.restore()


    // draw the x axis
    drawLine([0, originY], [canvas.width, originY])

    // draw the title for the x axis
    const xTitle = graphProperties['xTitle'];
    const xTitleWidth = ctx.measureText(xTitle).width;
    // if we can draw the x title to the right of the y axis we want to do that, but if we don't have enough space
    // to draw it to the right of the y axis, we want to draw it to the left of it. so we need to find the space from
    // the right of the screen to the y axis, and check if we have enough space for the width of the x title there.
    // if the x title width is bigger than the available space, then we should draw it to the left of the y axis, 
    // otherwise if we have enough space we draw it to the right of the y axis.
    const spaceLeftRightToYAxis = canvas.width - originX;
    if (xTitleWidth >= spaceLeftRightToYAxis) {
        ctx.textAlign = 'left'
        ctx.fillText(xTitle, 0, originY)
    } else {
        ctx.textAlign = 'right'
        ctx.fillText(xTitle, canvas.width, originY)
    }
}

canvas.onmousemove = event => {
    if (!(event instanceof MouseEvent) || !coords) return // return for invalid cases
    if (event.buttons != 1) return // return if haven't clicked

    const movement = [event.movementX, event.movementY];
    mapAllPoints((point) => movePoint(point, movement))

    drawGraph()
}

canvas.onwheel = event => {
    if (!(event instanceof WheelEvent) || !coords) return // return for invalid cases

    // translates the scrolled delta Y into a positive number n
    // 0 < n < 1 when scrolling down and n > 1 when scrolling up

    const zoomFactor = zoomSpeed ** -Math.sign(event.deltaY) // using Math.sign to equal speed for all devices
    const zoomOrigin = [event.offsetX, event.offsetY]

    mapAllPoints((point) => zoomPoint(point, zoomFactor, zoomOrigin))

    drawGraph()
}
