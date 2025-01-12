// Lottie Animation Setup
let animation = lottie.loadAnimation({
    container: document.getElementById('lottie-container'),
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: 'js/BRAINFRUIT_white.json',
    rendererSettings: {
        progressiveLoad: true,
        hideOnTransparent: true,
        className: 'lottie-svg',
    },
    quality: 0.8
});

// Event Listeners
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault(); // Prevent page scrolling
        animation.goToAndPlay(0);
    }
});

document.addEventListener('touchstart', function(event) {
    if (event.touches.length === 2) { // Two finger tap
        event.preventDefault();
        animation.goToAndPlay(0);
    }
});

// Form Handling (you'll need to implement this)
function handleSubmit(event) {
    event.preventDefault();
    // Add your form submission logic here
} 