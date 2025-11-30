export class ContractForm extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.initEventListeners();
    }

    private initEventListeners() {
        const form = this.querySelector("form");
        const modalId = this.dataset.modalId;

        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn?.textContent;

            if (submitBtn) {
                submitBtn.textContent = "SUBIENDO...";
                (submitBtn as HTMLButtonElement).disabled = true;
            }

            const formData = new FormData(form);

            try {
                const response = await fetch("/api/templates/contracts/create", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    // Close modal and reload
                    if (modalId) {
                        window.dispatchEvent(new CustomEvent(`toggle-modal-${modalId}`));
                    }
                    window.location.reload();
                } else {
                    alert("Error al crear plantilla");
                    if (submitBtn) {
                        submitBtn.textContent = originalText || "GUARDAR";
                        (submitBtn as HTMLButtonElement).disabled = false;
                    }
                }
            } catch (error) {
                alert("Error al crear plantilla");
                if (submitBtn) {
                    submitBtn.textContent = originalText || "GUARDAR";
                    (submitBtn as HTMLButtonElement).disabled = false;
                }
            }
        });
    }
}

customElements.define("contract-form", ContractForm);
