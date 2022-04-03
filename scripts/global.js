const menuBox = document.getElementById('menu-box')
const menuButton = document.getElementById('menu-button')

const [menuStartFrame, menuEndFrame] = [
    {opacity: 0, transform: 'translate(0px, -25%)'},
    {opacity: 1, transform: 'translate(0px, 0px)'}
]
const menuAnimationConfig = {
    duration: 200,
    iterations: 1,
    easing: 'ease-in'
}

async function animateOutMenu() {
    await menuBox.animate([menuEndFrame, menuStartFrame], menuAnimationConfig).finished
    menuBox.classList.add('hidden')
}

window.onclick = () => {
    if (!menuBox.classList.contains('hidden')) {
        animateOutMenu()
    }
}

menuButton.onclick = (event) => {
    // stops from on click event fire the parent's events
    // so the menu box wouldn't close immediately as the
    // window (it's parent) has an onclick event that closes
    // the menu box 
    event.stopPropagation()

    const buttonRect = menuButton.getBoundingClientRect()
    // toggles between the animation states
    if (!menuBox.classList.contains('hidden')) {
        animateOutMenu()
    } else {
        menuBox.classList.remove('hidden')
        menuBox.animate([menuStartFrame, menuEndFrame], menuAnimationConfig)
    }

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