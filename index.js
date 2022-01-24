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
        matrix = await parseTextCSV(text)
        console.log(matrix)
    }
}

async function parseTextCSV (text) {
    if (typeof text === "string") {
        let rows = text.split('\n')
        let parsedRows = await Promise.all(rows.map(str => {
            // this might set numbers as NaN when string is given
            let [x, y] = str.split(',').map(val => parseFloat(val))
            // we can have invalid y values because we'll consider
            // them as holes, but we should remove points with invalid
            // x values 
            if (typeof x === "undefined" || isNaN(x)) {
                return 0
            }
            return [x, y]
        }))
        // return the matrix without invalid rows:
        // 0 returns false, and array returns true
        return parsedRows.filter(val => val)
    }
}