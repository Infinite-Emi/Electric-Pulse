document.addEventListener('DOMContentLoaded', () => {

    // --- Contact Form Submission & Validation ---
    const contactForm = document.getElementById('contact-form');
    const submitButton = document.getElementById('submit-button');
    const formResponse = document.getElementById('form-response');
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const companyInput = document.getElementById('company');
    const eventTypeInput = document.getElementById('eventType');
    const messageInput = document.getElementById('message');

    const inputs = [nameInput, emailInput, phoneInput, companyInput, eventTypeInput, messageInput];
    const requiredInputs = [nameInput, emailInput, eventTypeInput, messageInput];

    const showError = (input, message) => {
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) {
            input.classList.add('form-input-error');
            errorElement.textContent = message;
        }
    };

    const clearError = (input) => {
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) {
            input.classList.remove('form-input-error');
            errorElement.textContent = '';
        }
    };

    const validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    // Helper function to check for a valid phone number
    const isPhoneValid = (phone) => {
        // The field is optional, so it's valid if empty.
        if (!phone || phone.trim() === '') {
            return true;
        }
        // Use the library to check for validity, providing 'GB' as the default country.
        if (typeof libphonenumber !== 'undefined') {
            const phoneNumber = libphonenumber.parsePhoneNumberFromString(phone, 'GB');
            return phoneNumber && phoneNumber.isValid();
        }
        return true; // Failsafe if library doesn't load
    };

    // Validates a single input and shows/hides its error message
    const validateInput = (input) => {
        if (!input) return true;
        if (!input.hasAttribute('required') && input.value.trim() === '') {
             clearError(input);
             return true;
        }
        
        let isValid = true;
        switch (input.id) {
            case 'name':
                if (input.value.trim() === '') {
                    showError(input, 'Name is required.');
                    isValid = false;
                } else {
                    clearError(input);
                }
                break;
            case 'email':
                if (input.value.trim() === '') {
                    showError(input, 'Email is required.');
                    isValid = false;
                } else if (!validateEmail(input.value.trim())) {
                    showError(input, 'Please enter a valid email address.');
                    isValid = false;
                } else {
                    clearError(input);
                }
                break;
            case 'phone':
                if (isPhoneValid(input.value)) {
                    clearError(input);
                } else {
                    showError(input, 'Please enter a valid phone number.');
                    isValid = false;
                }
                break;
            case 'eventType':
                if (input.value.trim() === '') {
                    showError(input, 'Event type is required.');
                    isValid = false;
                } else {
                    clearError(input);
                }
                break;
            case 'message':
                if (input.value.trim() === '') {
                    showError(input, 'Please enter a message.');
                    isValid = false;
                } else {
                    clearError(input);
                }
                break;
            default:
                clearError(input); 
                break;
        }
        return isValid;
    };
    
    const checkFormValidity = () => {
        let isFormValid = true;
        // Check all required fields
        for (const input of requiredInputs) {
            if (input && input.value.trim() === '') {
                isFormValid = false;
                break;
            }
        }
        // Check email format if it's filled
         if (isFormValid && emailInput && !validateEmail(emailInput.value.trim())) {
            isFormValid = false;
        }
        // Also check phone validity if it's filled
        if (isFormValid && phoneInput && !isPhoneValid(phoneInput.value)) {
            isFormValid = false;
        }
        if(submitButton) submitButton.disabled = !isFormValid;
    };

    // Add event listeners
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('blur', () => validateInput(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('form-input-error')) {
                    validateInput(input);
                }
                checkFormValidity();
            });
        }
    });

    // Initially disable the button
    if(submitButton) {
        submitButton.disabled = true;
    }


    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            let isFormValid = true;
            inputs.forEach(input => {
                if (input && !validateInput(input)) isFormValid = false;
            });

            if (!isFormValid) {
                if (formResponse) {
                    formResponse.textContent = 'Please fix the errors before submitting.';
                    formResponse.classList.add('text-red-400');
                }
                return;
            }
            
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            formResponse.textContent = '';
            formResponse.classList.remove('text-green-400', 'text-red-400');

            const formData = new FormData(contactForm);
            let fullPhoneNumber = '';
            if(formData.get('phone').trim()){
                 if (typeof libphonenumber !== 'undefined') {
                    const phoneNumber = libphonenumber.parsePhoneNumberFromString(formData.get('phone').trim(), 'GB');
                    if(phoneNumber) fullPhoneNumber = phoneNumber.format('E.164');
                 }
            }

            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: fullPhoneNumber,
                company: formData.get('company'),
                eventType: formData.get('eventType'),
                message: formData.get('message')
            };

            // This part is mocked. Replace with your actual API call.
            const apiUrl = '/api/send-email';

            try {
                // MOCKED API CALL
                await new Promise(resolve => setTimeout(resolve, 1500)); 
                const response = { ok: true, json: () => Promise.resolve({ message: "Success" }) };
                // END MOCKED API CALL
                
                if (response.ok) {
                    formResponse.textContent = "Thanks for reaching out! We'll get back to you soon.";
                    formResponse.classList.add('text-green-400');
                    contactForm.reset();
                    inputs.forEach(input => input && clearError(input)); 
                    setTimeout(checkFormValidity, 100);
                } else {
                    formResponse.textContent = `Error: ${'Something went wrong.'}`;
                    formResponse.classList.add('text-red-400');
                }
            } catch (error) {
                console.error('Submission error:', error);
                formResponse.textContent = 'Failed to connect to the server. Please try again later.';
                formResponse.classList.add('text-red-400');
            } finally {
                submitButton.textContent = 'Send Inquiry';
                checkFormValidity(); 
            }
        });
    }


    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    const closeMenu = () => {
        if (mobileMenu && mobileMenu.classList.contains('menu-open')) {
            mobileMenu.classList.remove('menu-open');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300); // Match CSS transition duration
        }
    };

    if(mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden');
                setTimeout(() => { // Allow display change to apply before transform
                    mobileMenu.classList.add('menu-open');
                }, 10);
            } else {
                closeMenu();
            }
        });
    }


    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });


    // --- Footer Year ---
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
    

    // --- Header Scroll Effect ---
    const header = document.getElementById('header');
    if (header) {
        window.onscroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('bg-opacity-95');
                header.classList.remove('bg-opacity-80');
            } else {
                header.classList.add('bg-opacity-80');
                header.classList.remove('bg-opacity-95');
            }
        };
    }
    

    // --- Scroll-triggered Animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                const children = entry.target.querySelectorAll('.group, .merch-card, .max-w-4xl, .max-w-5xl, .max-w-2xl, #image-gallery-container, #video-gallery-container');
                  children.forEach((child, index) => {
                    child.style.transitionDelay = `${index * 100}ms`;
                  });
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-section').forEach(section => {
        observer.observe(section);
    });

    // --- Music Player: Pause others on play ---
    const audioPlayers = document.querySelectorAll('#music audio');
    audioPlayers.forEach(player => {
        player.addEventListener('play', () => {
            audioPlayers.forEach(otherPlayer => {
                if (otherPlayer !== player) {
                    otherPlayer.pause();
                }
            });
        });
    });

    // --- Generic Slideshow Creation ---
    const createSlideshow = (galleryId, mediaData, mediaType) => {
        const galleryContainer = document.getElementById(`${galleryId}-gallery-container`);
        if (!galleryContainer) return;

        const mainMediaWrapper = document.getElementById(`main-${mediaType}-wrapper`);
        const thumbnailContainer = document.getElementById(`${mediaType}-thumbnail-container`);
        const prevBtn = document.getElementById(`${mediaType}-prev-btn`);
        const nextBtn = document.getElementById(`${mediaType}-next-btn`);
        
        if (!mainMediaWrapper || !thumbnailContainer || !prevBtn || !nextBtn) return;

        let currentMediaIndex = 0;
        mainMediaWrapper.innerHTML = '';
        thumbnailContainer.innerHTML = '';

        mediaData.forEach((mediaItem, index) => {
            const slideWrapper = document.createElement('div');
            // Use 'relative' for the slide wrapper to contain its absolute children
            slideWrapper.className = 'absolute top-0 left-0 w-full h-full'; 

            // Set initial opacity and pointer-events
            if (index === 0) {
                slideWrapper.style.opacity = '1';
                slideWrapper.style.pointerEvents = 'auto';
            } else {
                slideWrapper.style.opacity = '0';
                slideWrapper.style.pointerEvents = 'none';
            }

            let slide;

            if (mediaType === 'video') {
                slide = document.createElement('video');
                slide.src = mediaItem.src;
                slide.poster = mediaItem.poster;
                slide.controls = false; // Disable default controls
                slide.preload = 'metadata'; // Helps with getting duration and dimensions
                
                const objectFitClass = 'object-contain';
                slide.className = `w-full h-full ${objectFitClass} rounded-md`;
                
                const overlay = document.createElement('div');
                overlay.className = 'video-overlay';
                overlay.innerHTML = `
                    <span class="material-symbols-outlined play-icon">play_circle</span>
                    <span class="material-symbols-outlined pause-icon">pause_circle</span>
                `;
                
                slideWrapper.appendChild(slide);
                slideWrapper.appendChild(overlay);

                let fadeOutTimeout;
                const playIcon = overlay.querySelector('.play-icon');
                const pauseIcon = overlay.querySelector('.pause-icon');

                // Single function to update the icon based on video state
                const updateIcon = () => {
                    // This is the corrected, intuitive logic.
                    if (slide.paused) {
                        // If the video is paused, show the PLAY icon.
                        playIcon.style.display = 'none';
                        pauseIcon.style.display = 'block';
                    } else {
                        // If the video is playing, show the PAUSE icon.
                        playIcon.style.display = 'block';
                        pauseIcon.style.display = 'none';
                    }
                };

                const showAndFadeOverlay = () => {
                    clearTimeout(fadeOutTimeout);
                    overlay.classList.add('show');
                    if (!slide.paused) { // Only fade out if playing
                        fadeOutTimeout = setTimeout(() => {
                            overlay.classList.remove('show');
                        }, 800);
                    }
                };
                
                const showAndHoldOverlay = () => {
                    clearTimeout(fadeOutTimeout);
                    overlay.classList.add('show');
                };
                
                slide.addEventListener('play', () => { updateIcon(); showAndFadeOverlay(); });
                slide.addEventListener('pause', () => { updateIcon(); showAndHoldOverlay(); });
                slide.addEventListener('ended', () => { updateIcon(); showAndHoldOverlay(); });

                slideWrapper.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent potential conflicts
                    if (slide.paused) {
                        slide.play();
                    } else {
                        slide.pause();
                    }
                });
                
                // Set the initial icon state
                updateIcon();

            } else { // image
                slide = document.createElement('img');
                slide.src = mediaItem.src;
                slide.onerror = () => { slide.src = `https://placehold.co/1200x800/171122/ffffff?text=${mediaType}+Error`; };
                const objectFitClass = 'object-cover';
                slide.className = `w-full h-full ${objectFitClass} rounded-md`;
                slideWrapper.appendChild(slide);
            }
            
            slide.alt = mediaItem.alt;
            mainMediaWrapper.appendChild(slideWrapper);

            // Create thumbnail
            const thumb = document.createElement('img');
            thumb.src = mediaItem.thumb;
            thumb.alt = `Thumbnail for ${mediaItem.alt}`;
            thumb.className = 'thumbnail cursor-pointer w-24 h-16 object-cover rounded-md border-2 transition-all duration-300';
            thumb.classList.add(index === 0 ? 'opacity-100' : 'opacity-60', index === 0 ? 'border-brand-pink' : 'border-transparent');
             if(index === 0) thumb.classList.add('scale-105');
            thumb.addEventListener('click', () => showMedia(index));
            thumb.onerror = () => { thumb.src = 'https://placehold.co/120x80/171122/ffffff?text=Error'; };
            thumbnailContainer.appendChild(thumb);
        });

        const showMedia = (index) => {
            if (index === currentMediaIndex) return;

            const slideWrappers = mainMediaWrapper.querySelectorAll('.absolute');
            const thumbs = thumbnailContainer.querySelectorAll('img');

            const currentVideo = slideWrappers[currentMediaIndex].querySelector('video');
            if (currentVideo && typeof currentVideo.pause === 'function') {
                currentVideo.pause();
            }

            // Hide current slide and disable pointer events
            slideWrappers[currentMediaIndex].style.opacity = '0';
            slideWrappers[currentMediaIndex].style.pointerEvents = 'none';
            
            // Show new slide and enable pointer events
            slideWrappers[index].style.opacity = '1';
            slideWrappers[index].style.pointerEvents = 'auto';

            thumbs[currentMediaIndex].classList.remove('opacity-100', 'border-brand-pink', 'scale-105');
            thumbs[currentMediaIndex].classList.add('opacity-60', 'border-transparent');
            thumbs[index].classList.add('opacity-100', 'border-brand-pink', 'scale-105');
            thumbs[index].classList.remove('opacity-60', 'border-transparent');

            currentMediaIndex = index;
        };

        prevBtn.addEventListener('click', () => {
            const newIndex = (currentMediaIndex - 1 + mediaData.length) % mediaData.length;
            showMedia(newIndex);
        });

        nextBtn.addEventListener('click', () => {
            const newIndex = (currentMediaIndex + 1) % mediaData.length;
            showMedia(newIndex);
        });
    };

    // --- Initialize Galleries ---
    const videoData = [
        { src: 'assets/video/electric-pulse-trailer.mp4', poster: 'assets/images/trailer-still.png', thumb: 'assets/images/trailer-still.png', alt: 'Official Band Trailer' },
        { src: 'assets/video/jax-interview.mp4', poster: 'assets/images/interview-still.png', thumb: 'assets/images/interview-still.png', alt: 'Jax Interview' }
    ];

    const imageData = [
        { src: 'assets/images/gallery-image1.png', thumb: 'assets/images/gallery-image1.png', alt: 'Electric Pulse live on stage' },
        { src: 'assets/images/gallery-image2.png', thumb: 'assets/images/gallery-image2.png', alt: 'The crowd at an Electric Pulse show' },
        { src: 'assets/images/gallery-image3.png', thumb: 'assets/images/gallery-image3.png', alt: 'Jax performing a guitar solo' }
    ];
    
    createSlideshow('video', videoData, 'video');
    createSlideshow('image', imageData, 'image');


    // --- Parallax Hero Text ---
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            // Apply the effect only when the hero section is potentially in view
            if (scrollY < window.innerHeight) {
                // Move the text down at a slower rate than the scroll
                heroContent.style.transform = `translateY(${scrollY * 0.5}px)`;
                // Fade out the text as it moves down for a smoother transition
                heroContent.style.opacity = 1 - (scrollY / (window.innerHeight / 1.5));
            }
        });
    }
    
    // --- Band Member Modal ---
    const memberCards = document.querySelectorAll('.member-card');
    const modal = document.getElementById('member-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalImage = document.getElementById('modal-image');
    const modalName = document.getElementById('modal-name');
    const modalRole = document.getElementById('modal-role');
    const modalBio = document.getElementById('modal-bio');

    const bandMemberBios = {
        jax: {
            name: 'JAX',
            role: 'Lead Vocals & Synth-Guitar',
            image: 'assets/images/Jax.png',
            bio: "Jax is the supernova heart of Electric Pulse. Once a code-runner in the digital underworld, he traded his data streams for sound waves, programming his synth-guitar, 'Stardust', to sing with the fire of a dying star. His journey from the shadows of Neo-Kyoto to the galactic stage is etched into every lyric he screams, a tale of rebellion painted in neon and chrome."
        },
        cyra: {
            name: 'CYRA',
            role: 'Bass & Backing Vocals',
            image: 'assets/images/Cyra.png',
            bio: "Cyra, the silent force, provides the deep-space gravity for the band's sound. Raised in the orbital habitats above a terraformed Mars, she learned to play bass by feeling the rhythmic vibrations of the station's life support systems. Her bass lines are the steady, cosmic hum that grounds their chaotic energy, and her ethereal vocals are a haunting echo from the void between worlds."
        },
        nexo: {
            name: 'NEXO',
            role: 'Acoustic & Digital Drums',
            image: 'assets/images/Nexo.png',
            bio: "Nexo is the ghost in the machine, a rhythmic phantom who fuses the organic with the artificial. A former combat android who discovered a love for jazz and breakbeats in a forgotten archive, he reprogrammed his combat protocols for percussive precision. His hybrid kit, a mesh of reclaimed metal and holographic pads, creates a pulse that's both savagely primal and flawlessly futuristic."
        },
        orion: {
            name: 'ORION',
            role: 'Keys & Soundscapes',
            image: 'assets/images/Orion.png',
            bio: "Orion is the architect of dreams, the weaver of the band's sonic tapestry. A refugee from a dimension of pure sound, he translates the colors of nebulae and the whispers of black holes into vast, immersive soundscapes. His hands dance across a custom rig of vintage synthesizers and alien tech, creating the atmospheric storms and shimmering auroras that define the Electric Pulse universe."
        }
    };

    const openModal = (memberId) => {
        const member = bandMemberBios[memberId];
        if (member && modal) {
            modalImage.src = member.image;
            modalImage.alt = member.name;
            modalName.textContent = member.name;
            modalRole.textContent = member.role;
            modalBio.textContent = member.bio;
            modal.classList.remove('hidden');
        }
    };

    const closeModal = () => {
        if (modal) {
            modal.classList.add('hidden');
        }
    };

    memberCards.forEach(card => {
        card.addEventListener('click', () => {
            const memberId = card.dataset.member;
            openModal(memberId);
        });
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

});
