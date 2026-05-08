document.addEventListener('DOMContentLoaded', () => {

  const app = {
    throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    },

    focusTrap(element, closeCallback) {
      const focusableElements = element.querySelectorAll(
        'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];

      function handleKeyDown(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }

      element.addEventListener('keydown', handleKeyDown);
      firstFocusableElement?.focus();
      return () => element.removeEventListener('keydown', handleKeyDown);
    },

    formatRupiah(amount) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    },

    init() {
      this.cacheDOMElements();
      this.setupGlobalEventListeners();
      this.navbar.init();
      this.ui.init();
      this.lightbox.init();
      this.menu.init();
      this.cart.init();
      this.variantModal.init();
      this.paymentModal.init();
    },

    cacheDOMElements() {
      this.dom = {
        menu: document.querySelector('#menu-bars'),
        navbar: document.querySelector('header .flex .navbar'),
        sections: document.querySelectorAll('section'),
        navLinks: document.querySelectorAll('header .navbar a'),
        darkModeToggle: document.getElementById('darkModeToggle'),
        htmlElement: document.documentElement,
        loadMoreBtn: document.getElementById('loadMoreBtn'),
        menuContainer: document.querySelector('#menu .box-container'),
        menuFiltersContainer: document.querySelector('.menu-filters'),
        toastContainer: document.getElementById('toast-container'),
        cartIcon: document.getElementById('cart-icon'),
        cartCount: document.getElementById('cart-count'),
        cartSidebar: document.getElementById('cart-sidebar'),
        cartOverlay: document.getElementById('cart-overlay'),
        closeCartBtn: document.getElementById('close-cart'),
        cartItemsContainer: document.getElementById('cart-items-container'),
        cartTotalPrice: document.getElementById('cart-total-price'),
        checkoutBtn: document.querySelector('.checkout-btn'),
        clearCartBtn: document.getElementById('clear-cart-btn'),
        lightbox: {
          overlay: document.querySelector('.lightbox-overlay'),
          image: document.querySelector('.lightbox-image'),
          close: document.querySelector('.lightbox-close'),
          prev: document.querySelector('.lightbox-prev'),
          next: document.querySelector('.lightbox-next'),
        },
        variantModal: {
          overlay: document.getElementById('variant-modal-overlay'),
          modal: document.getElementById('variant-modal'),
          close: document.getElementById('close-variant-modal'),
          title: document.getElementById('variant-modal-title'),
          productImage: document.getElementById('variant-product-image'),
          productName: document.getElementById('variant-product-name'),
          productPrice: document.getElementById('variant-product-price'),
          flavorOptions: document.getElementById('flavor-options'),
          toppingOptions: document.getElementById('topping-options'),
          quantity: document.getElementById('variant-quantity'),
          decreaseBtn: document.getElementById('decrease-qty'),
          increaseBtn: document.getElementById('increase-qty'),
          addBtn: document.getElementById('add-variant-to-cart'),
        },
        paymentModal: {
          overlay: document.getElementById('payment-modal-overlay'),
          modal: document.getElementById('payment-modal'),
          close: document.getElementById('close-payment-modal'),
          cashBtn: document.getElementById('payment-cash'),
          transferBtn: document.getElementById('payment-transfer'),
          confirmForm: document.getElementById('payment-confirm-form'),
          paymentMethod: document.getElementById('selected-payment-method'),
          customerName: document.getElementById('customer-name'),
          customerPhone: document.getElementById('customer-phone'),
          customerAddress: document.getElementById('customer-address'),
          orderSummary: document.getElementById('order-summary'),
          finalTotal: document.getElementById('final-total'),
          confirmBtn: document.getElementById('confirm-order-btn'),
          bankInfo: document.getElementById('bank-info'),
          senderBankSection: document.getElementById('sender-bank-section'),
          senderAccountSection: document.getElementById('sender-account-section'),
          senderBank: document.getElementById('sender-bank'),
          senderAccount: document.getElementById('sender-account'),
          copyRekening: document.getElementById('copy-rekening'),
        }
      };
    },

    setupGlobalEventListeners() {
      document.body.addEventListener('click', (e) => {
        if (e.target.matches('.add-to-cart-btn')) {
          const item = {
            id: e.target.dataset.id,
            name: e.target.dataset.name,
            price: parseFloat(e.target.dataset.price),
            image: e.target.dataset.image,
          };
          if (item.id === 'menu-3') {
            this.variantModal.open(item);
          } else {
            this.cart.addItem(item);
            this.ui.showToast(`${item.name} berhasil masuk keranjang!`);
          }
        }
        if (e.target.matches('.cart-item-qty-btn.increase')) {
          this.cart.increaseQuantity(parseInt(e.target.dataset.index));
        }
        if (e.target.matches('.cart-item-qty-btn.decrease')) {
          this.cart.decreaseQuantity(parseInt(e.target.dataset.index));
        }
        if (e.target.matches('.cart-item-remove') || e.target.closest('.cart-item-remove')) {
          const btn = e.target.matches('.cart-item-remove') ? e.target : e.target.closest('.cart-item-remove');
          this.cart.removeItem(parseInt(btn.dataset.index));
        }
      });
    },

    // =========================
    // NAVBAR
    // =========================
    navbar: {
      init() {
        if (app.dom.menu) {
          app.dom.menu.onclick = () => this.toggle();
        }
        window.addEventListener('scroll', app.throttle(() => {
          this.hide();
          this.updateActiveLinkOnScroll();
        }, 100));
      },
      toggle() {
        app.dom.menu.classList.toggle('fa-times');
        app.dom.navbar.classList.toggle('active');
      },
      hide() {
        app.dom.menu.classList.remove('fa-times');
        app.dom.navbar.classList.remove('active');
      },
      updateActiveLinkOnScroll() {
        app.dom.sections.forEach(sec => {
          const top = window.scrollY;
          const height = sec.offsetHeight;
          const offset = sec.offsetTop - 150;
          const id = sec.getAttribute('id');
          if (top >= offset && top < offset + height) {
            app.dom.navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`header .navbar a[href*=${id}]`);
            if (activeLink) activeLink.classList.add('active');
          }
        });
      },
    },

    // =========================
    // UI
    // =========================
    ui: {
      init() {
        this.initTheme();
        if (app.dom.darkModeToggle) {
          app.dom.darkModeToggle.addEventListener('click', () => this.toggleTheme());
        }
      },
      initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
          this.setTheme(savedTheme);
        } else if (prefersDark) {
          this.setTheme('dark');
        } else {
          this.setTheme('light');
        }
      },
      setTheme(theme) {
        app.dom.htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (app.dom.darkModeToggle) {
          if (theme === 'dark') {
            app.dom.darkModeToggle.classList.replace('fa-moon', 'fa-sun');
          } else {
            app.dom.darkModeToggle.classList.replace('fa-sun', 'fa-moon');
          }
        }
      },
      toggleTheme() {
        const currentTheme = app.dom.htmlElement.getAttribute('data-theme');
        this.setTheme(currentTheme === 'light' ? 'dark' : 'light');
      },
      showToast(message, type = 'success') {
        if (!app.dom.toastContainer) return;
        const toast = document.createElement('div');
        toast.classList.add('toast', `toast-${type}`);
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        app.dom.toastContainer.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transform = 'translateX(110%)';
          setTimeout(() => toast.remove(), 400);
        }, 3000);
      },
    },

    // =========================
    // MENU
    // =========================
    menu: {
      itemsPerPage: 9,
      currentPage: 1,
      currentFilter: 'all',
      filteredItems: [],

      init() {
        this.setupEventListeners();
        this.fetchAndRenderMenu();
      },

      setupEventListeners() {
        if (app.dom.loadMoreBtn) {
          app.dom.loadMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.loadMore();
          });
        }
        if (app.dom.menuFiltersContainer) {
          app.dom.menuFiltersContainer.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn')) {
              this.handleFilterClick(e.target);
            }
          });
        }
      },

      fetchAndRenderMenu() {
        // Tampilkan loader sementara
        if (app.dom.menuContainer) {
          app.dom.menuContainer.innerHTML = `
            <div class="menu-loader-container" style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;padding:5rem 0;">
              <div class="menu-loader"></div>
            </div>`;
        }
        setTimeout(() => {
          this.renderMenu();
        }, 800);
      },

      handleFilterClick(target) {
        const activeBtn = app.dom.menuFiltersContainer.querySelector('.active');
        if (activeBtn) activeBtn.classList.remove('active');
        target.classList.add('active');
        this.currentFilter = target.dataset.filter;
        this.currentPage = 1;
        this.fetchAndRenderMenu();
      },

      renderMenu() {
        if (this.currentFilter === 'all') {
          this.filteredItems = [...menuData];
        } else {
          this.filteredItems = menuData.filter(item => item.category === this.currentFilter);
        }

        const itemsToShow = this.filteredItems.slice(0, this.itemsPerPage);

        if (app.dom.menuContainer) {
          if (itemsToShow.length === 0) {
            app.dom.menuContainer.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--gray);font-size:1.6rem;padding:4rem 0;">Tidak ada menu tersedia.</p>`;
          } else {
            app.dom.menuContainer.innerHTML = itemsToShow.map(item => this.createMenuItemHTML(item)).join('');
          }
        }

        if (app.dom.loadMoreBtn && app.dom.loadMoreBtn.parentElement) {
          app.dom.loadMoreBtn.parentElement.style.display =
            this.filteredItems.length > this.itemsPerPage ? 'block' : 'none';
        }
      },

      loadMore() {
        this.currentPage++;
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = this.currentPage * this.itemsPerPage;
        const newItems = this.filteredItems.slice(start, end);
        if (app.dom.menuContainer) {
          app.dom.menuContainer.insertAdjacentHTML('beforeend', newItems.map(item => this.createMenuItemHTML(item)).join(''));
        }
        if (end >= this.filteredItems.length && app.dom.loadMoreBtn && app.dom.loadMoreBtn.parentElement) {
          app.dom.loadMoreBtn.parentElement.style.display = 'none';
        }
      },

      createMenuItemHTML(item) {
        return `
          <div class="box">
            <div class="image">
              <img src="${item.image}" data-large-src="${item.image}" alt="${item.name}" class="menu-item-image">
            </div>
            <div class="content">
              <div class="stars">
                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
              </div>
              <h3>${item.name}</h3>
              <p>${item.description}</p>
              <div class="price-action">
                <button class="btn add-to-cart-btn"
                  data-id="${item.id}"
                  data-name="${item.name}"
                  data-price="${item.price}"
                  data-image="${item.image}">
                  Tambah Keranjang
                </button>
                <span class="price">${app.formatRupiah(item.price)}</span>
              </div>
            </div>
          </div>`;
      },
    },

    // =========================
    // LIGHTBOX
    // =========================
    lightbox: {
      currentImageIndex: 0,
      galleryImages: [],
      removeFocusTrap: null,

      init() {
        const { overlay, close, next, prev } = app.dom.lightbox;
        if (!overlay) return;

        if (app.dom.menuContainer) {
          app.dom.menuContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-item-image')) {
              this.galleryImages = Array.from(
                app.dom.menuContainer.querySelectorAll('.menu-item-image')
              ).map(img => img.getAttribute('data-large-src') || img.src);
              this.currentImageIndex = this.galleryImages.indexOf(
                e.target.getAttribute('data-large-src') || e.target.src
              );
              this.open(this.galleryImages[this.currentImageIndex]);
            }
          });
        }

        close.addEventListener('click', () => this.close());
        next.addEventListener('click', () => this.showNext());
        prev.addEventListener('click', () => this.showPrev());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.close(); });
        document.addEventListener('keydown', (e) => {
          if (!overlay.classList.contains('active')) return;
          if (e.key === 'Escape') this.close();
          else if (e.key === 'ArrowRight') this.showNext();
          else if (e.key === 'ArrowLeft') this.showPrev();
        });
      },

      open(src) {
        app.dom.lightbox.image.src = src;
        app.dom.lightbox.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.removeFocusTrap = app.focusTrap(app.dom.lightbox.overlay, () => this.close());
      },
      close() {
        app.dom.lightbox.overlay.classList.remove('active');
        document.body.style.overflow = '';
        if (this.removeFocusTrap) this.removeFocusTrap();
      },
      showNext() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.galleryImages.length;
        app.dom.lightbox.image.src = this.galleryImages[this.currentImageIndex];
      },
      showPrev() {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
        app.dom.lightbox.image.src = this.galleryImages[this.currentImageIndex];
      },
    },

    // =========================
    // CART
    // =========================
    cart: {
      items: [],
      removeFocusTrap: null,

      init() {
        this.loadFromStorage();
        if (app.dom.cartIcon) app.dom.cartIcon.addEventListener('click', () => this.toggle());
        if (app.dom.closeCartBtn) app.dom.closeCartBtn.addEventListener('click', () => this.toggle());
        if (app.dom.cartOverlay) app.dom.cartOverlay.addEventListener('click', () => this.toggle());
        if (app.dom.checkoutBtn) app.dom.checkoutBtn.addEventListener('click', () => this.checkout());
        if (app.dom.clearCartBtn) app.dom.clearCartBtn.addEventListener('click', () => this.clear());
      },

      toggle() {
        if (!app.dom.cartSidebar || !app.dom.cartOverlay) return;
        const isActive = app.dom.cartSidebar.classList.toggle('active');
        app.dom.cartOverlay.classList.toggle('active');
        if (isActive) {
          this.removeFocusTrap = app.focusTrap(app.dom.cartSidebar, () => this.toggle());
        } else {
          if (this.removeFocusTrap) this.removeFocusTrap();
        }
      },

      addItem(itemToAdd, skipDuplicateCheck = false) {
        if (itemToAdd.variants || skipDuplicateCheck) {
          const idx = this.items.findIndex(item =>
            item.id === itemToAdd.id &&
            item.variants &&
            item.variants.flavor === itemToAdd.variants?.flavor &&
            JSON.stringify(item.variants.toppings?.sort()) === JSON.stringify(itemToAdd.variants?.toppings?.sort())
          );
          if (idx !== -1) {
            this.items[idx].quantity += (itemToAdd.quantity || 1);
          } else {
            this.items.push({ ...itemToAdd, quantity: itemToAdd.quantity || 1 });
          }
        } else {
          const existing = this.items.find(item => item.id === itemToAdd.id && !item.variants);
          if (existing) {
            existing.quantity++;
          } else {
            this.items.push({ ...itemToAdd, quantity: 1 });
          }
        }
        this.render();
        this.saveToStorage();
      },

      removeItem(index) {
        this.items.splice(index, 1);
        this.render();
        this.saveToStorage();
        app.ui.showToast('Item dihapus dari keranjang');
      },

      increaseQuantity(index) {
        this.items[index].quantity++;
        this.render();
        this.saveToStorage();
      },

      decreaseQuantity(index) {
        if (this.items[index].quantity > 1) {
          this.items[index].quantity--;
          this.render();
          this.saveToStorage();
        } else {
          this.removeItem(index);
        }
      },

      calculateTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      render() {
        if (!app.dom.cartItemsContainer || !app.dom.cartTotalPrice) return;
        if (this.items.length === 0) {
          app.dom.cartItemsContainer.innerHTML = '<p class="cart-empty">Keranjang Anda kosong.</p>';
        } else {
          app.dom.cartItemsContainer.innerHTML = this.items.map((item, index) => `
            <div class="cart-item">
              <img src="${item.image}" alt="${item.name}">
              <div class="cart-item-details">
                <h4>${item.name}</h4>
                ${item.variantText ? `<p class="cart-variant-text">${item.variantText}</p>` : ''}
                <p class="cart-item-price">${app.formatRupiah(item.price)}</p>
              </div>
              <div class="cart-item-actions">
                <div class="cart-item-quantity-control">
                  <button class="cart-item-qty-btn decrease" data-index="${index}">-</button>
                  <div class="cart-item-quantity">${item.quantity}</div>
                  <button class="cart-item-qty-btn increase" data-index="${index}">+</button>
                </div>
                <button class="cart-item-remove" data-index="${index}" aria-label="Hapus item">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>`).join('');
        }
        app.dom.cartTotalPrice.textContent = app.formatRupiah(this.calculateTotal());
        this.updateCartIcon();
      },

      updateCartIcon() {
        if (!app.dom.cartCount) return;
        const total = this.items.reduce((sum, item) => sum + item.quantity, 0);
        app.dom.cartCount.textContent = total;
        app.dom.cartCount.style.display = total > 0 ? 'flex' : 'none';
      },

      saveToStorage() {
        localStorage.setItem('restoCart', JSON.stringify(this.items));
      },

      loadFromStorage() {
        try {
          const stored = localStorage.getItem('restoCart');
          if (stored) this.items = JSON.parse(stored);
        } catch(e) {
          this.items = [];
        }
        this.render();
      },

      checkout() {
        if (this.items.length === 0) {
          app.ui.showToast('Keranjang Anda kosong!', 'error');
          return;
        }
        app.paymentModal.open();
      },

      clear() {
        if (this.items.length > 0) {
          this.items = [];
          this.render();
          this.saveToStorage();
          app.ui.showToast('Semua item dihapus.');
        }
      },
    },

    // =========================
    // VARIANT MODAL
    // =========================
    variantModal: {
      currentItem: null,
      removeFocusTrap: null,

      init() {
        const { close, overlay, decreaseBtn, increaseBtn, addBtn } = app.dom.variantModal;
        if (close) close.addEventListener('click', () => this.close());
        if (overlay) overlay.addEventListener('click', () => this.close());
        if (decreaseBtn) {
          decreaseBtn.addEventListener('click', () => {
            const qty = app.dom.variantModal.quantity;
            if (parseInt(qty.value) > 1) qty.value = parseInt(qty.value) - 1;
          });
        }
        if (increaseBtn) {
          increaseBtn.addEventListener('click', () => {
            const qty = app.dom.variantModal.quantity;
            qty.value = parseInt(qty.value) + 1;
          });
        }
        if (addBtn) addBtn.addEventListener('click', () => this.addToCart());
      },

      open(item) {
        this.currentItem = item;
        const { modal, overlay, productImage, productName, productPrice, quantity, flavorOptions, toppingOptions } = app.dom.variantModal;
        productImage.src = item.image;
        productName.textContent = item.name;
        productPrice.textContent = app.formatRupiah(item.price);
        quantity.value = 1;
        const firstFlavor = flavorOptions.querySelector('input[type="radio"]');
        if (firstFlavor) firstFlavor.checked = true;
        toppingOptions.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.removeFocusTrap = app.focusTrap(modal, () => this.close());
      },

      close() {
        const { modal, overlay } = app.dom.variantModal;
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        if (this.removeFocusTrap) this.removeFocusTrap();
      },

      addToCart() {
        const selectedFlavor = app.dom.variantModal.flavorOptions.querySelector('input[type="radio"]:checked');
        const flavor = selectedFlavor ? selectedFlavor.value : 'Matcha';
        const selectedToppings = Array.from(
          app.dom.variantModal.toppingOptions.querySelectorAll('input[type="checkbox"]:checked')
        ).map(c => c.value);
        const quantity = parseInt(app.dom.variantModal.quantity.value);
        const cartItem = {
          ...this.currentItem,
          variants: { flavor, toppings: selectedToppings },
          variantText: this.getVariantText(flavor, selectedToppings),
          quantity,
        };
        app.cart.addItem(cartItem, true);
        app.ui.showToast(`${quantity}x ${cartItem.name} (${cartItem.variantText}) ditambahkan!`);
        this.close();
      },

      getVariantText(flavor, toppings) {
        let text = `Rasa: ${flavor}`;
        if (toppings.length > 0) text += `, Topping: ${toppings.join(', ')}`;
        return text;
      },
    },

    // =========================
    // PAYMENT MODAL
    // =========================
    paymentModal: {
      selectedPayment: '',
      removeFocusTrap: null,

      init() {
        const { close, overlay, cashBtn, transferBtn, confirmBtn, copyRekening } = app.dom.paymentModal;
        if (close) close.addEventListener('click', () => this.close());
        if (overlay) overlay.addEventListener('click', () => this.close());
        if (cashBtn) cashBtn.addEventListener('click', () => this.selectPayment('cash'));
        if (transferBtn) transferBtn.addEventListener('click', () => this.selectPayment('transfer'));
        if (confirmBtn) confirmBtn.addEventListener('click', () => this.confirmOrder());
        if (copyRekening) copyRekening.addEventListener('click', () => this.copyRekeningNumber());
      },

      open() {
        const { modal, overlay, confirmForm, orderSummary, finalTotal, bankInfo, senderBankSection, senderAccountSection,
                customerName, customerPhone, customerAddress, senderBank, senderAccount } = app.dom.paymentModal;

        this.selectedPayment = '';
        confirmForm.style.display = 'none';
        bankInfo.style.display = 'none';
        senderBankSection.style.display = 'none';
        senderAccountSection.style.display = 'none';
        document.querySelectorAll('.payment-option').forEach(btn => btn.classList.remove('selected'));

        if (customerName) customerName.value = '';
        if (customerPhone) customerPhone.value = '';
        if (customerAddress) customerAddress.value = '';
        if (senderBank) senderBank.value = '';
        if (senderAccount) senderAccount.value = '';

        const cartItems = app.cart.items;
        const total = app.cart.calculateTotal();

        let summaryHTML = '<div class="order-items">';
        cartItems.forEach(item => {
          summaryHTML += `
            <div class="summary-item">
              <span>${item.quantity}x ${item.name}</span>
              <span>${app.formatRupiah(item.price * item.quantity)}</span>
            </div>`;
          if (item.variantText) {
            summaryHTML += `<div class="summary-variant">${item.variantText}</div>`;
          }
        });
        summaryHTML += '</div>';

        orderSummary.innerHTML = summaryHTML;
        finalTotal.textContent = app.formatRupiah(total);

        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.removeFocusTrap = app.focusTrap(modal, () => this.close());
      },

      close() {
        const { modal, overlay } = app.dom.paymentModal;
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        if (this.removeFocusTrap) this.removeFocusTrap();
      },

      selectPayment(method) {
        this.selectedPayment = method;
        const { confirmForm, paymentMethod, cashBtn, transferBtn, bankInfo, senderBankSection, senderAccountSection } = app.dom.paymentModal;
        cashBtn.classList.remove('selected');
        transferBtn.classList.remove('selected');
        if (method === 'cash') {
          cashBtn.classList.add('selected');
          paymentMethod.textContent = 'Cash (Bayar di Tempat)';
          bankInfo.style.display = 'none';
          senderBankSection.style.display = 'none';
          senderAccountSection.style.display = 'none';
        } else {
          transferBtn.classList.add('selected');
          paymentMethod.textContent = 'Transfer Bank BCA';
          bankInfo.style.display = 'block';
          senderBankSection.style.display = 'block';
          senderAccountSection.style.display = 'block';
        }
        confirmForm.style.display = 'block';
      },

      confirmOrder() {
        const { customerName, customerPhone, customerAddress, senderBank, senderAccount } = app.dom.paymentModal;
        if (!this.selectedPayment) {
          app.ui.showToast('Silakan pilih metode pembayaran!', 'error'); return;
        }
        if (!customerName.value.trim()) {
          app.ui.showToast('Nama harus diisi!', 'error'); customerName.focus(); return;
        }
        if (!customerPhone.value.trim()) {
          app.ui.showToast('Nomor telepon harus diisi!', 'error'); customerPhone.focus(); return;
        }
        if (!customerAddress.value.trim()) {
          app.ui.showToast('Alamat harus diisi!', 'error'); customerAddress.focus(); return;
        }
        if (this.selectedPayment === 'transfer') {
          if (!senderBank.value) {
            app.ui.showToast('Silakan pilih bank pengirim!', 'error'); senderBank.focus(); return;
          }
          if (!senderAccount.value.trim()) {
            app.ui.showToast('Nomor rekening pengirim harus diisi!', 'error'); senderAccount.focus(); return;
          }
        }
        this.sendToWhatsApp(
          customerName.value.trim(),
          customerPhone.value.trim(),
          customerAddress.value.trim(),
          senderBank.value,
          senderAccount.value.trim()
        );
      },

      copyRekeningNumber() {
        const num = '3621274994';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(num)
            .then(() => app.ui.showToast('Nomor rekening berhasil disalin!'))
            .catch(() => this.fallbackCopy(num));
        } else {
          this.fallbackCopy(num);
        }
      },

      fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-999999px';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try {
          document.execCommand('copy');
          app.ui.showToast('Nomor rekening berhasil disalin!');
        } catch {
          app.ui.showToast('Gagal menyalin nomor rekening', 'error');
        }
        document.body.removeChild(ta);
      },

      sendToWhatsApp(name, phone, address, senderBank, senderAccount) {
        const cartItems = app.cart.items;
        const total = app.cart.calculateTotal();
        const paymentLabel = this.selectedPayment === 'cash' ? 'Cash (Bayar di Tempat)' : 'Transfer Bank BCA';

        let msg = `*PESANAN BARU - Piscok Caramel TwentyTree*\n\n`;
        msg += `*Data Customer:*\n`;
        msg += `• Nama: ${name}\n`;
        msg += `• No. Telepon: ${phone}\n`;
        msg += `• Alamat: ${address}\n\n`;
        msg += `*Metode Pembayaran:* ${paymentLabel}\n\n`;

        if (this.selectedPayment === 'transfer') {
          msg += `*Info Transfer Pengirim:*\n`;
          msg += `• Bank: ${senderBank}\n`;
          msg += `• No. Rekening: ${senderAccount}\n`;
          msg += `• Atas Nama: ${name}\n\n`;
        }

        msg += `*Detail Pesanan:*\n━━━━━━━━━━━━━━━━\n`;
        cartItems.forEach((item, i) => {
          msg += `${i + 1}. ${item.name}\n`;
          if (item.variantText) msg += `   ${item.variantText}\n`;
          msg += `   ${item.quantity}x ${app.formatRupiah(item.price)} = ${app.formatRupiah(item.price * item.quantity)}\n\n`;
        });
        msg += `━━━━━━━━━━━━━━━━\n*TOTAL: ${app.formatRupiah(total)}*\n\n`;

        if (this.selectedPayment === 'transfer') {
          msg += `*Rekening Tujuan Transfer:*\nBank: BCA\nNo. Rek: 3621274994\nA/n: Muhammad Faiz Anugrah\n\n`;
          msg += `━━━━━━━━━━━━━━━━\n*KIRIM BUKTI TRANSFER*\nMohon kirim foto/screenshot bukti transfer. Terima kasih!`;
        }

        const waURL = `https://wa.me/6287773033706?text=${encodeURIComponent(msg)}`;
        window.open(waURL, '_blank');

        if (this.selectedPayment === 'transfer') {
          setTimeout(() => this.showInstructionModal(), 800);
        }

        app.cart.clear();
        this.close();
        // Tutup cart sidebar jika sedang terbuka
        if (app.dom.cartSidebar && app.dom.cartSidebar.classList.contains('active')) {
          app.cart.toggle();
        }
        app.ui.showToast('Pesanan berhasil! Anda akan diarahkan ke WhatsApp.');
      },

      showInstructionModal() {
        const html = `
          <div class="instruction-modal-overlay" id="instruction-overlay">
            <div class="instruction-modal">
              <div class="instruction-header">
                <i class="fab fa-whatsapp"></i>
                <h3>Langkah Selanjutnya</h3>
              </div>
              <div class="instruction-body">
                <div class="instruction-step">
                  <div class="step-number">1</div>
                  <p><strong>Transfer</strong> sesuai total ke rekening BCA di chat WhatsApp</p>
                </div>
                <div class="instruction-step">
                  <div class="step-number">2</div>
                  <p><strong>Screenshot</strong> bukti transfer dari m-banking/ATM</p>
                </div>
                <div class="instruction-step">
                  <div class="step-number">3</div>
                  <p><strong>Kirim foto bukti transfer</strong> melalui WhatsApp (klik 📎 → Gallery)</p>
                </div>
                <div class="instruction-step">
                  <div class="step-number">4</div>
                  <p>Admin akan <strong>memverifikasi</strong> dan memproses pesanan Anda</p>
                </div>
              </div>
              <div class="instruction-footer">
                <button class="btn" onclick="document.getElementById('instruction-overlay').remove()">
                  Mengerti, Saya Akan Mengirim Bukti Transfer!
                </button>
              </div>
            </div>
          </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
      },
    },
  };

  app.init();
});

// =========================
// DATA MENU
// =========================
const menuData = [
  { id: "menu-1", name: "Piscok Keju",       price: 1000, image: "menu-1.jpg", description: "Piscok crispy dengan isian keju lumer yang gurih dan manis, bikin nagih!", category: "speciality" },
  { id: "menu-2", name: "Piscok Coklat",     price: 1000, image: "menu-2.jpg", description: "Piscok dengan coklat premium lumer di setiap gigitan, manis dan lezat.", category: "speciality" },
  { id: "menu-3", name: "Piscok Ketan",      price: 1000, image: "menu-3.jpg", description: "Lumer di mulut dengan rasa cream cheese yang lembut dan nagih.", category: "speciality" },
  { id: "menu-4", name: "Piscok Kacang Ijo", price: 1000, image: "menu-4.jpg", description: "Perpaduan pisang goreng crispy dengan isian kacang hijau yang creamy.", category: "speciality" },
  { id: "menu-5", name: "Piscok Blueberry",  price: 1000, image: "menu-5.jpg", description: "Piscok dengan topping blueberry manis segar yang memanjakan lidah.", category: "speciality" },
  { id: "menu-6", name: "Piscok Strawberry", price: 1000, image: "menu-6.jpg", description: "Piscok crispy dengan saus strawberry segar yang asam manis menggugah selera.", category: "speciality" },
];

const reviewData = [
  { name: "Sarah Johnson", image: "pic-1.png", date: "October 26, 2023", text: "Amazing! The piscok is super crispy outside and perfectly melted inside. Highly recommended!" },
  { name: "Mike Chen",     image: "pic-2.png", date: "October 22, 2023", text: "Best piscok in town! The chocolate filling is rich and the price is very affordable. Will order again." },
  { name: "Emma Davis",    image: "pic-3.png", date: "October 19, 2023", text: "Absolutely delicious! Fresh ingredients and generous portions. The cheese variant is my favorite." },
  { name: "Alex Martinez", image: "pic-4.png", date: "October 15, 2023", text: "Outstanding! Great variety of flavors and everything tastes authentic. Great value for money!" },
  { name: "David Lee",     image: "pic-1.png", date: "October 12, 2023", text: "A hidden gem! The blueberry piscok was amazing. Service was quick and staff very friendly." },
];