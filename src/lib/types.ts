
export type Industry = {
  industry_id: string;
  industry_name: string;
  industry_code: string;
  description?: string;
  regulatory_body?: string;
  compliance_frameworks: string[];
  active: boolean;
};

export type ProductCategory = {
  category_id: string;
  industry_id: string;
  category_name: string;
  category_code?: string;
  description?: string;
  form_template_id: string;
  requires_traceability: boolean;
  requires_certificates: boolean;
  active: boolean;
};

export type FormTemplateField = {
  field_id: string;
  label: string;
  type: 'text' | 'float' | 'select' | 'boolean' | 'textarea' | 'date';
  required: boolean;
  min?: number;
  max?: number;
  options?: string[];
  placeholder?: string;
};

export type FormTemplate = {
  form_template_id: string;
  form_template_name: string;
  version_type: 'product' | 'material' | 'certificate' | 'traceability';
  industry_id: string;
  category_id: string;
  version: string;
  fields_schema: FormTemplateField[];
  is_active: boolean;
  is_master_template: boolean;
  notes?: string;
  effective_date?: string;
  created_by: string;
};

export type CertificateRule = {
  certificate_rule_id: string;
  industry_id: string;
  category_id?: string;
  material_filter?: Record<string, any>;
  certificate_type: string;
  description: string;
  mandatory: boolean;
  trigger_condition: Record<string, any>;
  expected_format: 'PDF' | 'XML' | 'JSON' | 'Any';
  validation_method: 'AI' | 'Manual' | 'External DB' | 'QR';
  issued_by: string;
  validity_period_days?: number;
  regulation_reference: string;
  last_updated_at: string;
  active: boolean;
};

export type Product = {
  id: string;
  name: string;
  current_version_id: string;
};


export type ProductMetadata = {
  // 1. Identification Fields
  product_id: string; // UUID
  product_name: string;
  product_model_number: string;
  product_version: string | number;
  serial_number_format?: string;
  barcode_format?: 'GS1' | 'QR' | 'internal';

  // 2. Ownership & Company Info
  company_id: string; // UUID
  brand_name: string;
  manufacturer_country: string; // ISO Code
  assembly_location?: string; // ISO Code
  legal_entity_name: string;

  // 3. Classification Fields
  industry_id: string; // UUID
  category_id: string; // UUID
  form_template_id: string; // UUID
  eu_nace_code: string;
  product_cpc_code?: string;
  intended_use?: string;

  // 4. Technical Specifications
  weight_in_kg: number;
  dimensions_cm?: { L: number; W: number; H: number };
  material_family: string;
  composition_breakdown: Record<string, unknown>; // JSON
  recycled_content_pct?: number;
  hazardous_materials_flag: boolean;
  substances_of_concern?: string[];
  battery_chemistry?: string;
  power_rating?: number;
  capacity_rating?: number;

  // 5. Lifecycle & Circularity
  repairability_index?: number;
  durability_estimate_months?: number;
  designed_for_disassembly?: boolean;
  reuse_potential?: 'High' | 'Medium' | 'Low';
  modularity_flag?: boolean;
  remanufactured_flag?: boolean;

  // 6. Regulatory Declarations
  reach_applicable: boolean;
  rohs_applicable: boolean;
  ecodesign_applicable: boolean;
  battery_regulation_applicable: boolean;
  dpp_required_flag: boolean;
  conflict_minerals_presence?: boolean;
  ce_marking?: boolean;
  compliance_notes?: string;

  // 7. Public Visibility Flags
  public_fields: string[]; // JSON list of fields
  public_url_slug: string;
  qr_code_hash: string;

  // 8. Audit Trail & Versioning
  created_by: string; // UUID
  created_at: string; // Timestamp
  last_updated_at: string; // Timestamp
  current_status: 'Draft' | 'Submitted' | 'Approved' | 'Deprecated';
  last_audited_on?: string; // Timestamp
  last_verified_by?: string; // UUID
};

