const menuBox = document.getElementById('menu-box')
const menuButton = document.getElementById('menu-button')

window.onclick = () => {
    if (!menuBox.classList.contains('hidden')) {
        menuBox.classList.add('hidden')
    }
}

menuButton.onclick = (event) => {
    // stops from on click event fire the parent's events
    // so the menu box wouldn't close immediately as the
    // window (it's parent) has an onclick event that closes
    // the menu box 
    event.stopPropagation()

    const buttonRect = menuButton.getBoundingClientRect()
    menuBox.classList.toggle('hidden')

    // puts the menu box in a relative location to the menu button
    const menuBoxWidth = menuBox.getBoundingClientRect().width
    // the distance from the top of the menu box will be the button's distance
    // from the top plus it's height multiplied by some values so the menu box
    // will be below the button
    menuBox.style.top = (buttonRect.top + buttonRect.height * 1.5) + 'px'
    // the distance from the left of the menu box will be the button's distance from the left
    // minus the width of the box plus half the width of the button so the box would be rendered
    // from the left of the center of the button
    menuBox.style.left = (buttonRect.left - menuBoxWidth + (buttonRect.width/2)) + 'px'
}


menuBox.onclick = (event) => {
    // stops from on click event fire the parent's events
    // so the menu box wouldn't close immediately as the
    // window (it's parent) has an onclick event that closes
    // the menu box 
    event.stopPropagation()
}