import { ClientsApi } from "@/lib/api/clients";
import type { CreateClientDTO } from "@/lib/types";

export class ClientForm extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.initEventListeners();
    }

    private initEventListeners() {
        const form = this.querySelector("form") as HTMLFormElement;
        const magicLinkEl = document.getElementById("magicLink");
        const copyBtn = document.getElementById("copyLinkBtn");

        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn?.textContent;

            if (submitBtn) {
                submitBtn.textContent = "GENERANDO...";
                (submitBtn as HTMLButtonElement).disabled = true;
            }

            const formData = new FormData(form);
            const documents = formData.getAll("documents");

            const data: CreateClientDTO = {
                client_name: formData.get("client_name") as string,
                case_name: formData.get("case_name") as string,
                contract_template_id: formData.get("contract_template_id") as string,
                questionnaire_template_id: formData.get("questionnaire_template_id") as string,
                required_documents: documents as any[], // Cast as any[] to match DTO, though strictly it's string[]
            };

            try {
                const result = await ClientsApi.createClient(data);

                if (magicLinkEl) {
                    magicLinkEl.textContent = result.magic_link;
                }

                // Dispatch event to open modal
                window.dispatchEvent(new CustomEvent("toggle-modal-linkModal"));

                // Reset form
                form.reset();
            } catch (error: any) {
                alert("Error: " + (error.message || "Error al crear la sala de bienvenida"));
            } finally {
                if (submitBtn) {
                    submitBtn.textContent = originalBtnText || "GENERAR LINK MÁGICO";
                    (submitBtn as HTMLButtonElement).disabled = false;
                }
            }
        });

        copyBtn?.addEventListener("click", () => {
            const link = magicLinkEl?.textContent || "";
            navigator.clipboard.writeText(link);

            const originalText = copyBtn.textContent;
            copyBtn.textContent = "COPIADO";

            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    }
}

customElements.define("client-form", ClientForm);
