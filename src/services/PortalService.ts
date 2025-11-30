import { supabase } from "../lib/supabase";
import type { Client, DocumentType, SignContractData, SubmitAnswersData } from "../lib/types";
import crypto from "crypto";

export class PortalService {
    /**
     * Validate a portal token and return client data.
     */
    static async validateToken(token: string) {
        // Get client
        const { data: client, error: clientError } = await supabase
            .from("clients")
            .select("*")
            .eq("magic_link_token", token)
            .single();

        if (clientError || !client) {
            throw new Error("Invalid or expired link");
        }

        // Check if link was already used
        if (client.link_used) {
            throw new Error("Link already used");
        }

        // Get contract template
        const { data: contractTemplate } = await supabase
            .from("contract_templates")
            .select("*")
            .eq("id", client.contract_template_id)
            .single();

        // Get questionnaire with questions
        const { data: questionnaire } = await supabase
            .from("questionnaire_templates")
            .select(`
        *,
        questions (
          id,
          question_text,
          order_index
        )
      `)
            .eq("id", client.questionnaire_template_id)
            .single();

        // Get profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", client.user_id)
            .single();

        return {
            client,
            contract_template: contractTemplate,
            questionnaire,
            profile,
        };
    }

    /**
     * Sign the contract.
     */
    static async signContract(token: string, signatureData: string, ipAddress: string) {
        // Get client
        const { data: client, error: clientError } = await supabase
            .from("clients")
            .select("*")
            .eq("magic_link_token", token)
            .single();

        if (clientError || !client) {
            throw new Error("Invalid token");
        }

        // Generate hash of signature for evidence
        const timestamp = new Date().toISOString();
        const hash = crypto
            .createHash("sha256")
            .update(`${signatureData}${timestamp}${ipAddress}`)
            .digest("hex");

        // Update client with signature data
        const { data: updatedClient, error: updateError } = await supabase
            .from("clients")
            .update({
                signature_data: signatureData,
                signature_timestamp: timestamp,
                signature_ip: ipAddress,
                signature_hash: hash,
            })
            .eq("id", client.id)
            .select()
            .single();

        if (updateError) {
            throw new Error(updateError.message);
        }

        return updatedClient;
    }

    /**
     * Upload a document.
     */
    static async uploadDocument(token: string, documentType: DocumentType, file: File) {
        // Get client
        const { data: client, error: clientError } = await supabase
            .from("clients")
            .select("id")
            .eq("magic_link_token", token)
            .single();

        if (clientError || !client) {
            throw new Error("Invalid token");
        }

        // Upload file
        const fileExt = file.name.split(".").pop();
        const fileName = `${client.id}-${documentType}-${Date.now()}.${fileExt}`;
        const filePath = `client-files/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("firm-assets")
            .upload(filePath, file);

        if (uploadError) {
            throw new Error(uploadError.message);
        }

        const { data: urlData } = supabase.storage
            .from("firm-assets")
            .getPublicUrl(filePath);

        // Create document record
        const { data: document, error: docError } = await supabase
            .from("client_documents")
            .insert({
                client_id: client.id,
                document_type: documentType,
                file_url: urlData.publicUrl,
            })
            .select()
            .single();

        if (docError) {
            throw new Error(docError.message);
        }

        return document;
    }

    /**
     * Submit questionnaire answers.
     */
    static async submitAnswers(token: string, answers: any[]) {
        // Get client
        const { data: client, error: clientError } = await supabase
            .from("clients")
            .select("id")
            .eq("magic_link_token", token)
            .single();

        if (clientError || !client) {
            throw new Error("Invalid token");
        }

        // Insert answers
        const answerRecords = answers.map((answer: any) => ({
            client_id: client.id,
            question_id: answer.question_id,
            answer_text: answer.answer_text,
        }));

        const { data: savedAnswers, error: answersError } = await supabase
            .from("client_answers")
            .insert(answerRecords)
            .select();

        if (answersError) {
            throw new Error(answersError.message);
        }

        return savedAnswers;
    }

    /**
     * Complete the portal process.
     */
    static async completeProcess(token: string) {
        // Update client status and mark link as used
        const { data: client, error } = await supabase
            .from("clients")
            .update({
                status: "completed",
                link_used: true,
                completed_at: new Date().toISOString(),
            })
            .eq("magic_link_token", token)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return client;
    }
}
