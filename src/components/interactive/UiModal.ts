export class UiModal extends HTMLElement {
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
            if (e.target === this) {
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
        this.classList.remove("hidden");
        this.classList.add("flex");
    }

    public close() {
        this.classList.add("hidden");
        this.classList.remove("flex");
    }
}

customElements.define("ui-modal", UiModal);
