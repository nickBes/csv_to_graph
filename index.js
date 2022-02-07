// we have only one form so we can use querySelector
const form = document.querySelector('form')
// An array of coordinates in this format: [[x,y], [x1, y1]...]
let coords;

form.onchange = async () => {
    const data = new FormData(form)
    // if form doesn't have an input of name file stop
    if (!data.has('file')) return
    const file = data.get('file')
    if (file instanceof File) {
        const text = await file.text()
        coords = parseTextCSV(text)
        console.log(coords)
    }
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