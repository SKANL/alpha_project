import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContractTemplate, QuestionnaireTemplate } from "../lib/types";

export class TemplateService {
    /**
     * Get all contract templates for a user.
     */
    static async getContractTemplates(client: SupabaseClient, userId: string): Promise<ContractTemplate[]> {
        const { data, error } = await client
            .from("contract_templates")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching contract templates:", error);
            throw new Error(error.message);
        }

        return data as ContractTemplate[];
    }

    /**
     * Get all questionnaire templates for a user.
     */
    static async getQuestionnaireTemplates(client: SupabaseClient, userId: string): Promise<QuestionnaireTemplate[]> {
        const { data, error } = await client
            .from("questionnaire_templates")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching questionnaire templates:", error);
            throw new Error(error.message);
        }

        return data as QuestionnaireTemplate[];
    }

    /**
     * Create a new contract template.
     */
    static async createContractTemplate(client: SupabaseClient, userId: string, name: string, file: File): Promise<ContractTemplate> {
        // Upload file
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}/${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await client.storage
            .from("contract-templates")
            .upload(filePath, file);

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = client.storage
            .from("contract-templates")
            .getPublicUrl(filePath);

        const { data, error } = await client
            .from("contract_templates")
            .insert({
                user_id: userId,
                name,
                file_url: urlData.publicUrl,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data as ContractTemplate;
    }

    /**
     * Delete a contract template.
     */
    static async deleteContractTemplate(client: SupabaseClient, id: string, userId: string): Promise<void> {
        const { error } = await client
            .from("contract_templates")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        if (error) throw new Error(error.message);
    }

    /**
     * Create a new questionnaire template.
     */
    static async createQuestionnaireTemplate(client: SupabaseClient, userId: string, name: string, questions: string[]): Promise<QuestionnaireTemplate> {
        // Create template
        const { data: template, error: templateError } = await client
            .from("questionnaire_templates")
            .insert({
                user_id: userId,
                name,
            })
            .select()
            .single();

        if (templateError) throw new Error(templateError.message);

        // Create questions
        if (questions.length > 0) {
            const questionRecords = questions.map((q, index) => ({
                questionnaire_id: template.id,
                question_text: q,
                order_index: index,
            }));

            const { error: questionsError } = await client
                .from("questions")
                .insert(questionRecords);

            if (questionsError) throw new Error(questionsError.message);
        }

        return template as QuestionnaireTemplate;
    }

    /**
     * Delete a questionnaire template.
     */
    static async deleteQuestionnaireTemplate(client: SupabaseClient, id: string, userId: string): Promise<void> {
        const { error } = await client
            .from("questionnaire_templates")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        if (error) throw new Error(error.message);
    }
}
