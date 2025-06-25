
import type {
  Industry,
  ProductCategory,
  FormTemplate,
  CertificateRule,
  Product,
  Document,
  AuditLog,
  ChangeLog,
  Supplier,
  TraceabilityRecord,
  BlockchainAnchor,
  DigitalSignature,
  PublicDppData,
  MaterialSpecification,
  MaterialDocument,
  CountryPack,
  DecentralizedIdentifier,
  VerifiableCredential,
  Module,
  CompanyModuleAccess,
  SubscriptionPlan,
  CompanySubscription,
  CompanyBranding,
  CompanyLocalizationSettings,
  SupplierScore,
  VerificationTask,
  CompanyProduct,
  QRCodeLog,
  PrivacyConsent,
  SupportTicket,
  EmailTrigger,
  EmailTemplate,
  Campaign,
} from '@/lib/types';

// -- CORE CONFIGURATION DATA --

export const mockIndustries: Industry[] = [
  {
    industry_id: "1",
    industry_name: "Battery",
    industry_code: "BAT",
    description: "Anchored to Regulation (EU) 2023/1542 (Battery Regulation)",
    regulatory_body: "ECHA",
    compliance_frameworks: ["Battery Regulation", "REACH", "RoHS"],
    active: true,
  },
  {
    industry_id: "2",
    industry_name: "Electrical & Electronic Equipment (EEE)",
    industry_code: "EEE",
    description: "Anchored to WEEE Directive, RoHS, Ecodesign",
    regulatory_body: "European Commission",
    compliance_frameworks: ["WEEE", "RoHS", "Ecodesign"],
    active: true,
  },
];

export const mockCategories: ProductCategory[] = [
  { category_id: "cat_bat_1", industry_id: "1", category_name: "EV Battery", category_code: "BAT-EV-001", description: "For electric vehicles, includes large-format lithium-ion", form_template_id: "form_bat_ev_v1", requires_traceability: true, requires_certificates: true, active: true },
  { category_id: "cat_eee_3", industry_id: "2", category_name: "Consumer Electronics", category_code: "EEE-CONS-003", description: "TVs, audio devices", form_template_id: "form_eee_cons_v1", requires_traceability: true, requires_certificates: true, active: true },
];

export const mockTemplates: FormTemplate[] = [
    {
        form_template_id: 'form_bat_ev_v1', form_template_name: 'EV Battery Schema v1.3', industry_id: '1', category_id: 'cat_bat_1', version: '1.3', version_type: 'product',
        fields_schema: [
            { field_id: 'product_name', label: 'Product Name', type: 'text', required: true, placeholder: "e.g., UltraCell EV-B500" },
            { field_id: 'product_model_number', label: 'Model Number', type: 'text', required: true, placeholder: "e.g., U-EV-500" },
            { field_id: 'battery_chemistry', label: 'Battery Chemistry', type: 'select', options: ['LFP', 'NMC', 'NCA', 'Li-ion', 'Other'], required: true },
        ],
        is_active: true, is_master_template: true, created_by: 'Admin', effective_date: '2023-01-01T00:00:00Z', notes: 'Initial schema for EU Battery Regulation compliance.'
    },
    {
        form_template_id: 'form_eee_cons_v1', form_template_name: 'Consumer Electronics Schema v1.0', industry_id: '2', category_id: 'cat_eee_3', version: '1.0', version_type: 'product',
        fields_schema: [
            { field_id: 'product_name', label: 'Product Name', type: 'text', required: true, placeholder: "e.g., SoundWave Pro Speaker" },
            { field_id: 'brand_name', label: 'Brand Name', type: 'text', required: true, placeholder: "e.g., SoundWave" },
        ],
        is_active: true, is_master_template: true, created_by: 'Admin', effective_date: '2023-01-01T00:00:00Z'
    },
];

export const mockCertificateRules: CertificateRule[] = [
    {
        certificate_rule_id: 'rule_bat_1',
        industry_id: '1',
        certificate_type: 'UN 38.3',
        description: 'Test report for transport of dangerous goods.',
        mandatory: true,
        trigger_condition: {},
        expected_format: 'PDF',
        validation_method: 'Manual',
        issued_by: 'Accredited Lab',
        validity_period_days: 730,
        regulation_reference: 'UN Manual of Tests and Criteria, Part III, 38.3',
        last_updated_at: '2024-05-01T10:00:00Z',
        active: true,
    },
    {
        certificate_rule_id: 'rule_bat_2',
        industry_id: '1',
        certificate_type: 'REACH Declaration',
        description: 'Declaration of compliance with chemical regulations.',
        mandatory: true,
        trigger_condition: {},
        expected_format: 'PDF',
        validation_method: 'Manual',
        issued_by: 'Self-declared',
        validity_period_days: 365,
        regulation_reference: 'REACH (EC) No 1907/2006',
        last_updated_at: '2024-05-01T10:00:00Z',
        active: true,
    },
];

export const mockCountryPacks: CountryPack[] = [
  {
    pack_id: 'pack_de', language_code: 'DE', country_code: 'DE', region_profile: 'EU_CENTRAL',
    translated_field_labels: { "product_name": "Produktname" },
    translated_static_content: { "faq_title": "Häufig gestellte Fragen" },
    epr_mandates_applicable: true, default_currency: 'EUR', rtl_layout_required: false, active: true,
  },
];

export const mockModules: Module[] = [
  // DPP Core
  { id: 'mod_dpp_view', name: 'View DPPs & Products', description: 'Base permission to view product data and DPPs.', dependencies: [], category: 'DPP Core' },
  { id: 'mod_dpp_create', name: 'Create New Products', description: 'Allows users to onboard new products and create draft DPPs.', dependencies: ['mod_dpp_view'], category: 'DPP Core' },
  { id: 'mod_dpp_edit', name: 'Edit Product Data', description: 'Permission to modify the data of existing products.', dependencies: ['mod_dpp_view'], category: 'DPP Core' },
  { id: 'mod_dpp_publish', name: 'Publish DPPs', description: 'Allows users to sign, publish, and make a DPP publicly available.', dependencies: ['mod_dpp_create', 'mod_dpp_edit'], category: 'DPP Core' },

  // Traceability
  { id: 'mod_trace_view', name: 'View Supply Chain', description: 'View the traceability graph and bill of materials for a product.', dependencies: ['mod_dpp_view'], category: 'Traceability' },
  { id: 'mod_trace_edit', name: 'Edit Bill of Materials', description: 'Allows adding, editing, or removing materials from a product\'s BOM.', dependencies: ['mod_trace_view'], category: 'Traceability' },
  { id: 'mod_trace_invite', name: 'Invite Upstream Suppliers', description: 'Send data requests to upstream (Tier-N) suppliers.', dependencies: ['mod_trace_edit'], category: 'Traceability' },

  // AI & Automation
  { id: 'mod_ai_extract', name: 'Single Document AI Extraction', description: 'Use the AI to extract data from individual uploaded documents.', dependencies: [], category: 'AI & Automation' },
  { id: 'mod_ai_bulk', name: 'Bulk & Email Processing', description: 'Access to the bulk processing inbox for automated data entry from files/emails.', dependencies: ['mod_ai_extract'], category: 'AI & Automation' },
  { id: 'mod_ai_campaign', name: 'AI Campaign Generator', description: 'Use the AI assistant to draft supplier data collection campaigns.', dependencies: [], category: 'AI & Automation' },

  // Trust & Identity
  { id: 'mod_qr', name: 'QR Code Engine', description: 'Generate and manage QR codes that link to public DPPs.', dependencies: ['mod_dpp_publish'], category: 'Trust & Identity' },
  { id: 'mod_blockchain', name: 'Blockchain Anchoring', description: 'Anchor data hashes on a public or private ledger for immutability.', dependencies: ['mod_dpp_view'], category: 'Trust & Identity' },
  { id: 'mod_signatures', name: 'Digital Signatures', description: 'Apply cryptographic signatures to DPPs and other records.', dependencies: ['mod_dpp_publish'], category: 'Trust & Identity' },
];

