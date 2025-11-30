interface ToastOptions {
    type?: "success" | "error" | "warning" | "info";
    duration?: number; // milliseconds, 0 = no auto dismiss
}

class ToastManager {
    private container: UiToastContainer | null = null;
    private toastIdCounter = 0;
    private maxToasts = 5;

    public init() {
        // Create container if it doesn't exist
        if (!this.container) {
            this.container = document.querySelector("ui-toast-container");
            if (!this.container) {
                this.container = document.createElement("ui-toast-container") as UiToastContainer;
                this.container.id = "toast-container";
                this.container.className =
                    "fixed top-4 right-4 z-[70] flex flex-col gap-3 pointer-events-none";
                this.container.setAttribute("role", "region");
                this.container.setAttribute("aria-label", "Notificaciones");
                document.body.appendChild(this.container);
            }
        }
    }

    public show(message: string, options: ToastOptions = {}) {
        this.init();
        if (!this.container) return;

        const type = options.type || "info";
        const duration = options.duration !== undefined ? options.duration : 4000;

        // Remove oldest toast if we have too many
        const toasts = this.container.querySelectorAll(".toast-item");
        if (toasts.length >= this.maxToasts) {
            const oldest = toasts[0] as HTMLElement;
            this.removeToast(oldest);
        }

        // Create toast element
        const toast = this.createToastElement(message, type);
        this.container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add("animate-toast-in");
        });

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        // Close button
        const closeBtn = toast.querySelector(".toast-close");
        closeBtn?.addEventListener("click", () => {
            this.removeToast(toast);
        });
    }

    private createToastElement(message: string, type: "success" | "error" | "warning" | "info"): HTMLElement {
        const toast = document.createElement("div");
        toast.className =
            "toast-item pointer-events-auto w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-border-strong shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl p-4 flex items-start gap-3 transition-all";

        // Type-specific styling
        let iconSvg = "";
        let bgClass = "";
        let iconBg = "";
        let iconColor = "";

        switch (type) {
            case "success":
                bgClass = "bg-gradient-to-br from-status-success/20 to-surface-card/95";
                iconBg = "bg-status-success/20";
                iconColor = "text-status-success";
                iconSvg = `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;
                break;
            case "error":
                bgClass = "bg-gradient-to-br from-status-error/20 to-surface-card/95";
                iconBg = "bg-status-error/20";
                iconColor = "text-status-error";
                iconSvg = `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`;
                break;
            case "warning":
                bgClass = "bg-gradient-to-br from-status-warning/20 to-surface-card/95";
                iconBg = "bg-status-warning/20";
                iconColor = "text-status-warning";
                iconSvg = `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
                break;
            case "info":
                bgClass = "bg-gradient-to-br from-status-info/20 to-surface-card/95";
                iconBg = "bg-status-info/20";
                iconColor = "text-status-info";
                iconSvg = `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
                break;
        }

        toast.classList.add(bgClass);

        toast.innerHTML = `
            <div class="flex-shrink-0 w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}">
                ${iconSvg}
            </div>
            <p class="flex-1 text-sm text-content-primary leading-relaxed">${this.escapeHtml(message)}</p>
            <button class="toast-close flex-shrink-0 text-content-muted hover:text-content-primary transition-colors" type="button" aria-label="Cerrar">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;

        return toast;
    }

    private removeToast(toast: HTMLElement) {
        toast.classList.add("animate-toast-out");
        setTimeout(() => {
            toast.remove();
        }, 200);
    }

    private escapeHtml(text: string): string {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    public success(message: string, duration?: number) {
        this.show(message, { type: "success", duration });
    }

    public error(message: string, duration?: number) {
        this.show(message, { type: "error", duration });
    }

    public warning(message: string, duration?: number) {
        this.show(message, { type: "warning", duration });
    }

    public info(message: string, duration?: number) {
        this.show(message, { type: "info", duration });
    }
}

export class UiToastContainer extends HTMLElement {
    constructor() {
        super();
    }
}

customElements.define("ui-toast-container", UiToastContainer);

// Global toast instance
export const toast = new ToastManager();
