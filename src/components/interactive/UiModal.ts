export class UiModal extends HTMLElement {
    private isClosing = false;
    private previouslyFocused: HTMLElement | null = null;

    constructor() {
        super();
    }

    connectedCallback() {
        this.initModal();
    }

    private initModal() {
        const id = this.id;

        // Listen for toggle events
        window.addEventListener(`toggle-modal-${id}`, () => {
            this.toggle();
        });

        // Close on background click
        this.addEventListener("click", (e) => {
            if (e.target === this && !this.isClosing) {
                this.close();
            }
        });

        // Close on ESC key
        this.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !this.isClosing) {
                this.close();
            }
        });
    }

    public toggle() {
        if (this.classList.contains("hidden")) {
            this.open();
        } else {
            this.close();
        }
    }

    public open() {
        // Save currently focused element
        this.previouslyFocused = document.activeElement as HTMLElement;

        // Prevent body scroll
        document.body.style.overflow = "hidden";

        // Show modal
        this.classList.remove("hidden");
        this.classList.add("flex");

        // Animate backdrop
        requestAnimationFrame(() => {
            this.classList.add("animate-backdrop-in");
            const content = this.querySelector(".modal-content");
            if (content) {
                content.classList.add("animate-modal-in");
            }
        });

        // Focus modal for keyboard navigation
        this.setAttribute("tabindex", "-1");
        this.focus();

        // Dispatch open event
        this.dispatchEvent(new CustomEvent("modal-opened", { bubbles: true }));
    }

    public close() {
        if (this.isClosing) return;
        this.isClosing = true;

        // Animate out
        this.classList.add("animate-backdrop-out");
        const content = this.querySelector(".modal-content");
        if (content) {
            content.classList.add("animate-modal-out");
        }

        // Wait for animation to complete
        setTimeout(() => {
            this.classList.add("hidden");
            this.classList.remove("flex", "animate-backdrop-out", "animate-backdrop-in");
            if (content) {
                content.classList.remove("animate-modal-out", "animate-modal-in");
            }

            // Restore body scroll
            document.body.style.overflow = "";

            // Restore focus
            if (this.previouslyFocused) {
                this.previouslyFocused.focus();
            }

            this.isClosing = false;

            // Dispatch close event
            this.dispatchEvent(new CustomEvent("modal-closed", { bubbles: true }));
        }, 200);
    }
}

customElements.define("ui-modal", UiModal);
