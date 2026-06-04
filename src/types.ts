export type TemplateName = 'report' | 'proposal' | 'invoice' | 'docs' | 'minimal' | 'resume';
export type PageSize = 'letter' | 'a4';

export interface ThemeOptions {
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string;    // URL or data URI
  logoBase64?: string; // raw base64, auto-prefixed
}

export interface GenerateOptions {
  template: TemplateName;
  outputPath?: string; // defaults to ~/Desktop/<title>.pdf
  pageSize?: PageSize;
  title?: string;
  author?: string;
  date?: string;
  watermark?: string;
  theme?: ThemeOptions;
}

export interface GenerateResult {
  path: string;
  sizeKb: number;
  template: TemplateName;
  pageCount?: number;
}

// ── Normalized content (internal representation after input detection) ──

export interface BaseContent {
  title: string;
  bodyHtml: string; // fully rendered HTML fragment
  author?: string;
  date?: string;
  subtitle?: string;
}

export interface ReportContent extends BaseContent {
  type: 'report';
  abstract?: string;
}

export interface ProposalContent extends BaseContent {
  type: 'proposal';
  tagline?: string;
  preparedFor?: string;
  preparedBy?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceContent extends BaseContent {
  type: 'invoice';
  invoiceNumber?: string;
  dueDate?: string;
  fromName?: string;
  fromAddress?: string;
  toName?: string;
  toAddress?: string;
  items: InvoiceLineItem[];
  subtotal: number;
  tax?: number;
  total: number;
  currency?: string;
  notes?: string;
}

export interface DocsContent extends BaseContent {
  type: 'docs';
  version?: string;
  toc?: Array<{ level: number; text: string; id: string }>;
}

export interface MinimalContent extends BaseContent {
  type: 'minimal';
}

export interface ResumeContent extends BaseContent {
  type: 'resume';
  phone?: string;
  email?: string;
  location?: string;
  website?: string;
  linkedin?: string;
}

export type NormalizedContent =
  | ReportContent
  | ProposalContent
  | InvoiceContent
  | DocsContent
  | MinimalContent
  | ResumeContent;

// ── JSON schema for structured input ──

export interface InvoiceJsonInput {
  type: 'invoice';
  title?: string;
  invoiceNumber?: string;
  date?: string;
  dueDate?: string;
  from?: { name: string; address?: string; email?: string };
  to?: { name: string; address?: string; email?: string };
  items: Array<{
    description: string;
    quantity?: number;
    rate: number;
    amount?: number;
  }>;
  tax?: number;
  notes?: string;
  currency?: string;
}

export interface GenericJsonInput {
  type?: Exclude<TemplateName, 'invoice'>;
  title?: string;
  author?: string;
  date?: string;
  subtitle?: string;
  tagline?: string;
  preparedFor?: string;
  preparedBy?: string;
  abstract?: string;
  version?: string;
  sections?: Array<{ heading?: string; content: string }>;
  content?: string; // markdown string
}

export type JsonInput = InvoiceJsonInput | GenericJsonInput;
