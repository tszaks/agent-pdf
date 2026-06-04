import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { GenerateOptions, GenerateResult } from '../types.js';

function resolveOutputPath(opts: GenerateOptions, title: string): string {
  if (opts.outputPath) return opts.outputPath;

  const desktopDir = join(homedir(), 'Desktop');
  const safe = title.replace(/[^a-z0-9\-_ ]/gi, '').trim().replace(/\s+/g, '-') || 'document';
  return join(desktopDir, `${safe}.pdf`);
}

function ensureDir(filePath: string) {
  const dir = filePath.substring(0, filePath.lastIndexOf('/'));
  if (dir) mkdirSync(dir, { recursive: true });
}

export async function renderToPdf(
  html: string,
  opts: GenerateOptions,
  title: string,
): Promise<GenerateResult> {
  const outputPath = resolveOutputPath(opts, title);
  ensureDir(outputPath);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();

    // Wait for fonts (Google Fonts) to load
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30_000 });

    // Give font-display a moment to swap in
    await new Promise(r => setTimeout(r, 500));

    const pdfBuffer = await page.pdf({
      format: (opts.pageSize === 'a4' ? 'A4' : 'Letter') as 'Letter' | 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `<div style="width:100%;font-family:sans-serif;font-size:8px;color:#aaa;padding:0 0.75in;box-sizing:border-box;display:flex;justify-content:space-between;">
        <span class="title"></span>
        <span></span>
      </div>`,
      footerTemplate: `<div style="width:100%;font-family:sans-serif;font-size:8px;color:#aaa;padding:0 0.75in 4px;box-sizing:border-box;text-align:right;">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>`,
      margin: { top: '0.75in', bottom: '0.6in', left: '0', right: '0' },
    });

    writeFileSync(outputPath, pdfBuffer);

    const sizeKb = Math.round(pdfBuffer.length / 1024);
    return { path: outputPath, sizeKb, template: opts.template };
  } finally {
    await browser.close();
  }
}