export const mockCompanyModuleAccess: CompanyModuleAccess[] = [
  // UltraCell GmbH has almost everything
  { company_id: 'sup_1', module_id: 'mod_dpp_view', status: 'active' },
  { company_id: 'sup_1', module_id: 'mod_dpp_create', status: 'active' },
  { company_id: 'sup_1', module_id: 'mod_dpp_edit', status: 'active' },
  { company_id: 'sup_1', module_id: 'mod_dpp_publish', status: 'active' },
  { company_id: 'sup_1', module_id: 'mod_trace_view', status: 'active' },
  { company_id: 'sup_1', module_id: 'mod_trace_edit', status: 'active' },
  { company_id: 'sup_1', module_id: 'mod_trace_invite', status: 'active' },
  { company_id: 'sup_1', module_id: 'mod_ai_extract', status: 'active' },
  { company_id: 'sup_1', module_id: 'mod_ai_bulk', status: 'active' },
  { company_id: 'sup_1', module_id: 'mod_ai_campaign', status: 'active' },
  { company_id: 'sup_1', module_id: 'mod_qr', status: 'active' },
  { company_id: 'sup_1', module_id: 'mod_blockchain', status: 'inactive' }, // Not yet enabled
  { company_id: 'sup_1', module_id: 'mod_signatures', status: 'active' },
];

export const mockPlans: SubscriptionPlan[] = [
  {
    plan_id: 'plan_pro',
    plan_name: 'Pro',
    plan_features: { max_products: 50, suppliers_allowed: true, ai_support: true, blockchain_support: false },
    monthly_price: 249,
    billing_cycle: 'monthly',
    default_modules: ['mod_dpp_view', 'mod_dpp_create', 'mod_dpp_edit', 'mod_dpp_publish', 'mod_trace_view', 'mod_trace_edit', 'mod_trace_invite', 'mod_ai_extract', 'mod_ai_bulk', 'mod_ai_campaign', 'mod_qr', 'mod_signatures'],
    trial_days: 14,
    is_active: true,
    plan_limits: { storage_gb: 50, dpp_generations_monthly: 1000 },
  },
];

export const mockCompanySubscriptions: CompanySubscription[] = [
  {
    company_id: 'sup_1',
    plan_id: 'plan_pro',
    start_date: '2024-03-01T00:00:00Z',
    status: 'active',
    current_usage: {
      products_created: 3,
      storage_used_gb: 4.2,
    },
  },
];

export const mockCompanyLocalizationSettings: CompanyLocalizationSettings = {
  company_id: 'sup_1',
  default_language: 'en',
  supported_languages: ['en', 'de', 'fr'],
  default_locale: 'en-US',
  measurement_units: 'metric',
  timezone: 'Europe/Berlin',
  auto_detect_from_browser: true,
  allow_public_language_toggle: true,
  ai_translation_mode: 'auto-ai',
};


// -- ENTITY DATA --

export const mockSuppliers: Supplier[] = [
  {
    supplier_id: "sup_1", legal_entity_name: "UltraCell GmbH", company_vat_number: "DE123456789", country_of_registration: "DE", registration_number: "HRB 12345 B",
    brand_names: ["UltraCell"], entity_type: "Manufacturer", contact_email: "procurement@ultracell.de", primary_address: "Voltastrasse 1, 13355 Berlin, Germany",
    declared_scope_of_submission: "Batteries, EEE", onboarding_status: "Approved", associated_products_count: 1, created_at: "2023-01-15T09:00:00Z", last_active_at: "2024-05-22T10:00:00Z",
  },
  {
    supplier_id: "sup_2",
    legal_entity_name: "Electronics Inc.",
    company_vat_number: "US987654321",
    country_of_registration: "US",
    registration_number: "C1234567",
    brand_names: ["SoundWave"],
    entity_type: "Brand Owner",
    contact_email: "contact@soundwave.com",
    primary_address: "1 Infinite Loop, Cupertino, CA, USA",
    declared_scope_of_submission: "Consumer Electronics", onboarding_status: "Approved", associated_products_count: 2, created_at: "2023-03-20T14:00:00Z", last_active_at: "2024-05-21T11:00:00Z",
  },
  {
    supplier_id: "sup_3", legal_entity_name: "Congo Minerals S.A.", company_vat_number: "CD123456789", country_of_registration: "CD", registration_number: "RCCM 12345",
    brand_names: [], entity_type: "Supplier", contact_email: "sales@congominerals.cd", primary_address: "Lubumbashi, DRC",
    declared_scope_of_submission: "Raw Materials (Cobalt, Copper)", onboarding_status: "Invited", associated_products_count: 1, created_at: "2023-04-10T10:00:00Z", last_active_at: "2024-05-20T11:00:00Z", parent_company_id: 'sup_1'
  },
    { supplier_id: "sup_5", legal_entity_name: "Shanghai Casings Ltd.", company_vat_number: "CN123456789", country_of_registration: "CN", registration_number: "91310000MA1FL12345", brand_names: [], entity_type: "Supplier", contact_email: "contact@shcasing.cn", primary_address: "123 Industrial Rd, Shanghai, China", declared_scope_of_submission: "Plastic and Metal Casings", onboarding_status: "Invited", associated_products_count: 0, created_at: "2024-05-10T10:00:00Z", last_active_at: "2024-05-10T10:00:00Z", parent_company_id: 'sup_1'
  },
  { supplier_id: "sup_6", legal_entity_name: "Global Refineries Inc.", company_vat_number: "US987654321", country_of_registration: "US", registration_number: "C1234567", brand_names: [], entity_type: "Supplier", contact_email: "contact@globalrefineries.com", primary_address: "Houston, TX, USA", declared_scope_of_submission: "Refined Minerals", onboarding_status: "Approved", associated_products_count: 10, created_at: "2022-01-01T00:00:00Z", last_active_at: "2024-05-23T10:00:00Z", parent_company_id: 'sup_1'
  },
  {
    supplier_id: "ver_1", legal_entity_name: "SGS Global Services", company_vat_number: "CH123456789", country_of_registration: "CH", registration_number: "CHE-123.456.789",
    brand_names: ["SGS"], entity_type: "Verifier", contact_email: "verification@sgs.com", primary_address: "1 Place des Alpes, 1211 Geneva, Switzerland",
    declared_scope_of_submission: "Auditing, Verification, Certification", onboarding_status: "Approved", associated_products_count: 99, created_at: "2022-01-01T00:00:00Z", last_active_at: "2024-05-23T12:00:00Z",
  },
];