export type Document = {
  document_id: string;
  product_id: string;
  supplier_id: string;
  certificate_rule_id: string;
  document_name: string;
  document_type: string;
  file_name: string;
  file_extension: 'pdf' | 'docx' | 'xlsx' | 'xml' | 'png' | 'jpg';
  upload_date: string; // ISO timestamp
  file_size_kb: number;
  hash_checksum: string; // SHA256 mock
  ai_extracted_data?: Record<string, any>;
  human_verification_status: 'Pending' | 'Verified' | 'Rejected' | 'Escalated';
  reason_if_rejected?: string;
  valid_from?: string; // Date string
  valid_until?: string; // Date string
  visibility_scope: 'Internal' | 'Shared' | 'Public';
  document_version: number;
  notes?: string;
};

export type AuditLog = {
  log_id: string;
  product_id: string;
  version_id: string;
  event_type: 'Create' | 'Update' | 'Upload' | 'Validation' | 'Approval' | 'Rejection' | 'View' | 'QR_Scan' | 'AI_Processing';
  actor_role: 'Admin' | 'Supplier' | 'Auditor' | 'Public' | 'System';
  actor_id: string;
  event_context: Record<string, any>;
  timestamp: string; // ISO timestamp
  event_channel: 'UI' | 'API' | 'Mobile' | 'QR';
  geo_info?: { ip: string; country: string };
  related_entity_type?: 'Product' | 'Certificate' | 'Document' | 'Metadata' | 'Supplier';
  related_entity_id?: string;
};

export type ChangeLog = {
  log_id: string;
  product_id: string;
  version_id: string;
  changed_by: string;
  timestamp: string;
  change_reason: string;
  changes: Record<string, { before: any; after: any }>;
};


export type QRCodeLog = {
  qr_code_id: string;
  product_id: string;
  version_id: string;
  qr_code_value: string; // URL
  hash_signature: string;
  rendered_image_base64: string;
  last_updated_at: string; // ISO Timestamp
  generated_by: string; // User ID or 'system'
  status: 'Active' | 'Deprecated' | 'Invalidated';
  redirect_mode: 'Direct Link' | 'Proxy Viewer' | 'Verification Flow';
};

export type PublicDppData = {
  productId: string;
  versionId: string;
  productName: string;
  productModel: string;
  brandName: string;
  complianceStatus: 'Compliant' | 'Incomplete' | 'Expired';
  sustainabilityScore?: number;
  lastUpdatedAt: string; // ISO timestamp
  qrCodeImage: string; // base64 or URL
  productImage: string; // URL

  productDetails: {
    gtin: string;
    serialNumber: string;
    manufacturingDate: string; // YYYY-MM-DD
    placeOfManufacture: string;
  };
  manufacturerInfo: {
    name: string;
    address: string;
    website: string;
    contact: string;
  };
  complianceAndCertificates: {
    name: string;
    status: 'Verified' | 'Pending' | 'Rejected';
    documentType: string;
    validUntil: string;
  }[];
  materialAndCircularity: {
    recycledContentPercentage: number;
    reparabilityScore: number;
    dismantlingInstructionsUrl: string;
    materialComposition: {
      material: string;
      percentage: number;
      isHazardous: boolean;
      substanceId?: string;
      originCountry: string;
    }[];
  };
  technicalSpecifications: {
    weightKg: number;
    dimensions: string; // e.g., "150cm x 90cm x 30cm"
    chemistry: string;
    nominalVoltage: string;
    capacityAh: number;
    operatingTemperature: string;
  };
  lifecycleAndPerformance: {
    warrantyPeriod: string;
    expectedLifetime: string;
    stateOfHealth: string;
    carbonFootprint: string;
  };
  digitalSignature?: {
    signedBy: string;
    signedAt: string;
    method: string;
  };
};

export type Supplier = {
  supplier_id: string;
  legal_entity_name: string;
  company_vat_number: string;
  country_of_registration: string; // ISO Code
  registration_number: string;
  brand_names: string[];
  entity_type: 'Manufacturer' | 'Brand Owner' | 'Supplier' | 'Importer' | 'Verifier';
  contact_email: string;
  phone_number?: string;
  primary_address: string;
  declared_scope_of_submission: string;
  onboarding_status: 'Invited' | 'Approved' | 'Suspended' | 'Revoked';
  compliance_score?: number;
  associated_products_count: number;
  created_at: string; // ISO Timestamp
  last_active_at: string; // ISO Timestamp
  invited_by_admin_id?: string;
  parent_company_id?: string;
};

