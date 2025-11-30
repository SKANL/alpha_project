import { supabase } from "../lib/supabase";
import crypto from "node:crypto";
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

    /**
     * Get full client expediente (details, documents, answers).
     */
    static async getClientExpediente(clientId: string, userId: string) {
        // Get client
        const { data: client, error: clientError } = await supabase
            .from("clients")
            .select("*")
            .eq("id", clientId)
            .eq("user_id", userId)
            .single();

        if (clientError) throw new Error(clientError.message);

        // Get documents
        const { data: documents } = await supabase
            .from("client_documents")
            .select("*")
            .eq("client_id", clientId);

        // Get answers with questions
        const { data: answers } = await supabase
            .from("client_answers")
            .select(`
        *,
        questions (
          question_text,
          order_index
        )
      `)
            .eq("client_id", clientId);

        // Sort answers by question order
        const sortedAnswers = answers?.sort((a: any, b: any) => {
            const orderA = a.questions?.order_index || 0;
            const orderB = b.questions?.order_index || 0;
            return orderA - orderB;
        }) || [];

        return {
            client,
            documents: documents || [],
            answers: sortedAnswers,
        };
    }
}
