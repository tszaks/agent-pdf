import { marked } from 'marked';
import type {
  NormalizedContent, TemplateName, JsonInput, InvoiceJsonInput,
  GenericJsonInput, InvoiceContent, ReportContent, ProposalContent,
  DocsContent, InvoiceLineItem,
} from '../types.js';

// ── Input format detection ───────────────────────────────────────────────────

type InputFormat = 'markdown' | 'html' | 'json';

function detectFormat(input: string): InputFormat {
  const trimmed = input.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return 'html';
  return 'markdown';
}

// ── Markdown → HTML ──────────────────────────────────────────────────────────

function mdToHtml(markdown: string): string {
  marked.setOptions({ gfm: true, breaks: false });
  return marked.parse(markdown) as string;
}

// ── TOC extraction from HTML ─────────────────────────────────────────────────

function extractToc(html: string) {
  const toc: Array<{ level: number; text: string; id: string }> = [];
  for (const match of html.matchAll(/<h([1-3])[^>]*>(.*?)<\/h\1>/gi)) {
    const level = parseInt(match[1], 10);
    const text = match[2].replace(/<[^>]+>/g, '');
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    toc.push({ level, text, id });
  }
  return toc;
}

// ── Add IDs to headings for TOC anchors ─────────────────────────────────────

function addHeadingIds(html: string): string {
  const counts: Record<string, number> = {};
  return html.replace(/<h([1-3])([^>]*)>(.*?)<\/h\1>/gi, (_, level, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, '');
    const base = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    counts[base] = (counts[base] || 0) + 1;
    const id = counts[base] > 1 ? `${base}-${counts[base]}` : base;
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}

// ── Invoice JSON normalizer ──────────────────────────────────────────────────

function normalizeInvoiceJson(data: InvoiceJsonInput, title: string): InvoiceContent {
  const items: InvoiceLineItem[] = (data.items || []).map(item => {
    const qty = item.quantity ?? 1;
    const amount = item.amount ?? item.rate * qty;
    return { description: item.description, quantity: qty, rate: item.rate, amount };
  });

  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const tax = data.tax ?? 0;
  const total = subtotal + tax;
  const currency = data.currency ?? 'USD';

  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency });
  const itemsHtml = items
    .map(i => `<tr><td>${i.description}</td><td class="num">${i.quantity}</td><td class="num">${fmt.format(i.rate)}</td><td class="num">${fmt.format(i.amount)}</td></tr>`)
    .join('\n');

  const bodyHtml = `
<table class="invoice-items">
  <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead>
  <tbody>${itemsHtml}</tbody>
</table>
<div class="invoice-totals">
  <div class="total-row"><span>Subtotal</span><span>${fmt.format(subtotal)}</span></div>
  ${tax ? `<div class="total-row"><span>Tax</span><span>${fmt.format(tax)}</span></div>` : ''}
  <div class="total-row grand-total"><span>Total</span><span>${fmt.format(total)}</span></div>
</div>
${data.notes ? `<div class="invoice-notes"><strong>Notes</strong><p>${data.notes}</p></div>` : ''}
`.trim();

  return {
    type: 'invoice',
    title,
    bodyHtml,
    date: data.date,
    invoiceNumber: data.invoiceNumber,
    dueDate: data.dueDate,
    fromName: data.from?.name,
    fromAddress: data.from ? [data.from.address, data.from.email].filter(Boolean).join('\n') : undefined,
    toName: data.to?.name,
    toAddress: data.to ? [data.to.address, data.to.email].filter(Boolean).join('\n') : undefined,
    items,
    subtotal,
    tax: data.tax,
    total,
    currency,
  };
}

// ── Generic JSON normalizer ──────────────────────────────────────────────────

function normalizeGenericJson(data: GenericJsonInput, template: TemplateName): NormalizedContent {
  let bodyHtml: string;

  if (data.sections?.length) {
    bodyHtml = data.sections.map(s =>
      `${s.heading ? `<h2>${s.heading}</h2>` : ''}${mdToHtml(s.content)}`
    ).join('\n');
  } else if (data.content) {
    bodyHtml = mdToHtml(data.content);
  } else {
    bodyHtml = '';
  }

  const base = {
    title: data.title ?? 'Untitled',
    bodyHtml,
    author: data.author,
    date: data.date,
    subtitle: data.subtitle,
  };

  switch (template) {
    case 'report': return { ...base, type: 'report', abstract: data.abstract } as ReportContent;
    case 'proposal': return { ...base, type: 'proposal', tagline: data.tagline, preparedFor: data.preparedFor, preparedBy: data.preparedBy } as ProposalContent;
    case 'docs': {
      const toc = extractToc(bodyHtml);
      return { ...base, type: 'docs', version: data.version, toc } as DocsContent;
    }
    default: return { ...base, type: template } as NormalizedContent;
  }
}

// ── Main normalize function ──────────────────────────────────────────────────

export function normalize(
  input: string,
  template: TemplateName,
  overrideTitle?: string,
): NormalizedContent {
  const format = detectFormat(input);

  if (format === 'json') {
    const data = JSON.parse(input) as JsonInput;
    const title = overrideTitle ?? (data as GenericJsonInput).title ?? 'Untitled';

    if (template === 'invoice' || (data as JsonInput).type === 'invoice') {
      return normalizeInvoiceJson(data as InvoiceJsonInput, title);
    }
    return normalizeGenericJson(data as GenericJsonInput, template);
  }

  const rawHtml = format === 'markdown' ? mdToHtml(input) : input;
  const bodyHtml = template === 'docs' ? addHeadingIds(rawHtml) : rawHtml;

  // Extract title from first h1 if not overridden
  const h1Match = rawHtml.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const extractedTitle = h1Match ? h1Match[1].replace(/<[^>]+>/g, '') : 'Untitled';
  const title = overrideTitle ?? extractedTitle;

  const base = { title, bodyHtml };

  switch (template) {
    case 'report':   return { ...base, type: 'report' };
    case 'proposal': return { ...base, type: 'proposal' };
    case 'invoice':  return { ...base, type: 'invoice', items: [], subtotal: 0, total: 0 } as InvoiceContent;
    case 'docs':     return { ...base, type: 'docs', toc: extractToc(bodyHtml) };
    default:         return { ...base, type: 'minimal' };
  }
}
