export class UiTabs extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.initTabs();
    }

    private initTabs() {
        const triggers = this.querySelectorAll("[data-tab-trigger]");
        const contents = this.querySelectorAll("[data-tab-content]");
        const defaultValue = this.dataset.default;

        if (defaultValue) {
            this.setActive(defaultValue, triggers, contents);
        }

        triggers.forEach((trigger) => {
            trigger.addEventListener("click", () => {
                const value = (trigger as HTMLElement).dataset.tabTrigger;
                if (value) {
                    this.setActive(value, triggers, contents);
                }
            });
        });
    }

    private setActive(value: string, triggers: NodeListOf<Element>, contents: NodeListOf<Element>) {
        // Update triggers
        triggers.forEach((trigger) => {
            const el = trigger as HTMLElement;
            if (el.dataset.tabTrigger === value) {
                el.setAttribute("data-state", "active");
                el.classList.add("text-content-primary", "border-content-primary");
                el.classList.remove("text-content-secondary", "border-transparent");
            } else {
                el.setAttribute("data-state", "inactive");
                el.classList.remove("text-content-primary", "border-content-primary");
                el.classList.add("text-content-secondary", "border-transparent");
            }
        });

        // Update contents
        contents.forEach((content) => {
            const el = content as HTMLElement;
            if (el.dataset.tabContent === value) {
                el.classList.remove("hidden");
            } else {
                el.classList.add("hidden");
            }
        });
    }
}

customElements.define("ui-tabs", UiTabs);
