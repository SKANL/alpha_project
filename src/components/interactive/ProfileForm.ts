import { ProfileApi } from "@/lib/api/profile";
import { toast } from "@/components/interactive/UiToast";

export class ProfileForm extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.initEventListeners();
    }

    private initEventListeners() {
        const form = this.querySelector("form");
        const successMessage = document.getElementById("successMessage");

        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn?.textContent;

            if (submitBtn) {
                submitBtn.textContent = "GUARDANDO...";
                (submitBtn as HTMLButtonElement).disabled = true;
            }

            const formData = new FormData(form);

            try {
                const body = await ProfileApi.updateProfile(formData);

                // Update UI
                const nameInput = this.querySelector("#firm_name") as HTMLInputElement;
                const calendarInput = this.querySelector("#calendar_link") as HTMLInputElement;

                if (body?.firm_name && nameInput) nameInput.value = body.firm_name;
                if (body?.calendar_link && calendarInput) calendarInput.value = body.calendar_link;

                if (body?.firm_logo_url) {
                    const img = this.querySelector("img[alt='Logo']") as HTMLImageElement;
                    if (img) img.src = body.firm_logo_url;
                }

                // Show success message
                if (successMessage) {
                    successMessage.classList.remove("translate-x-full", "opacity-0");
                    setTimeout(() => {
                        successMessage.classList.add("translate-x-full", "opacity-0");
                    }, 3000);
                }

                // Show success toast
                toast.success("Perfil actualizado correctamente");

            } catch (error) {
                toast.error("Error al guardar el perfil");
            } finally {
                if (submitBtn) {
                    submitBtn.textContent = originalText || "GUARDAR CAMBIOS";
                    (submitBtn as HTMLButtonElement).disabled = false;
                }
            }
        });
    }
}

customElements.define("profile-form", ProfileForm);
