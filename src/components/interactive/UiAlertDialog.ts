export class UiAlertDialog extends HTMLElement {
    private isClosing = false;
    private autoCloseTimeout: number | null = null;

    constructor() {
        super();
    }

    connectedCallback() {
        this.initDialog();
    }

    disconnectedCallback() {
        if (this.autoCloseTimeout) {
            clearTimeout(this.autoCloseTimeout);
        }
    }

    private initDialog() {
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

        // Close button
        const closeBtn = this.querySelector(".alert-close");
        closeBtn?.addEventListener("click", () => {
            this.close();
        });
    }

    public show(
        message: string,
        type: "success" | "error" | "warning" | "info" = "info",
        options: {
            autoClose?: number; // milliseconds, 0 = no auto close
        } = {}
    ): void {
        // Update content
        const messageEl = this.querySelector(".alert-message");
        if (messageEl) messageEl.textContent = message;

        // Update icon and styling
        this.updateTypeStyles(type);

        // Prevent body scroll
        document.body.style.overflow = "hidden";

        // Show dialog
        this.classList.remove("hidden");
        this.classList.add("flex");

        // Animate
        requestAnimationFrame(() => {
            this.classList.add("animate-backdrop-in");
            const content = this.querySelector(".alert-content");
            if (content) {
                content.classList.add("animate-modal-in");
            }
        });

        // Focus dialog
        this.setAttribute("tabindex", "-1");
        this.focus();

        // Auto close if specified
        if (options.autoClose && options.autoClose > 0) {
            this.autoCloseTimeout = window.setTimeout(() => {
                this.close();
            }, options.autoClose);
        }
    }

    private updateTypeStyles(type: "success" | "error" | "warning" | "info") {
        // Hide all icons
        const icons = this.querySelectorAll(".alert-icon");
        icons.forEach((icon) => icon.classList.add("hidden"));

        // Show correct icon
        const iconEl = this.querySelector(`.alert-icon-${type}`);
        iconEl?.classList.remove("hidden");

        // Update icon container and glow
        const iconContainer = this.querySelector(".alert-icon-container");
        const glow = this.querySelector(".alert-glow");
        const closeBtn = this.querySelector(".alert-close");

        if (iconContainer) {
            iconContainer.className = "relative flex items-center justify-center w-12 h-12 rounded-full mb-4";
            if (type === "success") {
                iconContainer.classList.add("bg-status-success/10");
                iconEl?.classList.add("text-status-success");
                if (closeBtn) closeBtn.className = "alert-close px-4 py-2 rounded-lg text-sm font-medium text-white bg-status-success hover:bg-status-success/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-status-success/20";
                if (glow) glow.className = "alert-glow absolute inset-0 rounded-2xl bg-gradient-to-br from-status-success/10 via-transparent to-transparent pointer-events-none";
            } else if (type === "error") {
                iconContainer.classList.add("bg-status-error/10");
                iconEl?.classList.add("text-status-error");
                if (closeBtn) closeBtn.className = "alert-close px-4 py-2 rounded-lg text-sm font-medium text-white bg-status-error hover:bg-status-error/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-status-error/20";
                if (glow) glow.className = "alert-glow absolute inset-0 rounded-2xl bg-gradient-to-br from-status-error/10 via-transparent to-transparent pointer-events-none";
            } else if (type === "warning") {
                iconContainer.classList.add("bg-status-warning/10");
                iconEl?.classList.add("text-status-warning");
                if (closeBtn) closeBtn.className = "alert-close px-4 py-2 rounded-lg text-sm font-medium text-black bg-status-warning hover:bg-status-warning/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-status-warning/20";
                if (glow) glow.className = "alert-glow absolute inset-0 rounded-2xl bg-gradient-to-br from-status-warning/10 via-transparent to-transparent pointer-events-none";
            } else {
                iconContainer.classList.add("bg-status-info/10");
                iconEl?.classList.add("text-status-info");
                if (closeBtn) closeBtn.className = "alert-close px-4 py-2 rounded-lg text-sm font-medium text-white bg-status-info hover:bg-status-info/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-status-info/20";
                if (glow) glow.className = "alert-glow absolute inset-0 rounded-2xl bg-gradient-to-br from-status-info/10 via-transparent to-transparent pointer-events-none";
            }
        }
    }

    public close() {
        if (this.isClosing) return;
        this.isClosing = true;

        // Clear auto close timeout
        if (this.autoCloseTimeout) {
            clearTimeout(this.autoCloseTimeout);
            this.autoCloseTimeout = null;
        }

        // Animate out
        this.classList.add("animate-backdrop-out");
        const content = this.querySelector(".alert-content");
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
        }, 200);
    }
}

customElements.define("ui-alert-dialog", UiAlertDialog);
