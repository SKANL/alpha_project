import { PortalApi } from "@/lib/api/portal";

export class PortalFlow extends HTMLElement {
    private currentStepIndex: number = 0;
    private steps: string[] = ["welcome", "contract", "questionnaire", "documents", "calendar"];
    private clientId: string = "";

    constructor() {
        super();
    }

    connectedCallback() {
        this.clientId = this.dataset.clientId || "";
        const initialStep = this.dataset.initialStep || "welcome";

        this.currentStepIndex = this.steps.indexOf(
            initialStep === "completed" ? "calendar" : initialStep
        );
        if (this.currentStepIndex === -1) this.currentStepIndex = 0;

        this.initEventListeners();
        this.showStep(this.currentStepIndex);
    }

    private initEventListeners() {
        // 1. Welcome -> Contract
        this.querySelector("#startBtn")?.addEventListener("click", () => {
            this.advanceStep();
        });

        // 2. Contract Logic
        const acceptCheckbox = this.querySelector("#acceptContract") as HTMLInputElement;
        const signBtn = this.querySelector("#signContractBtn") as HTMLButtonElement;

        acceptCheckbox?.addEventListener("change", (e) => {
            if (signBtn) signBtn.disabled = !(e.target as HTMLInputElement).checked;
        });

        signBtn?.addEventListener("click", async () => {
            try {
                signBtn.textContent = "FIRMANDO...";
                signBtn.disabled = true;
                await PortalApi.signContract(this.clientId);
                this.advanceStep();
            } catch (e) {
                alert("Error al firmar contrato");
                signBtn.textContent = "FIRMAR Y CONTINUAR";
                signBtn.disabled = false;
            }
        });

        // 3. Questionnaire Logic
        const qForm = this.querySelector("#questionnaireForm") as HTMLFormElement;
        qForm?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = qForm.querySelector('button[type="submit"]');
            if (btn) btn.textContent = "ENVIANDO...";

            const formData = new FormData(qForm);
            const answers: Record<string, string> = {};
            formData.forEach((value, key) => {
                answers[key] = value as string;
            });

            try {
                await PortalApi.submitQuestionnaire(this.clientId, answers);
                this.advanceStep();
            } catch (e) {
                alert("Error al enviar respuestas");
                if (btn) btn.textContent = "ENVIAR RESPUESTAS";
            }
        });

        // 4. Documents Logic
        const docsForm = this.querySelector("#docsForm") as HTMLFormElement;
        docsForm?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = docsForm.querySelector('button[type="submit"]');
            if (btn) btn.textContent = "SUBIENDO...";

            const formData = new FormData(docsForm);
            formData.append("clientId", this.clientId);

            try {
                await PortalApi.uploadDocuments(formData);
                this.advanceStep();
            } catch (e) {
                alert("Error al subir documentos");
                if (btn) btn.textContent = "SUBIR DOCUMENTOS";
            }
        });
    }

    private advanceStep() {
        this.currentStepIndex++;
        this.showStep(this.currentStepIndex);
    }

    private showStep(index: number) {
        this.querySelectorAll(".step-content").forEach((el) => el.classList.add("hidden"));
        const stepId = `step-${this.steps[index]}`;
        const stepEl = this.querySelector(`#${stepId}`);
        if (stepEl) {
            stepEl.classList.remove("hidden");
            stepEl.classList.add("animate-fade-in-up");
        }
        window.scrollTo(0, 0);
    }
}

customElements.define("portal-flow", PortalFlow);
