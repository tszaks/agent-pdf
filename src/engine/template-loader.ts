import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import type {
  NormalizedContent, GenerateOptions, InvoiceContent, DocsContent,
  ProposalContent, ReportContent,
} from '../types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '../../templates');

function loadTemplate(name: string): string {
  return readFileSync(join(TEMPLATES_DIR, name, 'template.html'), 'utf-8');
}

// ── Variable substitution ────────────────────────────────────────────────────

function sub(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => vars[key] ?? '');
}

// ── Logo HTML helper ─────────────────────────────────────────────────────────

function buildLogoHtml(opts: GenerateOptions): string {
  if (!opts.theme?.logoUrl && !opts.theme?.logoBase64) return '';
  const src = opts.theme.logoBase64
    ? `data:image/png;base64,${opts.theme.logoBase64}`
    : opts.theme.logoUrl!;
  return `<img class="logo" src="${src}" alt="Logo" />`;
}

// ── CSS custom properties override ──────────────────────────────────────────

function buildThemeVars(opts: GenerateOptions): string {
  const lines: string[] = [];
  if (opts.theme?.primaryColor) lines.push(`--color-primary: ${opts.theme.primaryColor};`);
  if (opts.theme?.accentColor)  lines.push(`--color-accent: ${opts.theme.accentColor};`);
  if (!lines.length) return '';
  return `<style>:root { ${lines.join(' ')} }</style>`;
}

// ── Watermark ────────────────────────────────────────────────────────────────

function buildWatermark(text?: string): string {
  if (!text) return '';
  return `<div class="watermark">${text}</div>`;
}

// ── TOC HTML for docs ────────────────────────────────────────────────────────

function buildTocHtml(content: DocsContent): string {
  if (!content.toc?.length) return '';
  const items = content.toc.map(entry => {
    const indent = entry.level > 1 ? ` class="toc-l${entry.level}"` : '';
    return `<li${indent}><a href="#${entry.id}">${entry.text}</a></li>`;
  }).join('\n');
  return `<nav class="toc"><h3>Contents</h3><ul>${items}</ul></nav>`;
}

// ── Invoice-specific HTML blocks ─────────────────────────────────────────────

function buildInvoiceHeader(content: InvoiceContent): string {
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: content.currency ?? 'USD',
  });

  return `
<div class="invoice-header">
  <div class="invoice-from">
    ${content.fromName ? `<div class="company-name">${content.fromName}</div>` : ''}
    ${content.fromAddress ? `<div class="company-address">${content.fromAddress.replace(/\n/g, '<br>')}</div>` : ''}
  </div>
  <div class="invoice-meta">
    ${content.invoiceNumber ? `<div class="invoice-number">Invoice ${content.invoiceNumber}</div>` : ''}
    ${content.date ? `<div class="invoice-date">Date: ${content.date}</div>` : ''}
    ${content.dueDate ? `<div class="invoice-due">Due: ${content.dueDate}</div>` : ''}
  </div>
</div>
${content.toName || content.toAddress ? `
<div class="invoice-bill-to">
  <div class="bill-to-label">Bill To</div>
  ${content.toName ? `<div class="bill-to-name">${content.toName}</div>` : ''}
  ${content.toAddress ? `<div class="bill-to-address">${content.toAddress.replace(/\n/g, '<br>')}</div>` : ''}
</div>` : ''}
`.trim();
}

// ── Master render function ───────────────────────────────────────────────────

export function buildHtml(content: NormalizedContent, opts: GenerateOptions): string {
  const tmpl = loadTemplate(content.type);
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const base: Record<string, string> = {
    TITLE:       content.title,
    AUTHOR:      content.author ?? '',
    DATE:        content.date ?? now,
    BODY:        content.bodyHtml,
    LOGO_HTML:   buildLogoHtml(opts),
    THEME_VARS:  buildThemeVars(opts),
    WATERMARK:   buildWatermark(opts.watermark),
    PAGE_SIZE:   (opts.pageSize ?? 'letter').toUpperCase(),
  };

  // Template-specific variables
  switch (content.type) {
    case 'report': {
      const c = content as ReportContent;
      base.SUBTITLE = c.subtitle ?? '';
      base.ABSTRACT = c.abstract ? `<div class="abstract"><strong>Abstract</strong>${c.abstract}</div>` : '';
      break;
    }
    case 'proposal': {
      const c = content as ProposalContent;
      base.SUBTITLE    = c.subtitle ?? '';
      base.TAGLINE     = c.tagline ?? '';
      base.PREPARED_FOR = c.preparedFor ?? '';
      base.PREPARED_BY  = c.preparedBy ?? '';
      break;
    }
    case 'invoice': {
      const c = content as InvoiceContent;
      base.INVOICE_HEADER = buildInvoiceHeader(c);
      base.INVOICE_NUMBER = c.invoiceNumber ?? '';
      break;
    }
    case 'docs': {
      const c = content as DocsContent;
      base.SUBTITLE = c.subtitle ?? '';
      base.VERSION  = c.version ? `v${c.version}` : '';
      base.TOC_HTML = buildTocHtml(c);
      break;
    }
    case 'minimal': {
      base.SUBTITLE = content.subtitle ?? '';
      break;
    }
  }

  return sub(tmpl, base);
}
