import { apiClient } from "@/lib/api/core";
import { showConfirm } from "@/lib/ui/dialog-utils";
import { toast } from "@/components/interactive/UiToast";

export class DeleteTrigger extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.addEventListener("click", this.handleClick);
    }

    private handleClick = async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        const action = this.dataset.action;
        const id = this.dataset.id;
        const confirmMsg = this.dataset.confirm || "¿Estás seguro de eliminar este elemento?";

        if (!action || !id) {
            console.error("DeleteTrigger missing action or id");
            return;
        }

        const confirmed = await showConfirm(confirmMsg, {
            title: "Confirmar eliminación",
            confirmText: "Eliminar",
            cancelText: "Cancelar",
            type: "danger",
        });

        if (!confirmed) return;

        const originalText = this.textContent;
        this.textContent = "Eliminando...";
        this.style.pointerEvents = "none";

        try {
            await apiClient(action, {
                method: "DELETE",
                body: JSON.stringify({ id }),
            });
            window.location.reload();
        } catch (error) {
            toast.error("Error al eliminar");
            this.textContent = originalText;
            this.style.pointerEvents = "auto";
        }
    };
}

customElements.define("delete-trigger", DeleteTrigger);
