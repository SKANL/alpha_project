import type { SupabaseClient } from "@supabase/supabase-js";
import type { Client, ClientDocument, ClientAnswer } from "../lib/types";

export class PortalService {
    /**
     * Validate a magic link token and return the client.
     */
    static async validateToken(client: SupabaseClient, token: string): Promise<Client | null> {
        const { data, error } = await client
            .from("clients")
            .select("*")
            .eq("magic_link_token", token)
            .single();

        if (error) {
            console.error("Error validating token:", error);
            return null;
        }

        return data as Client;
    }

    /**
     * Get client details by ID (for portal use).
     */
    static async getClient(client: SupabaseClient, clientId: string): Promise<Client | null> {
        const { data, error } = await client
            .from("clients")
            .select("*")
            .eq("id", clientId)
            .single();

        if (error) {
            console.error("Error fetching client:", error);
            return null;
        }

        return data as Client;
    }

    /**
     * Get contract template by ID.
     */
    static async getContractTemplate(client: SupabaseClient, templateId: string): Promise<any | null> {
        const { data, error } = await client
            .from("contract_templates")
            .select("*")
            .eq("id", templateId)
            .single();

        if (error) {
            console.error("Error fetching contract template:", error);
            return null;
        }

        return data;
    }

    /**
     * Get questionnaire template by ID with questions.
     */
    static async getQuestionnaire(client: SupabaseClient, templateId: string): Promise<any | null> {
        const { data: template, error } = await client
            .from("questionnaire_templates")
            .select("*")
            .eq("id", templateId)
            .single();

        if (error) {
            console.error("Error fetching questionnaire template:", error);
            return null;
        }

        const { data: questions, error: questionsError } = await client
            .from("questions")
            .select("*")
            .eq("questionnaire_id", templateId)
            .order("order_index", { ascending: true });

        if (questionsError) {
            console.error("Error fetching questions:", questionsError);
            return null;
        }

        return {
            ...template,
            questions: questions || [],
        };
    }

    /**
     * Submit answers for a client.
     */
    static async submitAnswers(client: SupabaseClient, clientId: string, answers: { question_id: string; answer_text: string }[]): Promise<void> {
        const records = answers.map((a) => ({
            client_id: clientId,
            question_id: a.question_id,
            answer_text: a.answer_text,
        }));

        const { error } = await client
            .from("client_answers")
            .insert(records);

        if (error) {
            console.error("Error submitting answers:", error);
            throw new Error(error.message);
        }
    }

    /**
     * Upload a document for a client.
     */
    static async uploadDocument(client: SupabaseClient, clientId: string, name: string, file: File): Promise<ClientDocument> {
        const fileExt = file.name.split(".").pop();
        const fileName = `${clientId}/${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await client.storage
            .from("client-documents")
            .upload(filePath, file);

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = client.storage
            .from("client-documents")
            .getPublicUrl(filePath);

        const { data, error } = await client
            .from("client_documents")
            .insert({
                client_id: clientId,
                name,
                file_url: urlData.publicUrl,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data as ClientDocument;
    }

    /**
     * Mark client status as completed.
     */
    static async completeClient(client: SupabaseClient, clientId: string): Promise<void> {
        const { error } = await client
            .from("clients")
            .update({ status: "completed" })
            .eq("id", clientId);

        if (error) {
            console.error("Error completing client:", error);
            throw new Error(error.message);
        }
    }
}
