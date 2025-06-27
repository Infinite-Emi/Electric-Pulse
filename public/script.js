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
        input.classList.add('form-input-error');
        errorElement.textContent = message;
    };

    const clearError = (input) => {
        const errorElement = document.getElementById(`${input.id}-error`);
        input.classList.remove('form-input-error');
        errorElement.textContent = '';
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
        const phoneNumber = libphonenumber.parsePhoneNumberFromString(phone, 'GB');
        return phoneNumber && phoneNumber.isValid();
    };

    // Validates a single input and shows/hides its error message
    const validateInput = (input) => {
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
            if (input.value.trim() === '') {
                isFormValid = false;
                break;
            }
        }
        // Check email format if it's filled
         if (isFormValid && !validateEmail(emailInput.value.trim())) {
            isFormValid = false;
        }
        // Also check phone validity if it's filled
        if (isFormValid && !isPhoneValid(phoneInput.value)) {
            isFormValid = false;
        }
        submitButton.disabled = !isFormValid;
    };

    // Add event listeners
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('form-input-error')) {
                validateInput(input);
            }
            checkFormValidity();
        });
    });

    // Initially disable the button
    submitButton.disabled = true;

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            let isFormValid = true;
            inputs.forEach(input => {
                if (!validateInput(input)) isFormValid = false;
            });

            if (!isFormValid) {
                formResponse.textContent = 'Please fix the errors before submitting.';
                formResponse.classList.add('text-red-400');
                return;
            }
            
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            formResponse.textContent = '';
            formResponse.classList.remove('text-green-400', 'text-red-400');

            const formData = new FormData(contactForm);
            let fullPhoneNumber = '';
            if(formData.get('phone').trim()){
                 const phoneNumber = libphonenumber.parsePhoneNumberFromString(formData.get('phone').trim(), 'GB');
                 if(phoneNumber) fullPhoneNumber = phoneNumber.format('E.164');
            }

            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: fullPhoneNumber,
                company: formData.get('company'),
                eventType: formData.get('eventType'),
                message: formData.get('message')
            };

            const apiUrl = '/api/send-email';

            try {
                await new Promise(resolve => setTimeout(resolve, 1500)); 
                const response = { ok: true, json: () => Promise.resolve({ message: "Success" }) };
                
                if (response.ok) {
                    formResponse.textContent = "Thanks for reaching out! We'll get back to you soon.";
                    formResponse.classList.add('text-green-400');
                    contactForm.reset();
                    inputs.forEach(clearError); 
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
        if (mobileMenu.classList.contains('menu-open')) {
            mobileMenu.classList.remove('menu-open');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300); // Match CSS transition duration
        }
    };

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

    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });


    // --- Footer Year ---
    document.getElementById('year').textContent = new Date().getFullYear();

    // --- Header Scroll Effect ---
    const header = document.getElementById('header');
    window.onscroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('bg-opacity-95');
            header.classList.remove('bg-opacity-80');
        } else {
            header.classList.add('bg-opacity-80');
            header.classList.remove('bg-opacity-95');
        }
    };

    // --- Scroll-triggered Animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                const children = entry.target.querySelectorAll('.group, .merch-card, .max-w-4xl, .max-w-5xl, .max-w-2xl, #gallery-container');
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
            // When this player starts, pause all others
            audioPlayers.forEach(otherPlayer => {
                if (otherPlayer !== player) {
                    otherPlayer.pause();
                }
            });
        });
    });

    // --- Gallery Slideshow ---
    const galleryContainer = document.getElementById('gallery-container');
    if (galleryContainer) {
        const galleryImages = [
            { main: 'assets/images/gallery-image1.png', thumb: 'assets/images/gallery-image1.png', alt: 'Electric Pulse live on stage' },
            { main: 'assets/images/gallery-image2.png', thumb: 'assets/images/gallery-image2.png', alt: 'The crowd at an Electric Pulse show' },
            { main: 'assets/images/gallery-image3.png', thumb: 'assets/images/gallery-image3.png', alt: 'Jax performing a guitar solo' }
        ];

        const mainImageWrapper = document.getElementById('main-image-wrapper');
        const thumbnailContainer = document.getElementById('thumbnail-container');
        let currentImageIndex = 0;

        // Initialize gallery
        if(mainImageWrapper && thumbnailContainer) {
            mainImageWrapper.innerHTML = ''; // Clear previous images
            thumbnailContainer.innerHTML = ''; // Clear previous thumbs

            galleryImages.forEach((image, index) => {
                // Create main slide image
                const slide = document.createElement('img');
                slide.src = image.main;
                slide.alt = image.alt;
                slide.className = 'absolute top-0 left-0 w-full h-full object-cover rounded-md transition-opacity duration-700 ease-in-out';
                slide.style.opacity = index === 0 ? '1' : '0';
                slide.onerror = function() { this.onerror=null; this.src='https://placehold.co/1200x800/171122/ffffff?text=Image+Error'; };
                mainImageWrapper.appendChild(slide);

                // Create thumbnail image
                const thumb = document.createElement('img');
                thumb.src = image.thumb;
                thumb.alt = `Thumbnail for ${image.alt}`;
                thumb.className = 'thumbnail cursor-pointer w-24 h-16 object-cover rounded-md border-2 transition-all duration-300';
                thumb.classList.add(index === 0 ? 'opacity-100' : 'opacity-60', index === 0 ? 'border-brand-pink' : 'border-transparent');
                if(index === 0) thumb.classList.add('scale-105');
                thumb.addEventListener('click', () => showImage(index));
                thumb.onerror = function() { this.onerror=null; this.src='https://placehold.co/120x80/171122/ffffff?text=Error'; };
                thumbnailContainer.appendChild(thumb);
            });

            const showImage = (index) => {
                if(index === currentImageIndex) return; // Do nothing if clicking the current image
                
                // Update main images
                const slides = mainImageWrapper.querySelectorAll('img');
                slides[currentImageIndex].style.opacity = '0';
                slides[index].style.opacity = '1';

                // Update thumbnails
                const thumbs = thumbnailContainer.querySelectorAll('img');
                thumbs[currentImageIndex].classList.remove('opacity-100', 'border-brand-pink', 'scale-105');
                thumbs[currentImageIndex].classList.add('opacity-60', 'border-transparent');
                thumbs[index].classList.add('opacity-100', 'border-brand-pink', 'scale-105');
                thumbs[index].classList.remove('opacity-60', 'border-transparent');
                
                currentImageIndex = index;
            };

            document.getElementById('prev-btn').addEventListener('click', () => {
                const newIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
                showImage(newIndex);
            });

            document.getElementById('next-btn').addEventListener('click', () => {
                const newIndex = (currentImageIndex + 1) % galleryImages.length;
                showImage(newIndex);
            });
        }
    }
    
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

});
