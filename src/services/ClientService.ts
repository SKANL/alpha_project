import type { SupabaseClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import type { Client, CreateClientDTO } from "../lib/types";

export class ClientService {
    /**
     * Fetch all clients for a specific user.
     */
    static async getClients(client: SupabaseClient, userId: string): Promise<Client[]> {
        const { data, error } = await client
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
    static async getClientById(client: SupabaseClient, clientId: string, userId: string): Promise<Client | null> {
        const { data, error } = await client
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
    static async createClient(client: SupabaseClient, userId: string, clientData: CreateClientDTO): Promise<Client> {
        // Generate a unique magic link token (simple implementation)
        const magicLinkToken = crypto.randomUUID();

        const { data, error } = await client
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
    static async deleteClient(client: SupabaseClient, clientId: string, userId: string): Promise<void> {
        const { error } = await client
            .from("clients")
            .delete()
            .eq("id", clientId)
            .eq("user_id", userId);

        if (error) {
            console.error("Error deleting client:", error);
            throw new Error(error.message);
        }
    }

    /**
     * Get full client expediente (details, documents, answers).
     * Optimized to use parallel requests and joins.
     */
    static async getClientExpediente(client: SupabaseClient, clientId: string, userId: string) {
        // Fetch client, documents, and answers (with nested questions) in parallel
        const [clientResult, documentsResult, answersResult] = await Promise.all([
            client
                .from("clients")
                .select("*")
                .eq("id", clientId)
                .eq("user_id", userId)
                .single(),
            client
                .from("client_documents")
                .select("*")
                .eq("client_id", clientId),
            client
                .from("client_answers")
                .select("*, questions(*)") // Join with questions table
                .eq("client_id", clientId)
        ]);

        if (clientResult.error) throw new Error(clientResult.error.message);

        const documents = documentsResult.data || [];
        const answers = answersResult.data || [];

        // Sort answers by question order (if available from the join)
        const sortedAnswers = answers.sort((a: any, b: any) => {
            const orderA = a.questions?.order_index || 0;
            const orderB = b.questions?.order_index || 0;
            return orderA - orderB;
        });

        return {
            client: clientResult.data,
            documents: documents,
            answers: sortedAnswers,
        };
    }
}
