// animations.js - Scroll and interaction animations

document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for scroll animations
    const faders = document.querySelectorAll('.section, .skill-card, .project-card');

    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    // Initially add fade-in class to elements we want to animate
    faders.forEach(fader => {
        fader.classList.add('fade-in');
        appearOnScroll.observe(fader);
    });
});
