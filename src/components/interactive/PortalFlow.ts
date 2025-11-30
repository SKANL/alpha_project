import { PortalApi } from "@/lib/api/portal";
import { toast } from "@/components/interactive/UiToast";

export class PortalFlow extends HTMLElement {
    private currentStepIndex: number = 0;
    private steps: string[] = ["welcome", "contract", "questionnaire", "documents", "calendar"];
    private token: string = "";
    private requiredDocuments: string[] = [];
    private uploadedDocuments: Set<string> = new Set();

    constructor() {
        super();
    }

    connectedCallback() {
        this.token = this.dataset.token || "";
        const initialStep = this.dataset.initialStep || "welcome";
        const requiredDocs = this.dataset.requiredDocs || "";
        this.requiredDocuments = requiredDocs ? requiredDocs.split(",") : [];

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

        // 3. Questionnaire Logic
        const qForm = this.querySelector("#questionnaireForm") as HTMLFormElement;
        qForm?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = qForm.querySelector('button[type="submit"]');
            if (btn) btn.textContent = "ENVIANDO...";

            const formData = new FormData(qForm);
            const answers: { question_id: string; answer_text: string }[] = [];

            formData.forEach((value, key) => {
                if (key.startsWith("answer_")) {
                    const question_id = key.replace("answer_", "");
                    answers.push({
                        question_id,
                        answer_text: value as string
                    });
                }
            });

            try {
                await PortalApi.submitQuestionnaire(this.token, answers);
                this.advanceStep();
            } catch (e) {
                toast.error("Error al enviar respuestas");
                if (btn) btn.textContent = "ENVIAR RESPUESTAS";
            }
        });

        // 4. Documents Logic - Upload files individually
        const fileInputs = this.querySelectorAll('input[type="file"]');
        fileInputs.forEach((input) => {
            input.addEventListener("change", async (e) => {
                const fileInput = e.target as HTMLInputElement;
                const file = fileInput.files?.[0];
                const document_type = fileInput.dataset.docType;

                if (!file || !document_type) return;

                try {
                    await PortalApi.uploadDocument(this.token, document_type, file);

                    // Mark as uploaded
                    this.uploadedDocuments.add(document_type);
                    fileInput.disabled = true;

                    // Add visual feedback
                    const label = fileInput.previousElementSibling;
                    if (label) {
                        label.textContent += " ✓";
                        label.classList.add("text-status-success");
                    }

                    // Check if all documents are uploaded
                    if (this.uploadedDocuments.size === this.requiredDocuments.length) {
                        await this.completePortalProcess();
                    }
                } catch (error) {
                    toast.error(`Error al subir ${document_type}`);
                }
            });
        });

        // Continue button for documents step
        this.querySelector("#continueDocsBtn")?.addEventListener("click", async () => {
            // Check if all documents uploaded before allowing continue
            if (this.uploadedDocuments.size < this.requiredDocuments.length) {
                toast.warning(`Por favor sube todos los ${this.requiredDocuments.length} documentos requeridos`);
                return;
            }
            this.advanceStep();
        });
    }

    private async completePortalProcess() {
        try {
            await PortalApi.completeProcess(this.token);
            // Enable continue button after completion
            const continueBtn = this.querySelector("#continueDocsBtn") as HTMLButtonElement;
            if (continueBtn) {
                continueBtn.disabled = false;
                continueBtn.classList.add("animate-pulse");
            }
        } catch (error) {
            console.error("Error completing process:", error);
        }
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