export const mockVerifiers = mockSuppliers.filter(s => s.entity_type === 'Verifier');

export const mockProducts: Product[] = [
    { id: 'prod_1', name: 'UltraCell EV-B500 Battery', current_version_id: 'ver_1' },
];

export const mockDocuments: Document[] = [
    {
        document_id: 'doc_1', product_id: 'prod_1', supplier_id: 'sup_1', certificate_rule_id: 'rule_bat_1', document_type: 'UN 38.3',
        document_name: 'un38.3_test_report.pdf',
        file_name: 'un38.3_test_report.pdf', file_extension: 'pdf', upload_date: '2024-05-18T14:30:00Z', file_size_kb: 2048,
        hash_checksum: 'e5f6g7h8i9j0k1l2e5f6g7h8i9j0k1l2e5f6g7h8i9j0k1l2e5f6g7h8i9j0k1l2', human_verification_status: 'Verified',
        valid_from: '2024-04-01', valid_until: '2026-04-01', visibility_scope: 'Shared', document_version: 1,
        ai_extracted_data: { "Test Lab": "Intertek", "Result": "Pass" },
    },
];

export const mockUploadedDocuments: Document[] = [
  { ...mockDocuments[0], human_verification_status: 'Verified' },
  {
    document_id: "doc_3",
    product_id: "prod_1",
    supplier_id: "sup_1",
    certificate_rule_id: "rule_bat_2",
    document_name: "REACH_SVHC_Declaration_Q2.pdf",
    file_name: "REACH_SVHC_Declaration_Q2.pdf",
    document_type: "Declaration",
    human_verification_status: 'Pending',
    upload_date: "2024-05-20T00:00:00Z",
    file_extension: 'pdf',
    file_size_kb: 1024,
    hash_checksum: 'mock_hash_2',
    visibility_scope: 'Internal',
    document_version: 1
  },
];


export const mockVerificationTasks: VerificationTask[] = [
  {
    verification_id: 'vtask_1',
    document_id: 'doc_1',
    document_name: 'un38.3_test_report.pdf',
    product_id: 'prod_1',
    product_name: 'UltraCell EV-B500 Battery',
    requester_id: 'sup_1',
    requester_name: 'UltraCell GmbH',
    verifier_id: 'ver_1',
    status: 'Pending',
    submitted_at: '2024-05-23T14:00:00Z',
    claim: 'Attestation of UN 38.3 transport safety compliance.',
    document_url: 'https://www.africau.edu/images/default/sample.pdf',
  },
   {
    verification_id: 'vtask_2',
    document_id: 'doc_2',
    document_name: 'reach_declaration.pdf',
    product_id: 'prod_1',
    product_name: 'UltraCell EV-B500 Battery',
    requester_id: 'sup_1',
    requester_name: 'UltraCell GmbH',
    verifier_id: 'ver_1',
    status: 'In Review',
    submitted_at: '2024-05-22T11:00:00Z',
    claim: 'Declaration of compliance with REACH Regulation (EC) No 1907/2006.',
    document_url: 'https://www.africau.edu/images/default/sample.pdf',
  },
  {
    verification_id: 'vtask_3',
    document_id: 'doc_3',
    document_name: 'rohs_compliance.pdf',
    product_id: 'prod_2',
    product_name: 'SoundWave Pro Speaker',
    requester_id: 'sup_2',
    requester_name: 'Electronics Inc.',
    verifier_id: 'ver_1',
    status: 'Approved',
    submitted_at: '2024-05-21T09:00:00Z',
    completed_at: '2024-05-22T16:00:00Z',
    claim: 'Confirmation of RoHS 3 (Directive 2015/863) compliance.',
    document_url: 'https://www.africau.edu/images/default/sample.pdf',
  },
];


// -- LOG & TRAIL DATA --

export const mockEntityNames: Record<string, string> = {
    'prod_1': 'UltraCell EV-B500 Battery',
    'prod_2': 'SoundWave Pro Speaker',
    'doc_1': 'un38.3_test_report.pdf',
    'ver_1_prod': 'Version 1.0 (prod_1)',
    'sup_1': 'UltraCell GmbH',
    'sup_2': 'Electronics Inc.',
    'sup_3': 'Congo Minerals S.A.',
    'sup_5': 'Shanghai Casings Ltd.',
    'sup_6': 'Global Refineries Inc.',
    'ver_1': 'SGS Global Services',
    'user_company_01': 'Alice Johnson'
};

export const mockUserNames: Record<string, string> = {
    'user_admin_01': 'Admin',
    'user_company_01': 'Alice (UltraCell GmbH)',
    'user_company_02': 'Bob (UltraCell GmbH)',
};

export const mockAuditLogs: AuditLog[] = [
    {
        log_id: 'log_1', product_id: 'prod_1', version_id: 'ver_1', event_type: 'Approval', actor_role: 'Admin', actor_id: 'user_admin_01',
        event_context: { "reviewed_document_id": "doc_1", "notes": "All information is correct and verified against source." },
        timestamp: '2024-05-22T15:00:00Z', event_channel: 'UI', related_entity_type: 'Document', related_entity_id: 'doc_1',
    },
];

export const mockChangeLogs: ChangeLog[] = [
    {
        log_id: "clog_1", product_id: "prod_1", version_id: "ver_1_draft", changed_by: "user_company_01", timestamp: "2024-05-20T17:00:00Z",
        change_reason: "Initial data entry.", changes: { "capacityAh": { before: null, after: 230 } }
    },
];

export const mockTraceabilityData: TraceabilityRecord[] = [
  { trace_id: "trace_1", product_id: "prod_1", material_id: "mat_cathode", material_name: "Cathode Assembly", material_type: 'Assembly', parent_trace_id: null, quantity: 40, quantity_unit: '%', tier: 1, supplier_id: "sup_1", origin_country: "DE", conflict_minerals_flag: false, compliance_status: 'Verified', is_recycled_material: false, last_updated_at: "2024-05-20T10:00:00Z" },
  { trace_id: "trace_2", product_id: "prod_1", material_id: "mat_cobalt_refined", material_name: "Refined Cobalt", material_type: 'Raw', parent_trace_id: 'trace_1', quantity: 30, quantity_unit: '%', tier: 2, supplier_id: "sup_3", origin_country: "CD", conflict_minerals_flag: true, compliance_status: 'Pending', is_recycled_material: false, last_updated_at: "2024-05-20T10:00:00Z" },
];

