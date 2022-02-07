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

    // deselect the file so that we can detect if it is selected once again.
    input.value = ""
}

function parseTextCSV (text) {
    if (typeof text !== "string") return // used for autocopmletions
    let parsedRows = text.split(/(?:\n)|(?:\r\n)/) // seperate rows using regex
                    .map(row => { // parse data into a list of coordinates
                        // this might set numbers as NaN when string is given
                        let [x, y] = row.split(',').map(val => parseFloat(val))
                        // will return 0 for invalid values
                        if (isInvalidNum(x)) {
                            return 0
                        }

                        return [x, y]
                    })
                    .filter(val => val) // filter 0 values
    return parsedRows
}

function isInvalidNum(num) {
    return typeof num === "undefined" || isNaN(num)
}
