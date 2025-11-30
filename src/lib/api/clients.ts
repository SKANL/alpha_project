import { apiClient } from "./core";
import type { CreateClientDTO, Client } from "@/lib/types";

export const ClientsApi = {
    createClient: async (data: CreateClientDTO) => {
        return apiClient<Client & { magic_link: string }>("/api/clients/create", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    deleteClient: async (id: string) => {
        return apiClient<{ success: boolean }>("/api/clients/delete", {
            method: "DELETE",
            body: JSON.stringify({ id }),
        });
    },
};