export const mockAnchors: BlockchainAnchor[] = [
    {
        anchor_id: 'anc_1', record_type: 'DPP_VERSION', record_id: 'ver_1', data_hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
        timestamp_utc: '2024-05-22T15:01:00Z', blockchain_type: 'Polygon', transaction_hash: '0x123abcde123abcde123abcde123abcde123abcde123abcde123abcde123a',
        anchor_status: 'CONFIRMED', anchor_url: 'https://polygonscan.com/tx/0x123abcde123abcde123abcde123abcde123abcde123abcde123abcde123a', rule_set_version: 'EU-2025.1'
    },
];

export const mockSignatures: DigitalSignature[] = [
    {
        signature_id: 'sig_1', signable_entity_type: 'DPP_VERSION', signable_entity_id: 'ver_1', signed_by_user_id: 'user_admin_01', signed_by_company_id: 'platform_admin',
        signature_timestamp: '2024-05-22T15:00:00Z', signature_hash: 'sha256_abcdef123456...', signature_method: 'PLATFORM_NATIVE', signature_status: 'SIGNED',
        signed_payload_snapshot: { versionId: 'ver_1', status: 'Approved' }, blockchain_anchor_id: 'anc_1',
    },
];

export const mockDids: DecentralizedIdentifier[] = [
  {
    did_uri: 'did:passportify:company:sup_1', did_entity_type: 'COMPANY', did_entity_id: 'sup_1',
    did_doc: { "@context": "https://www.w3.org/ns/did/v1", "id": "did:passportify:company:sup_1", "verificationMethod": [{ "id": "did:passportify:company:sup_1#keys-1", "type": "EcdsaSecp256k1VerificationKey2019", "controller": "did:passportify:company:sup_1", "publicKeyHex": "0412..." }] },
    created_at: '2023-01-15T09:00:00Z', last_updated_at: '2024-05-22T10:00:00Z',
  },
  {
    did_uri: 'did:passportify:product:prod_1', did_entity_type: 'PRODUCT_ITEM', did_entity_id: 'prod_1',
    did_doc: { "@context": "https://www.w3.org/ns/did/v1", "id": "did:passportify:product:prod_1", "verificationMethod": [] },
    created_at: '2024-05-20T16:00:00Z', last_updated_at: '2024-05-22T15:00:00Z',
  },
];

export const mockVerifiableCredentials: VerifiableCredential[] = [
  {
    vc_id: 'vc_1', vc_issuer_did: 'did:passportify:company:sup_1', vc_subject_did: 'did:passportify:product:prod_1', vc_type: 'COMPLIANCE_SIGNOFF',
    vc_payload: { "@context": ["https://www.w3.org/2018/credentials/v1"], "type": ["VerifiableCredential", "DPPComplianceCredential"], "credentialSubject": { "id": "did:passportify:product:prod_1", "claim": "Compliant with Battery Regulation (EU) 2023/1542" } },
    vc_signature: { "type": "EcdsaSecp256k1Signature2019", "proofValue": "eyJ..." }, vc_status: 'ISSUED', vc_valid_from: '2024-05-22T15:00:00Z',
  },
];

export const mockCompanyDids = mockDids.filter(did => did.did_doc.controller === 'did:passportify:company:sup_1' || did.did_uri === 'did:passportify:company:sup_1');
export const mockCompanyVerifiableCredentials = mockVerifiableCredentials.filter(vc => vc.vc_issuer_did === 'did:passportify:company:sup_1');


export const mockSupplierScores: SupplierScore[] = [
  {
    supplier_id: 'sup_1',
    overall_score: 92,
    compliance_score: 95,
    responsiveness_score: 98,
    verification_rate: 100,
    badge: 'Gold',
    score_history: [
      { month: 'Jan', score: 85 },
      { month: 'Feb', score: 88 },
      { month: 'Mar', score: 90 },
      { month: 'Apr', score: 91 },
      { month: 'May', score: 92 },
    ],
  },
  {
    supplier_id: 'sup_2',
    overall_score: 85,
    compliance_score: 88,
    responsiveness_score: 90,
    verification_rate: 95,
    badge: 'Silver',
    score_history: [
        { month: 'Jan', score: 80 },
        { month: 'Feb', score: 82 },
        { month: 'Mar', score: 83 },
        { month: 'Apr', score: 84 },
        { month: 'May', score: 85 },
    ],
  },
  {
    supplier_id: 'sup_3',
    overall_score: 68,
    compliance_score: 70,
    responsiveness_score: 65,
    verification_rate: 80,
    badge: 'Incomplete',
     score_history: [
        { month: 'Jan', score: 60 },
        { month: 'Feb', score: 62 },
        { month: 'Mar', score: 65 },
        { month: 'Apr', score: 66 },
        { month: 'May', score: 68 },
    ],
  },
  {
    supplier_id: 'sup_5',
    overall_score: 75,
    compliance_score: 80,
    responsiveness_score: 70,
    verification_rate: 85,
    badge: 'Bronze',
     score_history: [
        { month: 'Jan', score: 70 },
        { month: 'Feb', score: 71 },
        { month: 'Mar', score: 72 },
        { month: 'Apr', score: 74 },
        { month: 'May', score: 75 },
    ],
  },
  {
    supplier_id: 'sup_6',
    overall_score: 95,
    compliance_score: 98,
    responsiveness_score: 92,
    verification_rate: 100,
    badge: 'Gold',
     score_history: [
        { month: 'Jan', score: 90 },
        { month: 'Feb', score: 91 },
        { month: 'Mar', score: 92 },
        { month: 'Apr', score: 94 },
        { month: 'May', score: 95 },
    ],
  }
];


// -- DASHBOARD & PORTAL-SPECIFIC DATA --

export const mockCompanyProducts: CompanyProduct[] = [
    {
        id: "prod_1",
        name: "UltraCell EV-B500 Battery",
        companyName: "UltraCell GmbH",
        status: "Approved",
        version: "1.3",
        lastUpdated: "2024-05-22T15:00:00Z",
        complianceIssues: 0,
        score: 92,
        scoreBreakdown: { compliance: 95, traceability: 88, sustainability: 93 },
        improvementSuggestions: [
            {
                title: "Complete Tier 2 Traceability",
                description: "Traceability data for the 'Cathode Assembly' is incomplete. Add your upstream supplier for this component.",
                link: "/company-portal/my-products/prod_1/traceability",
                linkText: "Manage Traceability"
            }
        ]
    },
    {
        id: "prod_2",
        name: "SoundWave Pro Speaker",
        companyName: "Electronics Inc.",
        status: "Draft",
        version: "0.1",
        lastUpdated: "2024-05-23T11:00:00Z",
        complianceIssues: 3,
        score: 68,
        scoreBreakdown: { compliance: 60, traceability: 75, sustainability: 70 },
        improvementSuggestions: [
            {
                title: "Link RoHS Declaration",
                description: "The Restriction of Hazardous Substances declaration is missing. This is a critical requirement.",
                link: "/company-portal/my-products/prod_2/documents",
                linkText: "Upload Document"
            },
            {
                title: "Specify Recycled Content",
                description: "The percentage of recycled materials has not been specified for the main housing.",
                link: "#", // In a real app, this would link to the product edit page
                linkText: "Edit Product"
            }
        ]
    },
    {
        id: "prod_3",
        name: "EcoCharge Power Bank",
        companyName: "UltraCell GmbH",
        status: "Approved",
        version: "2.0",
        lastUpdated: "2024-05-21T09:45:00Z",
        complianceIssues: 0,
        score: 100,
        scoreBreakdown: { compliance: 100, traceability: 100, sustainability: 100 },
        improvementSuggestions: []
    }
];

