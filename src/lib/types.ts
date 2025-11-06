// Types for Database Tables

export interface Profile {
  id: string;
  user_id: string;
  firm_name: string;
  firm_logo_url?: string;
  calendar_link?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractTemplate {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  created_at: string;
}

export interface QuestionnaireTemplate {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Question {
  id: string;
  questionnaire_id: string;
  question_text: string;
  order_index: number;
  created_at: string;
}

export type ClientStatus = 'pending' | 'completed';

export type DocumentType = 'ine' | 'rfc' | 'acta_matrimonio' | 'comprobante_domicilio';

export interface Client {
  id: string;
  user_id: string;
  client_name: string;
  case_name: string;
  status: ClientStatus;
  magic_link_token: string;
  contract_template_id: string;
  questionnaire_template_id: string;
  required_documents: DocumentType[];
  contract_signed_url?: string;
  signature_data?: string;
  signature_timestamp?: string;
  signature_ip?: string;
  signature_hash?: string;
  completed_at?: string;
  created_at: string;
  link_used: boolean;
}

export interface ClientDocument {
  id: string;
  client_id: string;
  document_type: DocumentType;
  file_url: string;
  uploaded_at: string;
}

export interface ClientAnswer {
  id: string;
  client_id: string;
  question_id: string;
  answer_text: string;
  created_at: string;
}

// Form Types

export interface CreateClientForm {
  client_name: string;
  case_name: string;
  contract_template_id: string;
  questionnaire_template_id: string;
  required_documents: DocumentType[];
}

export interface UpdateProfileForm {
  firm_name?: string;
  firm_logo?: File;
  calendar_link?: string;
}

export interface CreateContractTemplateForm {
  name: string;
  file: File;
}

export interface CreateQuestionnaireForm {
  name: string;
  questions: string[];
}

// Client Portal Types

export interface ClientPortalData {
  client: Client;
  contract_template: ContractTemplate;
  questionnaire: QuestionnaireTemplate;
  questions: Question[];
  profile: Profile;
}

export interface SignContractData {
  signature_data: string;
  ip_address: string;
}

export interface UploadDocumentData {
  document_type: DocumentType;
  file: File;
}

export interface SubmitAnswersData {
  answers: {
    question_id: string;
    answer_text: string;
  }[];
}
