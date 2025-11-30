import { toast } from "@/components/interactive/UiToast";

export class CopyLink extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.addEventListener("click", this.handleClick);
    }

    private handleClick = async () => {
        const token = this.dataset.token;
        if (!token) return;

        const link = `${window.location.origin}/portal/${token}`;
        const originalText = this.textContent;

        try {
            await navigator.clipboard.writeText(link);
            this.textContent = "COPIADO";
            toast.success("Link copiado al portapapeles");
            setTimeout(() => {
                this.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error("Error copying link:", err);
            toast.error("Error al copiar link");
        }
    };
}

customElements.define("copy-link", CopyLink);
