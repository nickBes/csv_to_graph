// we have only one form so we can use querySelector
let form = document.querySelector('form')
let matrix;

form.onchange = async () => {
    const data = new FormData(form)
    // if form doesn't have an input of name file stop
    if (!data.has('file')) return
    let file = data.get('file')
    if (file instanceof File) {
        const text = await file.text()
        matrix = parseTextCSV(text)
        console.log(matrix)
    }
}

function parseTextCSV (text) {
    if (typeof text === "string") {
        let parsedRows = text.split('\n') // seperate rows
                        .map(str => { // parse data into a matrix
                            // this might set numbers as NaN when string is given
                            let [x, y] = str.split(',').map(val => parseFloat(val))
                            // will return 0 for invalid values
                            if (isInvalidNum(x)) {
                                return 0
                            }

                            return [x, y]
                        })
                        .filter(val => val) // filter 0 values
        return parsedRows
    }
}

function isInvalidNum(num) {
    return typeof num === "undefined" || isNaN(num)
}