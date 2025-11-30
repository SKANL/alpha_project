import { apiClient } from "./core";
import type { SubmitAnswersData } from "@/lib/types";

export const PortalApi = {
    signContract: async (clientId: string) => {
        return apiClient("/api/portal/sign-contract", {
            method: "POST",
            body: JSON.stringify({ clientId }),
        });
    },

    submitQuestionnaire: async (clientId: string, answers: Record<string, string>) => {
        return apiClient("/api/portal/submit-questionnaire", {
            method: "POST",
            body: JSON.stringify({ clientId, answers }),
        });
    },

    uploadDocuments: async (formData: FormData) => {
        // Note: We don't set Content-Type for FormData, browser does it with boundary
        const response = await fetch("/api/portal/upload-documents", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload documents");
        }

        return response.json();
    },
};