export const mockAllProducts: CompanyProduct[] = [
    ...mockCompanyProducts,
    {
        id: "prod_4", name: "SoundWave Pro Gen 2", companyName: "Electronics Inc.", status: "Approved", version: "2.1",
        lastUpdated: "2024-05-20T10:00:00Z", complianceIssues: 0, score: 95,
        scoreBreakdown: { compliance: 98, traceability: 90, sustainability: 97 },
    },
    {
        id: "prod_5", name: "DuraTee Organic", companyName: "FashionFabrics Ltd.", status: "Draft", version: "0.5",
        lastUpdated: "2024-05-23T16:00:00Z", complianceIssues: 2, score: 72,
        scoreBreakdown: { compliance: 70, traceability: 80, sustainability: 65 },
    }
];

export const mockAllMaterials: MaterialSpecification[] = [
    { material_id: "mat_spec_1", supplier_id: "sup_3", material_name: "Cobalt (Grade A, 99.8%)", material_code: "CM-CO-A-998", material_type: "Raw", description: "High-purity cobalt for battery cathodes.", specifications: { purity: "99.8%", form: "Powder" }, created_at: "2024-04-15T10:00:00Z", last_updated_at: "2024-05-20T11:30:00Z" },
    { material_id: "mat_spec_2", supplier_id: "sup_3", material_name: "Nickel Sulphate", material_code: "CM-NI-S04", material_type: "Raw", description: "Battery-grade Nickel Sulphate for NMC cathode production.", specifications: { "Ni-content": "22.3%" }, created_at: "2024-03-10T09:00:00Z", last_updated_at: "2024-05-18T14:00:00Z" },
    { material_id: "mat_spec_3", supplier_id: "sup_6", material_name: "Recycled Polycarbonate", material_code: "GR-PC-R-01", material_type: "Subcomponent", description: "Post-consumer recycled PC for casings.", specifications: { "PCR Content": "85%" }, created_at: "2024-02-01T00:00:00Z", last_updated_at: "2024-05-15T10:00:00Z" },
];

export const mockAllCertificates: Document[] = [
    ...mockDocuments,
    { document_id: 'doc_2', product_id: 'prod_4', supplier_id: 'sup_2', certificate_rule_id: '', document_name: 'fcc_grant.pdf', document_type: 'FCC Declaration', file_name: 'fcc_grant.pdf', file_extension: 'pdf', upload_date: '2024-05-10T10:00:00Z', file_size_kb: 512, hash_checksum: 'f1g2h3i4j5k6f1g2h3i4j5k6f1g2h3i4j5k6f1g2h3i4j5k6f1g2h3i4j5k6f1g2', human_verification_status: 'Verified', valid_until: '2028-05-10', visibility_scope: 'Shared', document_version: 1, },
    { document_id: 'doc_3', product_id: 'prod_5', supplier_id: 'sup_3', certificate_rule_id: '', document_name: 'gots_cert_2024.pdf', document_type: 'GOTS Certificate', file_name: 'gots_cert_2024.pdf', file_extension: 'pdf', upload_date: '2024-05-23T16:05:00Z', file_size_kb: 1024, hash_checksum: 'g2h3i4j5k6l1g2h3i4j5k6l1g2h3i4j5k6l1g2h3i4j5k6l1g2h3i4j5k6l1g2h3', human_verification_status: 'Pending', valid_until: '2025-06-30', visibility_scope: 'Shared', document_version: 1, },
];

export const mockCompanyAuditLogs: AuditLog[] = [
    {
        log_id: 'clog_1', product_id: 'prod_1', version_id: 'ver_1', event_type: 'Create', actor_role: 'Supplier', actor_id: 'user_company_01',
        event_context: { product_name: 'UltraCell EV-B500 Battery' }, timestamp: '2024-05-20T16:00:00Z', event_channel: 'UI',
        related_entity_id: 'prod_1', related_entity_type: 'Product',
    }
];

export const mockCompanyChangeLogs: ChangeLog[] = [
    {
        log_id: "chlog_1", product_id: "prod_1", version_id: "ver_1_draft1", changed_by: "user_company_01", timestamp: "2024-05-20T16:30:00Z",
        change_reason: "Initial data entry for new product.", changes: { "productName": { before: null, after: "UltraCell EV-B500 Battery" } }
    }
];

export const mockCompanyAnchors: BlockchainAnchor[] = [ { ...mockAnchors[0] } ];
export const mockCompanySignatures: DigitalSignature[] = [
    {
        signature_id: 'sig_2', signable_entity_type: 'DPP_VERSION', signable_entity_id: 'ver_1', signed_by_user_id: 'user_company_02', signed_by_company_id: 'sup_1',
        signature_timestamp: '2024-05-22T14:59:00Z', signature_hash: 'sha256_7g8h9i0j1k2l...', signature_method: 'PLATFORM_NATIVE', signature_status: 'SIGNED',
        signed_payload_snapshot: { versionId: 'ver_1', status: 'Approved' }, blockchain_anchor_id: 'anc_1',
    },
];

export const mockCompanyQrLogs: QRCodeLog[] = [
    {
      qr_code_id: 'qr_company_1',
      product_id: 'prod_1',
      version_id: 'ver_1.3',
      qr_code_value: 'https://dpp.example.com/view/prod_1?v=1.3',
      hash_signature: 'sha256_123company456',
      rendered_image_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Placeholder
      last_updated_at: '2024-05-22T15:00:00Z',
      generated_by: 'user_company_02',
      status: 'Active',
      redirect_mode: 'Direct Link'
    }
];

export const mockCompanySuppliers: Supplier[] = mockSuppliers.filter(s => s.parent_company_id === 'sup_1' || s.supplier_id === 'sup_1');

export const mockCompanyTeamMembers: any[] = [
    { id: "user_1", name: "Alice Johnson", email: "alice.j@ultracell.de", role: "Admin", lastActive: "2024-05-23T10:00:00Z", avatarUrl: "https://placehold.co/40x40.png" },
];

export const mockCompanyBranding: CompanyBranding = {
  company_id: 'sup_1',
  logo_url: 'https://placehold.co/150x50.png',
  brand_name: 'UltraCell GmbH',
  primary_color: '#0055A4',
  secondary_color: '#F1F3F5',
  support_url: 'https://support.ultracell.de',
  custom_footer_text: '© 2024 UltraCell GmbH. All Rights Reserved.',
};

