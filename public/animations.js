document.addEventListener('DOMContentLoaded', () => {

    // --- GSAP & ScrollTrigger Setup ---
    // Register the GSAP plugin to make it available for use.
    gsap.registerPlugin(ScrollTrigger);

    // --- Smooth Scrolling with Lenis ---
    // Lenis is a library that provides a smoother scrolling experience.
    // It normalizes scroll behavior across different browsers and devices.
    const lenis = new Lenis();

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // --- Hero Section Animation ---
    // This creates an animation timeline for the elements in the hero section.
    const heroTl = gsap.timeline();
    heroTl
        .from('.hero-content h1', {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        })
        .from('.hero-content p', {
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.out'
        }, "-=0.5"); // Starts 0.5s before the previous animation ends.


    // --- Section Title Animation ---
    // Animates the large section titles letter by letter.
    gsap.utils.toArray('.section-title').forEach(title => {
        // SplitType breaks the text into individual letters.
        const splitText = new SplitType(title, {
            types: 'chars'
        });

        gsap.from(splitText.chars, {
            y: 50,
            opacity: 0,
            stagger: 0.05, // Each letter animates 0.05s after the previous one.
            duration: 0.5,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: title,
                start: 'top 80%', // Animation starts when the top of the title is 80% from the top of the viewport.
                toggleActions: 'play none none none', // Plays the animation once when it enters the viewport.
            },
        });
    });


    // --- Staggered Content Animation for Sections ---
    // This function creates a staggered animation for the child elements of a given section.
    const animateSection = (sectionId, childrenSelector) => {
        gsap.from(`${sectionId} ${childrenSelector}`, {
            y: 30,
            opacity: 0,
            stagger: 0.2,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: sectionId,
                start: 'top 70%',
                toggleActions: 'play none none none',
            },
        });
    };

    // Apply the animation to each section with its specific content.
    animateSection('#about', '.max-w-4xl, .group');
    animateSection('#music', '.max-w-5xl');
    animateSection('#tour', '.max-w-4xl');
    animateSection('#gallery', '.max-w-4xl');
    animateSection('#merch', '.group');
    animateSection('#booking', '.max-w-4xl, .max-w-2xl');

});