export type TraceabilityRecord = {
  trace_id: string;
  product_id: string;
  material_id: string;
  material_name: string;
  material_type: 'Raw' | 'Subcomponent' | 'Assembly' | 'Additive';
  parent_trace_id?: string | null;
  quantity: number;
  quantity_unit: 'kg' | '%';
  tier: number;
  supplier_id: string;
  origin_country: string; // ISO Code
  conflict_minerals_flag: boolean;
  linked_certificates?: string[];
  compliance_status: 'Pending' | 'Verified' | 'Rejected' | 'Invited';
  proof_documents?: string[];
  is_recycled_material: boolean;
  recycled_origin_trace?: string;
  last_updated_at: string;
};

export type BlockchainAnchor = {
  anchor_id: string;
  record_type: 'DPP_VERSION' | 'SUPPLIER_ATTESTATION' | 'CERTIFICATE_HASH' | 'PRODUCT_METADATA' | 'AUDIT_LOG';
  record_id: string;
  data_hash: string;
  timestamp_utc: string;
  blockchain_type: 'Polygon' | 'Ethereum' | 'IPFS' | 'Custom Consortium';
  transaction_hash: string;
  anchor_status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  anchor_url?: string;
  rule_set_version?: string;
};

export type MaterialSpecification = {
  material_id: string;
  supplier_id: string; // The supplier who owns this spec
  material_name: string;
  material_code?: string; // Supplier's internal code/SKU
  material_type: 'Raw' | 'Subcomponent' | 'Assembly' | 'Additive';
  description: string;
  specifications: Record<string, any>; // JSON blob for technical data
  created_at: string;
  last_updated_at: string;
};

export type MaterialDocument = {
  document_id: string;
  material_id: string;
  document_name: string;
  document_type: 'Certificate of Conformity' | 'Test Report' | 'Data Sheet' | 'Other';
  file_url: string; // For mock, could be a placeholder
  upload_date: string;
  expiry_date?: string;
};

export type DigitalSignature = {
  signature_id: string;
  signable_entity_type: 'DPP_VERSION' | 'SUPPLIER_LINK' | 'CERTIFICATE_FILE' | 'AI_OVERRIDE';
  signable_entity_id: string;
  signed_by_user_id: string;
  signed_by_company_id: string;
  signature_timestamp: string; // UTC timestamp
  signature_hash: string;
  signature_method: 'PLATFORM_NATIVE' | 'EIDAS_CERT' | 'DOCUSIGN' | 'BLOCKCHAIN_ANCHORED';
  signature_status: 'SIGNED' | 'REVOKED' | 'INVALIDATED';
  signed_payload_snapshot?: Record<string, any>;
  blockchain_anchor_id?: string;
};

export type CountryPack = {
  pack_id: string;
  language_code: string; // e.g., EN, FR, DE
  country_code: string; // e.g., DE, FR, NL
  region_profile: string; // e.g., EU_CENTRAL
  translated_field_labels: Record<string, string>; // JSON map
  translated_static_content: Record<string, string>; // JSON map
  custom_regulatory_fields?: Record<string, any>; // JSON schema
  epr_mandates_applicable: boolean;
  default_currency: string; // e.g., EUR, USD
  rtl_layout_required: boolean;
  active: boolean;
};

export type DecentralizedIdentifier = {
  did_uri: string;
  did_entity_type: 'COMPANY' | 'SUPPLIER' | 'USER' | 'PRODUCT_ITEM' | 'CERTIFICATE';
  did_entity_id: string;
  did_doc: Record<string, any>; // JSON-LD document
  created_at: string;
  last_updated_at: string;
};

