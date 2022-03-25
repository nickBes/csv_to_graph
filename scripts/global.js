const MENU_BOX = document.getElementById('menu-box')
const MENU_BUTTON = document.getElementById('menu-button')

MENU_BUTTON.onclick = (event) => {
    // stops from on click event fire the parent's events
    // so the menu box wouldn't close immediately
    event.stopPropagation()

    const buttonRect = MENU_BUTTON.getBoundingClientRect()
    MENU_BOX.classList.toggle('hidden')

    // puts the menu box in a relative location to the menu button
    const menuBoxWidth = MENU_BOX.getBoundingClientRect().width
    MENU_BOX.style.top = (buttonRect.top + buttonRect.height * 1.5) + 'px'
    MENU_BOX.style.left = (buttonRect.left - menuBoxWidth + (buttonRect.width/2)) + 'px'
}


window.onclick = () => {
    if (!MENU_BOX.classList.contains('hidden')) {
        MENU_BOX.classList.add('hidden')
    }
}

MENU_BOX.onclick = (event) => {
    // stops from on click event fire the parent's events
    // so the menu box wouldn't close immediately
    event.stopPropagation()
}