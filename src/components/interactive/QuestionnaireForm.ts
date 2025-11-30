import { TemplatesApi } from "@/lib/api/templates";

export class QuestionnaireForm extends HTMLElement {
    private container: HTMLElement | null = null;

    constructor() {
        super();
    }

    connectedCallback() {
        this.container = this.querySelector("#questionsContainer");
        this.initEventListeners();

        // Add initial question if empty
        if (this.container && this.container.children.length === 0) {
            this.addQuestionInput();
        }
    }

    private initEventListeners() {
        const form = this.querySelector("form");
        const addBtn = this.querySelector("#addQuestionBtn");
        const modalId = this.dataset.modalId;

        addBtn?.addEventListener("click", () => this.addQuestionInput());

        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn?.textContent;

            if (submitBtn) {
                submitBtn.textContent = "GUARDANDO...";
                (submitBtn as HTMLButtonElement).disabled = true;
            }

            const formData = new FormData(form);
            const questions = Array.from(this.querySelectorAll('input[name="questions[]"]'))
                .map((input) => (input as HTMLInputElement).value)
                .filter(Boolean);

            try {
                await TemplatesApi.createQuestionnaire({
                    name: formData.get("name") as string,
                    questions,
                });

                // Close modal and reload
                if (modalId) {
                    window.dispatchEvent(new CustomEvent(`toggle-modal-${modalId}`));
                }
                window.location.reload();
            } catch (error) {
                alert("Error al crear cuestionario");
                if (submitBtn) {
                    submitBtn.textContent = originalText || "GUARDAR";
                    (submitBtn as HTMLButtonElement).disabled = false;
                }
            }
        });
    }

    private addQuestionInput() {
        if (!this.container) return;

        const div = document.createElement("div");
        div.className = "flex gap-2 items-start animate-fade-in-up";
        div.innerHTML = `
      <div class="flex-1">
        <input
          type="text"
          name="questions[]"
          placeholder="Escribe la pregunta..."
          required
          class="w-full bg-surface-card border border-border rounded px-3 py-2 text-content-primary text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand-light"
        />
      </div>
      <button type="button" class="text-content-muted hover:text-status-error p-2 remove-question">
        ×
      </button>
    `;

        div.querySelector(".remove-question")?.addEventListener("click", () => {
            div.remove();
        });

        this.container.appendChild(div);
    }
}

customElements.define("questionnaire-form", QuestionnaireForm);
