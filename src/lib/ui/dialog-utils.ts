import { UiConfirmDialog } from "@/components/interactive/UiConfirmDialog.ts";
import { UiAlertDialog } from "@/components/interactive/UiAlertDialog.ts";

/**
 * Show a confirmation dialog  (replaces window.confirm())
 * @param message - The message to display
 * @param options - Confirmation options
 * @returns Promise<boolean> - true if confirmed, false if cancelled
 */
export async function showConfirm(
    message: string,
    options: {
        title?: string;
        confirmText?: string;
        cancelText?: string;
        type?: "danger" | "warning" | "info";
    } = {}
): Promise<boolean> {
    // Get or create confirm dialog
    let dialog = document.querySelector("ui-confirm-dialog") as UiConfirmDialog;

    if (!dialog) {
        // Lazily create dialog if it doesn't exist
        const { default: ConfirmDialogTemplate } = await import("@/components/ui/ConfirmDialog.astro");
        // For now, we'll create it dynamically
        dialog = document.createElement("ui-confirm-dialog") as UiConfirmDialog;
        dialog.id = "confirm-dialog";
        dialog.className = "fixed inset-0 z-[60] hidden items-center justify-center p-4 transition-all duration-300";
        dialog.setAttribute("role", "alertdialog");
        dialog.setAttribute("aria-modal", "true");

        dialog.innerHTML = `
            <div class="confirm-content relative w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-br from-surface-floating to-surface-card border border-border-strong shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl p-6 transition-all" style="background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%); backdrop-filter: blur(20px);">
                <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-status-error/10 via-transparent to-transparent pointer-events-none"></div>
                <div class="relative flex items-center justify-center w-12 h-12 rounded-full bg-status-error/10 mb-4">
                    <svg class="w-6 h-6 text-status-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 class="confirm-title relative text-lg font-medium tracking-zen text-content-primary mb-2">Confirmar acción</h3>
                <p class="confirm-message relative text-sm text-content-secondary mb-6">¿Estás seguro de realizar esta acción?</p>
                <div class="relative flex gap-3 justify-end">
                    <button class="confirm-cancel px-4 py-2 rounded-lg text-sm font-medium text-content-secondary bg-surface-highlight hover:bg-surface-highlight/80 border border-border transition-all duration-200 hover:scale-105 active:scale-95" type="button">Cancelar</button>
                    <button class="confirm-accept px-4 py-2 rounded-lg text-sm font-medium text-white bg-status-error hover:bg-status-error/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-status-error/20" type="button">Confirmar</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
    }

    return dialog.show(message, options);
}

/**
 * Show an alert dialog (replaces window.alert())
 * @param message - The message to display
 * @param type - The type of alert
 * @param options - Alert options
 */
export function showAlert(
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    options: {
        autoClose?: number; // milliseconds
    } = {}
): void {
    // Get or create alert dialog
    let dialog = document.querySelector("ui-alert-dialog") as UiAlertDialog;

    if (!dialog) {
        // Lazily create dialog if it doesn't exist
        dialog = document.createElement("ui-alert-dialog") as UiAlertDialog;
        dialog.id = "alert-dialog";
        dialog.className = "fixed inset-0 z-[60] hidden items-center justify-center p-4 transition-all duration-300";
        dialog.setAttribute("role", "alertdialog");
        dialog.setAttribute("aria-modal", "true");

        dialog.innerHTML = `
            <div class="alert-content relative w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-br from-surface-floating to-surface-card border border-border-strong shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl p-6 transition-all" style="background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%); backdrop-filter: blur(20px);">
                <div class="alert-glow absolute inset-0 rounded-2xl pointer-events-none"></div>
                <div class="alert-icon-container relative flex items-center justify-center w-12 h-12 rounded-full mb-4">
                    <svg class="alert-icon alert-icon-success hidden w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    <svg class="alert-icon alert-icon-error hidden w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    <svg class="alert-icon alert-icon-warning hidden w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <svg class="alert-icon alert-icon-info hidden w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p class="alert-message relative text-sm text-content-primary mb-6">Mensaje de alerta</p>
                <div class="relative flex justify-end">
                    <button class="alert-close px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95" type="button">Aceptar</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
    }

    dialog.show(message, type, options);
}