export const mockCampaigns: Campaign[] = [
    { id: "camp_1", name: "Q2 2024 Cobalt Data Request", status: "Sent", targetAudience: "Tier 1 Cobalt Suppliers", sentDate: "2024-04-15T10:00:00Z", createdBy: "Alice Johnson" },
];

export const mockDataRequests = [
    { id: "req_1", company: "UltraCell GmbH", product: "UltraCell EV-B500 Battery", material: "Cobalt", status: "Action Required", dueDate: "2024-06-15", },
];

export const mockSubSuppliers: Omit<Supplier, 'brand_names' | 'declared_scope_of_submission' | 'created_at' | 'last_active_at'>[] = [
  { supplier_id: "sub_sup_1", legal_entity_name: "DRC Mines Ltd.", company_vat_number: "CD987654321", country_of_registration: "CD", registration_number: "RCCM 67890", entity_type: "Supplier", contact_email: "contact@drcmines.cd", primary_address: "Kolwezi, DRC", onboarding_status: "Invited", associated_products_count: 0 },
  { supplier_id: "sub_sup_2", legal_entity_name: "African Refineries Co.", company_vat_number: "ZA123123123", country_of_registration: "ZA", registration_number: "2001/012345/07", entity_type: "Supplier", contact_email: "sales@africanrefineries.za", primary_address: "Johannesburg, South Africa", onboarding_status: "Approved", associated_products_count: 3 },
];

export const initialSubMaterials: TraceabilityRecord[] = [
  { trace_id: "subtrace_1", product_id: "req_1", material_id: "mat_raw_co", material_name: "Raw Cobalt Ore", material_type: 'Raw', quantity: 95, quantity_unit: '%', tier: 3, supplier_id: "sub_sup_1", origin_country: "CD", conflict_minerals_flag: true, compliance_status: 'Pending', is_recycled_material: false, last_updated_at: "2024-05-21T10:00:00Z" },
  { trace_id: "subtrace_2", product_id: "req_1", material_id: "mat_proc_chem", material_name: "Processing Chemicals", material_type: 'Additive', quantity: 5, quantity_unit: '%', tier: 3, supplier_id: "sub_sup_2", origin_country: "ZA", conflict_minerals_flag: false, compliance_status: 'Verified', is_recycled_material: false, last_updated_at: "2024-05-21T10:00:00Z" },
];


export const mockSupplierMaterialSpecs: MaterialSpecification[] = [
    {
        material_id: "mat_spec_1", supplier_id: "sup_3", material_name: "Cobalt (Grade A, 99.8%)", material_code: "CM-CO-A-998", material_type: "Raw",
        description: "High-purity cobalt for battery cathodes.", specifications: { purity: "99.8%", form: "Powder" },
        created_at: "2024-04-15T10:00:00Z", last_updated_at: "2024-05-20T11:30:00Z",
    },
];

export const mockMaterialDocuments: MaterialDocument[] = [
    { document_id: "doc_mat_1", material_id: "mat_spec_1", document_name: "Certificate of Analysis - Cobalt Grade A.pdf", document_type: "Test Report", file_url: "#", upload_date: "2024-05-10T00:00:00Z", expiry_date: "2025-05-10T00:00:00Z" },
    { document_id: "doc_mat_2", material_id: "mat_spec_1", document_name: "Safety Data Sheet - Cobalt.pdf", document_type: "Data Sheet", file_url: "#", upload_date: "2024-04-20T00:00:00Z" },
];

export const mockAssociatedProducts = [
    {
        productId: "prod_1", requestId: "req_1", productName: "UltraCell EV-B500 Battery", dppStatus: "Approved" as const,
        requester: "UltraCell GmbH", lastUpdated: "2024-05-22T15:00:00Z", materialSupplied: "Cobalt",
    },
    {
        productId: "prod_1", // A product where they supply a different material
        requestId: "req_2",
        productName: "UltraCell EV-B500 Battery",
        dppStatus: "Approved" as const,
        requester: "UltraCell GmbH",
        lastUpdated: "2024-05-22T15:00:00Z",
        materialSupplied: "Nickel",
    },
    {
        productId: "prod_4", // Fictional product for this mock, from a different company
        requestId: null, // No active data request for this product
        productName: "PowerCore 10000",
        dppStatus: "Approved" as const,
        requester: "Anker Innovations",
        lastUpdated: "2024-03-15T11:00:00Z",
        materialSupplied: "Refined Lithium",
    }
];

export const mockAdminDashboardActivity = [
  { actor: "UltraCell GmbH", action: "created a new product:", target: "UltraCell EV-B500 Battery", time: "2h ago", link: "/view/prod_1", type: "Product" as const },
];

export const mockPlatformDocumentStatus = [
    { name: 'Verified', value: 78, color: "hsl(var(--chart-1))" },
    { name: 'Pending', value: 25, color: "hsl(var(--chart-2))" },
    { name: 'Rejected', value: 10, color: "hsl(var(--chart-5))" },
];

export const mockCompanyProductStatus = [
    { name: 'Approved', value: 2, color: "var(--color-Approved)"},
    { name: 'Draft', value: 1, color: "var(--color-Draft)" },
];

export const mockCompanyDocStatus = [
    { name: 'Verified', value: 12, color: "var(--color-Verified)"},
    { name: 'Pending', value: 5, color: "var(--color-Pending)" },
    { name: 'Rejected', value: 2, color: "var(--color-Rejected)" },
];

export const mockCompanySubmissions = [
  { month: 'Jan', products: 2 },
  { month: 'Feb', products: 1 },
  { month: 'Mar', products: 3 },
  { month: 'Apr', products: 2 },
  { month: 'May', products: 4 },
];

export const mockSupplierSubmissionStatus = [
  { name: 'Action Required', value: 3, color: "var(--color-ActionRequired)" },
  { name: 'Submitted', value: 5, color: "var(--color-Submitted)" },
  { name: 'Approved', value: 10, color: "var(--color-Approved)" },
];

export const mockPrivacyConsents: PrivacyConsent[] = [
  { supplier_id: 'sup_3', permissions: { share_full_dpp: true, share_traceability_data: true, share_compliance_status: true } },
  { supplier_id: 'sup_5', permissions: { share_full_dpp: true, share_traceability_data: false, share_compliance_status: true } },
  { supplier_id: 'sup_6', permissions: { share_full_dpp: false, share_traceability_data: false, share_compliance_status: true } },
];


// -- NEW DASHBOARD DATA --

export const mockMonthlyOnboardingData = [
  { month: 'Jan', companies: 2, suppliers: 5, products: 12, certificates: 30 },
  { month: 'Feb', companies: 3, suppliers: 7, products: 15, certificates: 45 },
  { month: 'Mar', companies: 4, suppliers: 10, products: 22, certificates: 60 },
  { month: 'Apr', companies: 5, suppliers: 12, products: 28, certificates: 80 },
  { month: 'May', companies: 6, suppliers: 15, products: 35, certificates: 100 },
];

