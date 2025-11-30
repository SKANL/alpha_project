import { apiClient } from "./core";

export const TemplatesApi = {
    createQuestionnaire: async (data: { name: string; questions: string[] }) => {
        return apiClient("/api/templates/questionnaires/create", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    deleteQuestionnaire: async (id: string) => {
        return apiClient("/api/templates/questionnaires/delete", {
            method: "DELETE",
            body: JSON.stringify({ id }),
        });
    },

    createContract: async (data: { name: string; content: string; file_url: string }) => {
        return apiClient("/api/templates/contracts/create", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    deleteContract: async (id: string) => {
        return apiClient("/api/templates/contracts/delete", {
            method: "DELETE",
            body: JSON.stringify({ id }),
        });
    },
};
