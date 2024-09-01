document.addEventListener("DOMContentLoaded", function () {
    const lookbookModal = document.querySelector(".lookbook__modal");
    const lookbookModalContent = lookbookModal?.querySelector(".lookbook__modal-content");
    const triggerElements = document.querySelectorAll(".lookbook__triger button, .lookbook__modal, .modal-content__close");

    triggerElements.forEach((element) =>
        element?.addEventListener("click", () => toggleModal())
    );

    lookbookModalContent?.addEventListener("click", (event) =>
        event.stopPropagation()
    );

    function toggleModal(isShow) {
        if (!lookbookModal) return;
        const isActiveModal = isShow ? isShow : lookbookModal.classList.contains("lookbook__modal--active");

        lookbookModal.classList.toggle("lookbook__modal--active", !isActiveModal);
        document.body.classList.toggle("overflow-hidden", !isActiveModal);

        !isActiveModal ? document.addEventListener('keydown', handleKeyDown) : document.removeEventListener('keydown', handleKeyDown);
    }


    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            toggleModal(true);
        }
    }

    class lookbookProduct extends HTMLElement {
        constructor() {
            super();

            this.form = this.querySelector("form");
            this.selector = this.querySelector("select");
            this.sectionId = "lookbook-item-api";
            this.variantContainer = this.parentElement;
            this.errorContainer = this.querySelector(".lookbook-actions__form-error");
            this.cart =
                document.querySelector("cart-notification") ||
                document.querySelector("cart-drawer");
            this.cartMethods = this.initializeCartMethods();

            this.sectionCache = {};
        }

        connectedCallback() {
            this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
            this.selector?.addEventListener("change", this.onChangeVariant.bind(this));
        }

        async onChangeVariant() {
            const productUrl = this.generateProductUrl(this.sectionId, this.selector);
            const source = this.sectionCache[this.selector.value]
                ? this.sectionCache[this.selector.value]
                : await this.fetchAndParseMarkup(productUrl);

            if (!this.sectionCache[this.selector.value]) {
                this.sectionCache[this.selector.value] = source;
            }
            if (source && this.variantContainer) {
                this.variantContainer.replaceWith(source);
            } else {
                console.error("No valid source found in fetched markup.");
            }
        }

        async fetchAndParseMarkup(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(
                        `Network response was not ok: ${response.statusText}`
                    );
                }

                const resText = await response.text();
                const html = new DOMParser().parseFromString(resText, "text/html");
                const section = html.querySelector(".shopify-section");

                if (!section) {
                    throw new Error("No .shopify-section found in the fetched markup.");
                }

                return section.querySelector(".shopify-section > div");
            } catch (error) {
                console.error("Error fetching and parsing markup:", error);
            }
        }

        generateProductUrl(sectionId, selector) {
            const {
                value: variant,
                dataset: { url },
            } = selector;
            return `${url}?variant=${variant}&section_id=${sectionId}`;
        }

        initializeCartMethods() {
            if (!this.cart) return {};

            const { renderContents, getSectionsToRender } = this.cart;

            return {
                addProperty: getSectionsToRender
                    ? getSectionsToRender.bind(this.cart)
                    : null,
                updateCart: renderContents ? renderContents.bind(this.cart) : null,
                updateCartStatus: () => {
                    if (this.cart.classList.contains("is-empty")) {
                        this.cart.classList.remove("is-empty");
                    }
                },
            };
        }

        onSubmitHandler(event) {
            event.preventDefault();

            const config = fetchConfig("javascript");
            config.headers["X-Requested-With"] = "XMLHttpRequest";
            delete config.headers["Content-Type"];

            const formData = new FormData(this.form);

            if (this.cartMethods.addProperty) {
                const sections = this.cartMethods
                    .addProperty()
                    .map((section) => section.id);
                formData.append("sections", sections);
            }

            config.body = formData;

            fetch(`${window.Shopify.routes.root}cart/add.js`, config)
                .then((response) => response.json())
                .then((response) => {
                    if (response.status) {
                        this.error = true;
                        this.handleErrorNotification(
                            response.errors || response.description
                        );
                        return;
                    }

                    if (!this.cart) {
                        window.location = window.routes.cart_url;
                        return;
                    }
                    this.error = false;
                    if (!this.error && this.cartMethods.updateCartStatus) {
                        this.cartMethods.updateCartStatus();
                    }

                    if (!this.error && this.cartMethods.updateCart) {
                        this.cartMethods.updateCart(response);
                    }
                    if (!this.error) {
                        toggleModal && toggleModal(true);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }

        handleErrorNotification(errorText) {
            this.errorContainer.toggleAttribute('hidden', !errorText);
            if (this.errorContainer && errorText) {
                this.errorContainer.textContent = errorText;
            }

        }
    }

    customElements.define("lookbook-product", lookbookProduct);
});