export const mockUserActivity = [
  { name: 'John Doe (FashionFabrics)', email: 'john.d@fashionfabrics.co.uk', daysSinceLogin: 95 },
  { name: 'Jane Smith (Electronics Inc.)', email: 'jane.s@soundwave.com', daysSinceLogin: 62 },
  { name: 'Sam Brown (UltraCell GmbH)', email: 'sam.b@ultracell.de', daysSinceLogin: 31 },
];

export const mockInactiveCompanies = [
  { name: 'FashionFabrics Ltd.', lastActivity: '45 days ago' },
  { name: 'Legacy Parts Co.', lastActivity: '68 days ago' },
];

export const mockTopAiUsage = [
  { company: 'UltraCell GmbH', value: 1250 },
  { company: 'Electronics Inc.', value: 800 },
];

export const mockTopBlockchainUsage = [
  { company: 'UltraCell GmbH', value: 250 },
  { company: 'Electronics Inc.', value: 150 },
];

export const mockTopFeatures = [
    { feature: 'DPP Publishing', usageCount: 25 },
    { feature: 'AI Document Extraction', usageCount: 22 },
    { feature: 'Traceability Graph', usageCount: 18 },
];

export const mockTopBugReporters = [
  { user: 'Alice (UltraCell GmbH)', count: 5 },
  { user: 'Bob (Electronics Inc.)', count: 3 },
];

export const mockSupportTickets: SupportTicket[] = [
  {
    ticket_id: 'tkt_1', submitted_by_user: 'Alice Johnson', submitted_by_company: 'UltraCell GmbH', type: 'bug',
    subject: 'Cannot upload PDF over 5MB', description: 'When I try to upload a large compliance document, it fails without an error message.',
    status: 'Open', priority: 'High', created_at: '2024-05-23T10:00:00Z', last_updated_at: '2024-05-23T10:00:00Z',
  },
  {
    ticket_id: 'tkt_2', submitted_by_user: 'Sales Team', submitted_by_company: 'Congo Minerals S.A.', type: 'ticket',
    subject: 'Question about data request', description: 'What does "Action Required" mean on our dashboard? We are not sure what to do next.',
    status: 'In Progress', priority: 'Medium', created_at: '2024-05-22T14:00:00Z', last_updated_at: '2024-05-23T09:00:00Z', admin_notes: 'Replied with explanation of the data request process. Waiting for their response.'
  },
   {
    ticket_id: 'tkt_3', submitted_by_user: 'Auditor', submitted_by_company: 'SGS Global Services', type: 'ticket',
    subject: 'Bulk approval feature request', description: 'It would be helpful to approve multiple verification tasks at once.',
    status: 'Resolved', priority: 'Low', created_at: '2024-05-20T11:00:00Z', last_updated_at: '2024-05-21T16:00:00Z', resolved_at: '2024-05-21T16:00:00Z', admin_notes: 'Added to feature backlog for Q3 planning.'
  },
];


// -- PUBLIC DPP DATA --

export const mockDppData: Record<string, PublicDppData> = {
  "prod_1": {
    productId: "prod_1", versionId: "ver_1", productName: "UltraCell EV-B500 Battery", productModel: "U-EV-500", brandName: "UltraCell",
    complianceStatus: "Compliant", sustainabilityScore: 88, lastUpdatedAt: "2024-05-22T14:00:00Z", qrCodeImage: "https://placehold.co/150x150.png", productImage: "https://placehold.co/600x400.png",
    productDetails: { gtin: "01234567890123", serialNumber: "SN-A7B3-C9D1-E5F6", manufacturingDate: "2024-02-15", placeOfManufacture: "Berlin, Germany", },
    manufacturerInfo: { name: "UltraCell GmbH", address: "Voltastrasse 1, 13355 Berlin, Germany", website: "https://ultracell.example.com", contact: "support@ultracell.example.com", },
    complianceAndCertificates: [
      { name: "EU Declaration of Conformity", status: "Verified", documentType: "CE Mark", validUntil: "N/A" },
      { name: "UN 38.3 Test Report", status: "Verified", documentType: "Transport Safety", validUntil: "2026-04-01" },
    ],
    materialAndCircularity: {
      recycledContentPercentage: 15.5, reparabilityScore: 7.8, dismantlingInstructionsUrl: "https://ultracell.example.com/dismantle/U-EV-500",
      materialComposition: [
        { material: "Cobalt", percentage: 12, isHazardous: true, substanceId: "CAS 7440-48-4", originCountry: "CD" },
        { material: "Nickel", percentage: 60, isHazardous: false, originCountry: "AU" },
      ],
    },
    technicalSpecifications: {
      weightKg: 451.2, dimensions: "150cm x 90cm x 30cm", chemistry: "Lithium Nickel Manganese Cobalt Oxide (NMC)",
      nominalVoltage: "400V", capacityAh: 230, operatingTemperature: "-20°C to 60°C",
    },
    lifecycleAndPerformance: {
      warrantyPeriod: "8 years or 160,000 km", expectedLifetime: "3000 cycles at 80% DoD", stateOfHealth: "100%", carbonFootprint: "65 kg CO2-eq/kWh",
    },
    digitalSignature: { signedBy: "UltraCell GmbH (Compliance Officer)", signedAt: "2024-05-22T14:30:00Z", method: "Platform Native Signature", }
  },
};

export const mockNotifications = [
  {
    id: "notif_1",
    title: "New Product Approval",
    description: "Your product 'UltraCell EV-B500 Battery' has been approved by the admin.",
    timestamp: "2 hours ago",
    link: "/company-portal/my-products/prod_1",
    read: false,
  },
  {
    id: "notif_2",
    title: "Data Submission Received",
    description: "Congo Minerals S.A. has submitted traceability data for Cobalt.",
    timestamp: "8 hours ago",
    link: "/company-portal/my-products/prod_1/traceability",
    read: false,
  },
  {
    id: "notif_3",
    title: "Certificate Expiring Soon",
    description: "The 'UN 38.3' certificate for 'UltraCell EV-B500' expires in 15 days.",
    timestamp: "1 day ago",
    link: "/company-portal/my-products/prod_1/documents",
    read: false,
  },
  {
    id: "notif_4",
    title: "Compliance Issue Found",
    description: "A compliance issue was found with 'SoundWave Pro Speaker'.",
    timestamp: "2 days ago",
    link: "/company-portal/my-products/prod_2",
    read: true,
  },
  {
    id: "notif_5",
    title: "New Supplier Onboarded",
    description: "Congo Minerals S.A. has accepted your invitation and joined your network.",
    timestamp: "3 days ago",
    link: "/company-portal/suppliers",
    read: true,
  }
];

