// we have only one input so we can use querySelector
const input = document.querySelector('input')

// An array of coordinates in this format: [[x,y], [x1, y1]...]
let coords;

input.onchange = async () => {
    // if no files were supplied
    if(!input.files || input.files.length == 0) return;

    const file = input.files[0];
    if (file instanceof File) {
        const text = await file.text()
        coords = parseTextCSV(text)
        console.log(coords)
    }
    input.value = ""
}

function parseTextCSV (text) {
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