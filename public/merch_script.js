document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = window.location.origin; // Dynamically get base URL

    const cartIcon = document.getElementById('cart-icon');
    const cartCountPill = document.getElementById('cart-count-pill');
    const checkoutHeaderBtn = document.getElementById('checkout-header-btn');
    const merchProductsSection = document.getElementById('merch-products');
    const cartDisplaySection = document.getElementById('cart-display');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartEmptyMessage = document.getElementById('cart-empty-message');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const checkoutCartBtn = document.getElementById('checkout-cart-btn');
    const notificationOverlay = document.getElementById('notification-overlay');

    let cart = []; // Array to hold cart items

    // --- Notification System ---
    const showNotification = (message, type = 'info', duration = 3000) => {
        notificationOverlay.textContent = message;
        notificationOverlay.className = `notification hidden ${type}`; // Reset classes, add type
        notificationOverlay.classList.add('show', `bg-${type === 'success' ? 'notification-success' : type === 'error' ? 'notification-error' : 'notification-info'}`);
        
        // Use a short delay for animation if needed, or rely on CSS `animation` properties
        notificationOverlay.classList.remove('hidden');
        notificationOverlay.style.opacity = 1;

        // Set a timeout to hide the notification
        setTimeout(() => {
            notificationOverlay.style.opacity = 0; // Start fade out
            setTimeout(() => {
                notificationOverlay.classList.add('hidden'); // Hide completely after fade
            }, 300); // Match CSS transition duration
        }, duration);
    };


    // --- Helper Functions ---

    // Load cart from localStorage
    const loadCart = () => {
        const storedCart = localStorage.getItem('electricPulseCart');
        if (storedCart) {
            try {
                cart = JSON.parse(storedCart);
            } catch (e) {
                console.error("Error parsing cart from localStorage:", e);
                cart = []; // Reset if corrupted
            }
        }
        updateCartUI();
    };

    // Save cart to localStorage
    const saveCart = () => {
        localStorage.setItem('electricPulseCart', JSON.stringify(cart));
    };

    // Update cart icon pill and header checkout button visibility
    const updateCartUI = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            cartCountPill.textContent = totalItems;
            cartCountPill.classList.remove('hidden');
            checkoutHeaderBtn.classList.remove('hidden');
        } else {
            cartCountPill.classList.add('hidden');
            checkoutHeaderBtn.classList.add('hidden');
        }

        renderCartItems(); // Re-render cart contents when UI updates
    };

    // Render cart items in the cart display section
    const renderCartItems = () => {
        cartItemsContainer.innerHTML = ''; // Clear current items
        let total = 0;

        if (cart.length === 0) {
            cartEmptyMessage.classList.remove('hidden');
            cartTotalSpan.textContent = '£0.00';
            // Disable checkout and clear buttons if cart is empty
            checkoutCartBtn.disabled = true;
            clearCartBtn.disabled = true;
            return;
        } else {
            cartEmptyMessage.classList.add('hidden');
            // Enable buttons if items are present
            checkoutCartBtn.disabled = false;
            clearCartBtn.disabled = false;
        }

        cart.forEach(item => {
            const itemTotal = item.price_gbp_cents * item.quantity;
            total += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.classList.add('flex', 'flex-col', 'md:flex-row', 'items-center', 'justify-between', 'bg-card-bg-color', 'p-4', 'rounded-lg', 'shadow-sm', 'space-y-4', 'md:space-y-0');
            itemElement.innerHTML = `
                <div class="flex items-center space-x-4 w-full md:w-auto">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md flex-shrink-0">
                    <div>
                        <h4 class="text-lg font-bold text-white">${item.name}</h4>
                        <p class="text-gray-400">£${(item.price_gbp_cents / 100).toFixed(2)} each</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4 justify-end w-full md:w-auto">
                    <button class="quantity-btn bg-gray-600 text-white py-1 px-2 rounded-md hover:bg-gray-500 transition-colors" data-id="${item.id}" data-action="decrease">-</button>
                    <span class="text-xl text-white w-8 text-center">${item.quantity}</span>
                    <button class="quantity-btn bg-gray-600 text-white py-1 px-2 rounded-md hover:bg-gray-500 transition-colors" data-id="${item.id}" data-action="increase">+</button>
                    <span class="text-lg font-bold text-brand-pink w-24 text-right">£${(itemTotal / 100).toFixed(2)}</span>
                    <button class="remove-from-cart-btn bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 transition-colors" data-id="${item.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotalSpan.textContent = `£${(total / 100).toFixed(2)}`;

        // Add event listeners for quantity buttons and remove buttons
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });
        document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', handleRemoveItem);
        });
    };

    // --- Event Handlers ---

    // Add to Cart
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productCard = event.target.closest('.merch-item-card');
            const id = productCard.dataset.productId;
            const name = productCard.dataset.productName;
            const price_gbp_cents = parseInt(productCard.dataset.productPriceGbpCents);
            const image = productCard.dataset.productImage;

            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ id, name, price_gbp_cents, image, quantity: 1 });
            }
            saveCart();
            updateCartUI();
            showNotification(`${name} added to merch bag!`, 'success');
        });
    });

    // Handle quantity changes in cart
    const handleQuantityChange = (event) => {
        const id = event.target.dataset.id;
        const action = event.target.dataset.action;
        const itemIndex = cart.findIndex(item => item.id === id);

        if (itemIndex > -1) {
            if (action === 'increase') {
                cart[itemIndex].quantity++;
                showNotification(`Quantity of ${cart[itemIndex].name} increased!`, 'info', 1500);
            } else if (action === 'decrease') {
                cart[itemIndex].quantity--;
                if (cart[itemIndex].quantity <= 0) {
                    // If quantity drops to 0 or less, remove item
                    const removedItemName = cart[itemIndex].name;
                    cart.splice(itemIndex, 1);
                    showNotification(`${removedItemName} removed from bag.`, 'info', 1500);
                } else {
                    showNotification(`Quantity of ${cart[itemIndex].name} decreased.`, 'info', 1500);
                }
            }
            saveCart();
            updateCartUI();
        }
    };

    // Handle removing item from cart
    const handleRemoveItem = (event) => {
        const id = event.target.closest('button').dataset.id;
        const itemToRemove = cart.find(item => item.id === id);
        if (itemToRemove) {
            cart = cart.filter(item => item.id !== id);
            saveCart();
            updateCartUI();
            showNotification(`${itemToRemove.name} removed from merch bag!`, 'success');
        }
    };

    // Toggle cart display
    const toggleCartDisplay = (event) => {
        event.preventDefault(); // Prevent default link behavior for '#' hrefs
        if (cartDisplaySection.classList.contains('hidden')) {
            merchProductsSection.classList.add('hidden'); // Hide products
            cartDisplaySection.classList.remove('hidden'); // Show cart
            renderCartItems(); // Ensure cart is up-to-date
        } else {
            merchProductsSection.classList.remove('hidden'); // Show products
            cartDisplaySection.classList.add('hidden'); // Hide cart
        }
    };

    cartIcon.addEventListener('click', toggleCartDisplay);
    checkoutHeaderBtn.addEventListener('click', toggleCartDisplay); // Header checkout button also opens cart

    // Clear entire cart
    clearCartBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear your entire merch bag?")) {
            cart = [];
            saveCart();
            updateCartUI();
            showNotification("Merch bag cleared!", 'success');
        }
    });

    // Continue Shopping button
    continueShoppingBtn.addEventListener('click', toggleCartDisplay);

    // --- Checkout with Stripe ---
    checkoutCartBtn.addEventListener('click', async () => {
        if (cart.length === 0) {
            showNotification("Your merch bag is empty! Add some items before checking out.", 'error');
            return;
        }

        // Prepare items for Stripe API
        const checkoutItems = cart.map(item => ({
            id: item.id,
            name: item.name,
            price_gbp_cents: item.price_gbp_cents,
            quantity: item.quantity
        }));

        try {
            checkoutCartBtn.textContent = 'Processing...';
            checkoutCartBtn.disabled = true;
            showNotification("Initiating checkout...", 'info');

            const response = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: checkoutItems }),
            });

            const data = await response.json();

            if (response.ok) {
                // Clear cart after successful checkout session creation
                cart = [];
                saveCart();
                // Redirect to Stripe Checkout page
                window.location.href = data.checkout_url;
            } else {
                console.error('Error creating checkout session:', data);
                showNotification(`Error: ${data.detail || 'Failed to create checkout session.'}`, 'error');
            }
        } catch (error) {
            console.error('Network or unexpected error:', error);
            showNotification('An unexpected error occurred. Please try again later.', 'error');
        } finally {
            // Revert button text and enable it (unless redirected)
            checkoutCartBtn.innerHTML = '<i class="fas fa-money-check-alt"></i><span>Checkout</span>';
            checkoutCartBtn.disabled = false;
        }
    });

    // Initial load
    loadCart();
});