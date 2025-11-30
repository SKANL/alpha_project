import { supabase } from "../lib/supabase";
import type { Client, CreateClientDTO } from "../lib/types";

export class ClientService {
    /**
     * Fetch all clients for a specific user.
     */
    static async getClients(userId: string): Promise<Client[]> {
        const { data, error } = await supabase
            .from("clients")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching clients:", error);
            throw new Error(error.message);
        }

        return data as Client[];
    }

    /**
     * Get a single client by ID.
     */
    static async getClientById(clientId: string, userId: string): Promise<Client | null> {
        const { data, error } = await supabase
            .from("clients")
            .select("*")
            .eq("id", clientId)
            .eq("user_id", userId)
            .single();

        if (error) {
            console.error("Error fetching client:", error);
            return null;
        }

        return data as Client;
    }

    /**
     * Create a new client.
     */
    static async createClient(userId: string, clientData: CreateClientDTO): Promise<Client> {
        // Generate a unique magic link token (simple implementation)
        const magicLinkToken = crypto.randomUUID();

        const { data, error } = await supabase
            .from("clients")
            .insert({
                user_id: userId,
                ...clientData,
                magic_link_token: magicLinkToken,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating client:", error);
            throw new Error(error.message);
        }

        return data as Client;
    }

    /**
     * Delete a client.
     */
    static async deleteClient(clientId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from("clients")
            .delete()
            .eq("id", clientId)
            .eq("user_id", userId);

        if (error) {
            console.error("Error deleting client:", error);
            throw new Error(error.message);
        }
    }
}