export const mockEmailTemplates: EmailTemplate[] = [
    {
        template_id: 'tmpl_welcome',
        template_name: 'Welcome to Passportify',
        email_subject: 'Welcome to the Passportify Platform!',
        email_body: 'Hi {{user.name}},\n\nWelcome to Passportify! You have been invited to join the platform by {{company.name}}.\n\nPlease log in to get started.\n\nThanks,\nThe Passportify Team'
    },
    {
        template_id: 'tmpl_invite_expired',
        template_name: 'Supplier Invitation Expired',
        email_subject: 'Your Passportify Invitation has Expired',
        email_body: 'Hi team at {{supplier.name}},\n\nThe invitation to join Passportify sent by {{company.name}} has expired. Please contact them to request a new invitation.\n\nThanks,\nThe Passportify Team'
    },
    {
        template_id: 'tmpl_cert_expiring',
        template_name: 'Certificate Expiring Soon',
        email_subject: 'Action Required: Certificate for {{product.name}} is expiring',
        email_body: 'Hi {{user.name}},\n\nThis is a reminder that the certificate "{{certificate.name}}" for product "{{product.name}}" will expire in {{days_remaining}} days.\n\nPlease log in to upload a new version.\n\nThanks,\n The Passportify Team'
    },
    {
        template_id: 'tmpl_first_login',
        template_name: 'User First Login',
        email_subject: 'Welcome back to Passportify!',
        email_body: 'Hi {{user.name}},\n\nThanks for logging in. Explore your dashboard to get started.\n\nLet us know if you have any questions.\n\nThanks,\nThe Passportify Team'
    },
    {
        template_id: 'tmpl_2fa_otp',
        template_name: 'Two-Factor Auth OTP',
        email_subject: 'Your Passportify Verification Code',
        email_body: 'Hi {{user.name}},\n\nYour one-time password is: {{otp_code}}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nThanks,\nThe Passportify Team'
    },
    {
        template_id: 'tmpl_invite_accepted',
        template_name: 'Invite Accepted',
        email_subject: '{{supplier.name}} has joined your network!',
        email_body: 'Hi {{user.name}},\n\nGood news! {{supplier.name}} has accepted your invitation and is now part of your network on Passportify.\n\nYou can now assign them to materials in your product\'s Bill of Materials.\n\nThanks,\nThe Passportify Team'
    },
    {
        template_id: 'tmpl_supplier_submission',
        template_name: 'Supplier Data Submitted',
        email_subject: 'New Data Submission from {{supplier.name}} for {{product.name}}',
        email_body: 'Hi {{user.name}},\n\n{{supplier.name}} has submitted the required data for the material "{{material.name}}" for your product "{{product.name}}".\n\nPlease log in to your portal to review and approve the submission.\n\nThanks,\nThe Passportify Team'
    },
    {
        template_id: 'tmpl_cert_added',
        template_name: 'Certificate Added',
        email_subject: 'New Certificate Added for {{product.name}}',
        email_body: 'Hi {{user.name}},\n\nA new certificate, "{{certificate.name}}", has been added to your product "{{product.name}}".\n\nIt is now pending verification.\n\nThanks,\nThe Passportify Team'
    },
    {
        template_id: 'tmpl_product_non_compliant',
        template_name: 'Product Compliance Alert',
        email_subject: 'Action Required: Compliance Issue with {{product.name}}',
        email_body: 'Hi {{user.name}},\n\nA compliance check has flagged an issue with your product "{{product.name}}".\n\nIssue: {{issue.description}}\n\nPlease log in to review the details and resolve the issue.\n\nThanks,\nThe Passportify Team'
    },
    {
        template_id: 'tmpl_material_rejected',
        template_name: 'Material Submission Rejected',
        email_subject: 'Update Required for your submission to {{company.name}}',
        email_body: 'Hi {{supplier.name}},\n\nYour recent data submission for the material "{{material.name}}" for product "{{product.name}}" has been rejected by {{company.name}}.\n\nReason: {{rejection.reason}}\n\nPlease log in to your supplier portal to correct and resubmit the data.\n\nThanks,\nThe Passportify Team'
    },
    {
        template_id: 'tmpl_new_product_created',
        template_name: 'New Product Draft Created',
        email_subject: 'New Product Draft "{{product.name}}" Created',
        email_body: 'Hi {{user.name}},\n\nA new product draft for "{{product.name}}" has been successfully created in your portal.\n\nYou can now proceed with adding documents and traceability information.\n\nThanks,\nThe Passportify Team'
    },
    {
        template_id: 'tmpl_product_approved',
        template_name: 'Product Approved',
        email_subject: 'Your Product "{{product.name}}" has been Approved',
        email_body: 'Hi {{user.name}},\n\nGreat news! Your product "{{product.name}}" has been approved.\n\nYou can now generate a public DPP and QR code for it.\n\nThanks,\nThe Passportify Team'
    },
];

export const mockEmailTriggers: EmailTrigger[] = [
    { trigger_id: 'trig_1', trigger_name: 'Supplier Invited', description: 'Sent when a new supplier is invited to the platform.', template_id: 'tmpl_welcome', enabled: true },
    { trigger_id: 'trig_2', trigger_name: 'Invitation Expired', description: 'Sent when a supplier invitation is not accepted in time.', template_id: 'tmpl_invite_expired', enabled: true },
    { trigger_id: 'trig_3', trigger_name: 'Certificate Expiring Soon', description: 'Sent 30 days before a compliance certificate expires.', template_id: 'tmpl_cert_expiring', enabled: true },
    { trigger_id: 'trig_4', trigger_name: 'Product Approved', description: 'Sent to a company user when their product is approved.', template_id: 'tmpl_product_approved', enabled: false },
    { trigger_id: 'trig_5', trigger_name: 'Data Request Received', description: 'Sent to a supplier when a customer requests data.', template_id: 'tmpl_welcome', enabled: true },
    { trigger_id: 'trig_6', trigger_name: 'User First Login', description: 'Sent to a user when they log in for the very first time.', template_id: 'tmpl_first_login', enabled: true },
    { trigger_id: 'trig_7', trigger_name: 'Two-Factor Authentication', description: 'Sends a one-time password for 2FA login.', template_id: 'tmpl_2fa_otp', enabled: true },
    { trigger_id: 'trig_8', trigger_name: 'Invitation Accepted', description: 'Sent to the inviting company when a supplier accepts an invite.', template_id: 'tmpl_invite_accepted', enabled: true },
    { trigger_id: 'trig_9', trigger_name: 'Supplier Data Submitted', description: 'Sent to a company when a supplier provides requested data.', template_id: 'tmpl_supplier_submission', enabled: true },
    { trigger_id: 'trig_10', trigger_name: 'New Certificate Added', description: 'Sent to a company when a new certificate is uploaded to one of their products.', template_id: 'tmpl_cert_added', enabled: false },
    { trigger_id: 'trig_11', trigger_name: 'Product Compliance Issue', description: 'Sent when an automated check finds a compliance issue with a product.', template_id: 'tmpl_product_non_compliant', enabled: true },
    { trigger_id: 'trig_12', trigger_name: 'Material Submission Rejected', description: 'Sent to a supplier when their data submission is rejected.', template_id: 'tmpl_material_rejected', enabled: true },
    { trigger_id: 'trig_13', trigger_name: 'New Product Created', description: 'Sent to a user when they create a new product draft.', template_id: 'tmpl_new_product_created', enabled: true },
];

export const mockAllEntities = mockSuppliers;
