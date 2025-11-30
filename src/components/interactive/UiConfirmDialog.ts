export class UiConfirmDialog extends HTMLElement {
    private isClosing = false;
    private resolvePromise: ((value: boolean) => void) | null = null;

    constructor() {
        super();
    }

    connectedCallback() {
        this.initDialog();
    }

    private initDialog() {
        // Close on background click
        this.addEventListener("click", (e) => {
            if (e.target === this && !this.isClosing) {
                this.resolve(false);
            }
        });

        // Close on ESC key
        this.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !this.isClosing) {
                this.resolve(false);
            }
        });

        // Cancel button
        const cancelBtn = this.querySelector(".confirm-cancel");
        cancelBtn?.addEventListener("click", () => {
            this.resolve(false);
        });

        // Accept button
        const acceptBtn = this.querySelector(".confirm-accept");
        acceptBtn?.addEventListener("click", () => {
            this.resolve(true);
        });
    }

    public show(
        message: string,
        options: {
            title?: string;
            confirmText?: string;
            cancelText?: string;
            type?: "danger" | "warning" | "info";
        } = {}
    ): Promise<boolean> {
        return new Promise((resolve) => {
            this.resolvePromise = resolve;

            // Update content
            const titleEl = this.querySelector(".confirm-title");
            const messageEl = this.querySelector(".confirm-message");
            const cancelBtn = this.querySelector(".confirm-cancel");
            const acceptBtn = this.querySelector(".confirm-accept");

            if (titleEl) titleEl.textContent = options.title || "Confirmar acción";
            if (messageEl) messageEl.textContent = message;
            if (cancelBtn) cancelBtn.textContent = options.cancelText || "Cancelar";
            if (acceptBtn) acceptBtn.textContent = options.confirmText || "Confirmar";

            // Update styling based on type
            const type = options.type || "danger";
            const iconEl = this.querySelector(".confirm-content > div:first-child");
            if (iconEl) {
                iconEl.className = `relative flex items-center justify-center w-12 h-12 rounded-full mb-4`;
                if (type === "danger") {
                    iconEl.classList.add("bg-status-error/10");
                } else if (type === "warning") {
                    iconEl.classList.add("bg-status-warning/10");
                } else {
                    iconEl.classList.add("bg-status-info/10");
                }
            }

            // Prevent body scroll
            document.body.style.overflow = "hidden";

            // Show dialog
            this.classList.remove("hidden");
            this.classList.add("flex");

            // Animate
            requestAnimationFrame(() => {
                this.classList.add("animate-backdrop-in");
                const content = this.querySelector(".confirm-content");
                if (content) {
                    content.classList.add("animate-modal-in");
                }
            });

            // Focus accept button
            this.setAttribute("tabindex", "-1");
            this.focus();
        });
    }

    private resolve(value: boolean) {
        if (this.isClosing) return;
        this.isClosing = true;

        // Animate out
        this.classList.add("animate-backdrop-out");
        const content = this.querySelector(".confirm-content");
        if (content) {
            content.classList.add("animate-modal-out");
        }

        // Wait for animation
        setTimeout(() => {
            this.classList.add("hidden");
            this.classList.remove("flex", "animate-backdrop-out", "animate-backdrop-in");
            if (content) {
                content.classList.remove("animate-modal-out", "animate-modal-in");
            }

            // Restore body scroll
            document.body.style.overflow = "";

            this.isClosing = false;

            // Resolve promise
            if (this.resolvePromise) {
                this.resolvePromise(value);
                this.resolvePromise = null;
            }
        }, 200);
    }
}

customElements.define("ui-confirm-dialog", UiConfirmDialog);