export type VerifiableCredential = {
  vc_id: string;
  vc_issuer_did: string;
  vc_subject_did: string;
  vc_type: 'CERTIFICATION_ATTESTATION' | 'TRACEABILITY_CLAIM' | 'COMPLIANCE_SIGNOFF';
  vc_payload: Record<string, any>; // JSON-LD payload
  vc_signature: Record<string, any>; // JWS signature
  vc_status: 'ISSUED' | 'REVOKED' | 'EXPIRED' | 'SUSPENDED';
  vc_valid_from: string;
  vc_expiry?: string;
  blockchain_anchor_id?: string;
};

export type Module = {
  id: string;
  name: string;
  description: string;
  dependencies: string[]; // Array of module IDs
  category: 'DPP Core' | 'Traceability' | 'AI & Automation' | 'Trust & Identity' | 'Admin';
};

export type CompanyModuleAccess = {
  company_id: string;
  module_id: string;
  status: 'active' | 'inactive';
};

export type SubscriptionPlan = {
  plan_id: string;
  plan_name: string;
  plan_features: Record<string, any>;
  monthly_price: number;
  billing_cycle: 'monthly' | 'annually';
  default_modules: string[]; // array of module_id
  trial_days: number;
  is_active: boolean;
  plan_limits: Record<string, any>;
};

export type CompanySubscription = {
  company_id: string;
  plan_id: string;
  start_date: string; // ISO Timestamp
  end_date?: string; // ISO Timestamp
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  payment_provider_id?: string;
  current_usage: {
    products_created: number;
    storage_used_gb: number;
  };
};

export type CompanyBranding = {
  company_id: string;
  logo_url: string;
  brand_name: string;
  primary_color: string;
  secondary_color: string;
  support_url?: string;
  custom_footer_text?: string;
};

export type CompanyLocalizationSettings = {
  company_id: string;
  default_language: string; // 'en'
  supported_languages: string[]; // ['en', 'de', 'fr']
  default_locale: string; // 'en-US'
  measurement_units: 'metric' | 'imperial';
  timezone: string; // 'Europe/Berlin'
  auto_detect_from_browser: boolean;
  allow_public_language_toggle: boolean;
  ai_translation_mode: 'manual' | 'auto-ai' | 'disabled';
};

export type SupplierScore = {
  supplier_id: string;
  overall_score: number;
  compliance_score: number;
  responsiveness_score: number;
  verification_rate: number;
  badge: 'Gold' | 'Silver' | 'Bronze' | 'Verified' | 'Incomplete';
  score_history: { month: string; score: number }[];
};

export type VerificationTask = {
  verification_id: string;
  document_id: string;
  document_name: string;
  product_id: string;
  product_name: string;
  requester_id: string;
  requester_name: string;
  verifier_id: string;
  status: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
  submitted_at: string; // ISO Timestamp
  completed_at?: string; // ISO Timestamp
  notes?: string;
  rejection_reason?: string;
  claim: string;
  document_url: string;
};

export type CompanyProduct = {
  id: string;
  name: string;
  companyName: string;
  status: "Approved" | "Draft" | "Submitted" | "Rejected";
  version: string;
  lastUpdated: string;
  complianceIssues: number;
  score: number;
  scoreBreakdown: {
    compliance: number;
    traceability: number;
    sustainability: number;
  };
  improvementSuggestions?: {
    title: string;
    description: string;
    link: string;
    linkText: string;
  }[];
};

export type PrivacyConsent = {
  supplier_id: string;
  permissions: {
    share_full_dpp: boolean;
    share_traceability_data: boolean;
    share_compliance_status: boolean;
  };
};

export type SupportTicket = {
  ticket_id: string;
  submitted_by_user: string;
  submitted_by_company: string;
  type: 'bug' | 'ticket';
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  created_at: string;
  last_updated_at: string;
  resolved_at?: string;
  admin_notes?: string;
};

export type EmailTemplate = {
  template_id: string;
  template_name: string;
  email_subject: string;
  email_body: string; // Markdown with Handlebars placeholders
};

export type EmailTrigger = {
  trigger_id: string;
  trigger_name: string;
  description: string;
  template_id: string;
  enabled: boolean;
};

export type CampaignStatus = "Draft" | "Sent" | "Scheduled";

export type Campaign = {
    id: string;
    name: string;
    status: CampaignStatus;
    targetAudience: string;
    sentDate?: string;
    createdBy: string;
};
