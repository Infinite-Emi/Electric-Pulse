document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = window.location.origin; 

    // --- Get DOM Elements ---
    // Mobile Merch Bag Elements
    const merchBagIconMobile = document.getElementById('merch-bag-icon-mobile');
    const merchCountPillMobile = document.getElementById('merch-count-pill-mobile');
    
    // Desktop Merch Bag Elements
    const merchBagBtnDesktop = document.getElementById('merch-bag-btn-desktop');
    const merchCountPillDesktop = document.getElementById('merch-count-pill-desktop'); 

    // Mobile Menu Merch Bag Link
    const merchBagLinkMobileMenu = document.getElementById('merch-bag-link-mobile-menu');
    const merchCountMobileMenu = document.getElementById('merch-count-mobile-menu');

    // NEW: Bottom "View Merch Bag" Button
    const viewMerchBagBottomBtn = document.getElementById('view-merch-bag-bottom-btn');

    // Main Sections
    const merchProductsSection = document.getElementById('merch-products');
    const cartDisplaySection = document.getElementById('cart-display');

    // Cart Display Elements
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartEmptyMessage = document.getElementById('cart-empty-message');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const checkoutCartBtn = document.getElementById('checkout-cart-btn');

    // Notification Overlay
    const notificationOverlay = document.getElementById('notification-overlay');

    // Custom Confirmation Modal Elements
    const confirmationModalOverlay = document.getElementById('confirmation-modal-overlay');
    const confirmationModalMessage = document.getElementById('confirmation-modal-message');
    const confirmYesBtn = document.getElementById('confirm-yes-btn');
    const confirmNoBtn = document.getElementById('confirm-no-btn');

    // Hamburger Menu Elements
    const hamburgerButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    let cart = []; // Array to hold cart items

    // --- Notification System ---
    const showNotification = (message, type = 'info', duration = 3000) => {
        notificationOverlay.textContent = message;
        notificationOverlay.className = ``; 
        notificationOverlay.classList.add(`bg-${type === 'success' ? 'notification-success' : type === 'error' ? 'notification-error' : 'notification-info'}`);
        
        notificationOverlay.classList.remove('hidden'); 
        notificationOverlay.style.opacity = 1; 

        setTimeout(() => {
            notificationOverlay.style.opacity = 0; 
            setTimeout(() => {
                notificationOverlay.classList.add('hidden'); 
                notificationOverlay.className = `hidden`; 
            }, 300); 
        }, duration);
    };

    // --- Custom Confirmation Modal ---
    let resolveConfirmation; 

    const showConfirmation = (message) => {
        confirmationModalMessage.textContent = message;
        confirmationModalOverlay.classList.add('show'); 
        
        return new Promise((resolve) => {
            resolveConfirmation = resolve;
        });
    };

    const hideConfirmation = (result) => {
        confirmationModalOverlay.classList.remove('show');
        setTimeout(() => {
            if (resolveConfirmation) {
                resolveConfirmation(result);
                resolveConfirmation = null; 
            }
        }, 300); 
    };

    if (confirmYesBtn && confirmNoBtn) {
        confirmYesBtn.addEventListener('click', () => hideConfirmation(true));
        confirmNoBtn.addEventListener('click', () => hideConfirmation(false));
    }

    // --- Helper Functions ---
    const loadCart = () => {
        const storedCart = localStorage.getItem('electricPulseCart');
        if (storedCart) {
            try {
                cart = JSON.parse(storedCart);
            } catch (e) {
                console.error("Error parsing cart from localStorage:", e);
                cart = []; 
            }
        }
        updateCartUI(); 
    };

    const saveCart = () => {
        localStorage.setItem('electricPulseCart', JSON.stringify(cart));
    };

    const updateCartUI = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        if (merchCountPillMobile) {
            if (totalItems > 0) {
                merchCountPillMobile.textContent = totalItems;
                merchCountPillMobile.classList.remove('hidden');
            } else {
                merchCountPillMobile.classList.add('hidden');
            }
        }
        if (merchCountMobileMenu) {
            if (totalItems > 0) {
                merchCountMobileMenu.textContent = totalItems;
                merchCountMobileMenu.classList.remove('hidden');
            } else {
                merchCountMobileMenu.classList.add('hidden');
            }
        }

        if (merchCountPillDesktop && merchBagBtnDesktop) {
            if (totalItems > 0) {
                merchCountPillDesktop.textContent = totalItems;
                merchCountPillDesktop.classList.remove('hidden');
                merchBagBtnDesktop.classList.remove('hidden'); 
            } else {
                merchCountPillDesktop.classList.add('hidden');
                merchBagBtnDesktop.classList.add('hidden'); 
            }
        }

        renderCartItems(); 
    };

    const renderCartItems = () => {
        cartItemsContainer.innerHTML = ''; 
        let total = 0;

        if (cart.length === 0) {
            cartEmptyMessage.classList.remove('hidden');
            cartTotalSpan.textContent = '£0.00';
            if (checkoutCartBtn) checkoutCartBtn.disabled = true;
            if (clearCartBtn) clearCartBtn.disabled = true;
            return;
        } else {
            cartEmptyMessage.classList.add('hidden');
            if (checkoutCartBtn) checkoutCartBtn.disabled = false;
            if (clearCartBtn) clearCartBtn.disabled = false;
        }

        cart.forEach(item => {
            const itemTotal = item.price_gbp_cents * item.quantity;
            total += itemTotal;

            const displayName = item.size ? `${item.name} (${item.size})` : item.name;

            const itemElement = document.createElement('div');
            itemElement.classList.add('flex', 'flex-col', 'sm:flex-row', 'items-center', 'space-y-4', 'sm:space-y-0', 'sm:space-x-4', 'bg-card-bg-color', 'p-4', 'rounded-lg', 'shadow-sm');
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-md flex-shrink-0">
                <div class="flex-grow text-center sm:text-left">
                    <h4 class="text-lg font-bold text-white">${displayName}</h4>
                    <p class="text-gray-400">£${(item.price_gbp_cents / 100).toFixed(2)} each</p>
                </div>
                <div class="flex items-center space-x-2 flex-shrink-0">
                    <button class="quantity-btn bg-gray-600 text-white py-1 px-2 rounded-md hover:bg-gray-500 transition-colors" data-id="${item.id}" data-action="decrease">-</button>
                    <span class="text-xl text-white w-8 text-center">${item.quantity}</span>
                    <button class="quantity-btn bg-gray-600 text-white py-1 px-2 rounded-md hover:bg-gray-500 transition-colors" data-id="${item.id}" data-action="increase">+</button>
                </div>
                <span class="text-lg font-bold text-brand-pink w-32 text-center sm:text-right flex-shrink-0">£${(itemTotal / 100).toFixed(2)}</span>
                <button class="remove-from-cart-btn bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 transition-colors flex-shrink-0 ml-auto sm:ml-0" data-id="${item.id}">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotalSpan.textContent = `£${(total / 100).toFixed(2)}`;

        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });
        document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', handleRemoveItem);
        });
    };

    // --- Event Handlers ---
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productCard = event.target.closest('.merch-item-card');
            const productId = productCard.dataset.productId;
            const name = productCard.dataset.productName;
            const price_gbp_cents = parseInt(productCard.dataset.productPriceGbpCents);
            const image = productCard.dataset.productImage;
            const hasSizes = productCard.dataset.hasSizes === 'true';

            let size = null;
            let cartItemId = productId; 

            if (hasSizes) {
                const sizeSelect = productCard.querySelector('.size-select');
                size = sizeSelect ? sizeSelect.value : '';

                if (!size) {
                    showNotification("Please select a size for this item.", 'error');
                    return; 
                }
                cartItemId = `${productId}-${size}`; 
            }
            
            const existingItem = cart.find(item => item.id === cartItemId);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ id: cartItemId, productId, name, size, price_gbp_cents, image, quantity: 1 });
            }
            saveCart();
            updateCartUI();
            const notificationName = size ? `${name} (${size})` : name;
            showNotification(`${notificationName} added to merch bag!`, 'success');
        });
    });

    const handleQuantityChange = (event) => {
        const id = event.target.dataset.id; 
        const action = event.target.dataset.action;
        const itemIndex = cart.findIndex(item => item.id === id);

        if (itemIndex > -1) {
            if (action === 'increase') {
                cart[itemIndex].quantity++;
                const notificationName = cart[itemIndex].size ? `${cart[itemIndex].name} (${cart[itemIndex].size})` : cart[itemIndex].name;
                showNotification(`Quantity of ${notificationName} increased!`, 'info', 1500);
            } else if (action === 'decrease') {
                cart[itemIndex].quantity--;
                if (cart[itemIndex].quantity <= 0) {
                    const removedItemName = cart[itemIndex].size ? `${cart[itemIndex].name} (${cart[itemIndex].size})` : cart[itemIndex].name;
                    cart.splice(itemIndex, 1);
                    showNotification(`${removedItemName} removed from bag.`, 'info', 1500);
                } else {
                    const notificationName = cart[itemIndex].size ? `${cart[itemIndex].name} (${cart[itemIndex].size})` : cart[itemIndex].name;
                    showNotification(`Quantity of ${notificationName} decreased.`, 'info', 1500);
                }
            }
            saveCart();
            updateCartUI();
        }
    };

    const handleRemoveItem = (event) => {
        const id = event.target.closest('button').dataset.id; 
        const itemToRemove = cart.find(item => item.id === id);
        if (itemToRemove) {
            cart = cart.filter(item => item.id !== id);
            saveCart();
            updateCartUI();
            const notificationName = itemToRemove.size ? `${itemToRemove.name} (${itemToRemove.size})` : itemToRemove.name;
            showNotification(`${notificationName} removed from merch bag!`, 'success');
        }
    };

    const toggleCartDisplay = (event) => {
        event.preventDefault(); 
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }

        if (cartDisplaySection.classList.contains('hidden')) {
            merchProductsSection.classList.add('hidden'); 
            cartDisplaySection.classList.remove('hidden'); 
            renderCartItems(); 
        } else {
            merchProductsSection.classList.remove('hidden'); 
            cartDisplaySection.classList.add('hidden'); 
        }
    };

    if (merchBagIconMobile) merchBagIconMobile.addEventListener('click', toggleCartDisplay);
    if (merchBagBtnDesktop) merchBagBtnDesktop.addEventListener('click', toggleCartDisplay);
    if (merchBagLinkMobileMenu) merchBagLinkMobileMenu.addEventListener('click', toggleCartDisplay);
    // NEW: Add event listener for the new bottom button
    if (viewMerchBagBottomBtn) viewMerchBagBottomBtn.addEventListener('click', toggleCartDisplay);


    if (hamburgerButton && mobileMenu) {
        hamburgerButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', async () => {
            if (cart.length === 0) {
                showNotification("Your merch bag is already empty!", 'info');
                return;
            }
            const confirmed = await showConfirmation("Are you sure you want to clear your entire merch bag?");
            if (confirmed) {
                cart = [];
                saveCart();
                updateCartUI();
                showNotification("Merch bag cleared!", 'success');
            } else {
                showNotification("Clear bag cancelled.", 'info', 1500);
            }
        });
    }

    if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', toggleCartDisplay);

    if (checkoutCartBtn) {
        checkoutCartBtn.addEventListener('click', async () => {
            if (cart.length === 0) {
                showNotification("Your merch bag is empty! Add some items before checking out.", 'error');
                return;
            }

            const checkoutItems = cart.map(item => ({
                id: item.id, 
                name: item.size ? `${item.name} (${item.size})` : item.name,
                price_gbp_cents: item.price_gbp_cents,
                quantity: item.quantity,
                metadata: {
                    original_product_id: item.productId,
                    size: item.size || 'N/A'
                }
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
                    cart = [];
                    saveCart();
                    window.location.href = data.checkout_url;
                } else {
                    console.error('Error creating checkout session:', data);
                    showNotification(`Error: ${data.detail || 'Failed to create checkout session.'}`, 'error');
                }
            } catch (error) {
                console.error('Network or unexpected error:', error);
                showNotification('An unexpected error occurred. Please try again later.', 'error');
            } finally {
                checkoutCartBtn.innerHTML = '<span class="material-symbols-outlined">payment</span><span>Checkout</span>';
                checkoutCartBtn.disabled = false;
            }
        });
    }

    loadCart();
});