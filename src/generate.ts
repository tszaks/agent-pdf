import { normalize } from './engine/normalizer.js';
import { buildHtml } from './engine/template-loader.js';
import { renderToPdf } from './engine/renderer.js';
import type { GenerateOptions, GenerateResult } from './types.js';

export async function generate(content: string, opts: GenerateOptions): Promise<GenerateResult> {
  const normalized = normalize(content, opts.template, opts.title);
  const html = buildHtml(normalized, opts);
  return renderToPdf(html, opts, normalized.title);
}

export type { GenerateOptions, GenerateResult };
export type { TemplateName, PageSize, ThemeOptions } from './types.js';
