import { apiClient } from "./core";

export const PortalApi = {
    signContract: async (token: string, signature_data: string, ip_address: string) => {
        return apiClient("/api/portal/sign", {
            method: "POST",
            body: JSON.stringify({ token, signature_data, ip_address }),
        });
    },

    submitQuestionnaire: async (token: string, answers: { question_id: string; answer_text: string }[]) => {
        return apiClient("/api/portal/submit-answers", {
            method: "POST",
            body: JSON.stringify({ token, answers }),
        });
    },

    uploadDocument: async (token: string, document_type: string, file: File) => {
        const formData = new FormData();
        formData.append("token", token);
        formData.append("document_type", document_type);
        formData.append("file", file);

        // Note: We don't set Content-Type for FormData, browser does it with boundary
        const response = await fetch("/api/portal/upload-document", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload document");
        }

        return response.json();
    },

    completeProcess: async (token: string) => {
        return apiClient("/api/portal/complete", {
            method: "POST",
            body: JSON.stringify({ token }),
        });
    },
};
