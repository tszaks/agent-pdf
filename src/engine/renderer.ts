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

    // Resume: single-page, no running headers/footers
    const isResume = opts.template === 'resume';

    const pdfBuffer = await page.pdf({
      format: (opts.pageSize === 'a4' ? 'A4' : 'Letter') as 'Letter' | 'A4',
      printBackground: true,
      displayHeaderFooter: !isResume,
      headerTemplate: `<div style="width:100%;font-family:'Helvetica Neue',sans-serif;font-size:7.5px;color:#bbb;padding:6px 0.85in 0;box-sizing:border-box;display:flex;justify-content:space-between;align-items:center;">
        <span class="title" style="letter-spacing:0.3px;"></span>
        <span></span>
      </div>`,
      footerTemplate: `<div style="width:100%;font-family:'Helvetica Neue',sans-serif;font-size:7.5px;color:#bbb;padding:0 0.85in 6px;box-sizing:border-box;text-align:right;">
        <span class="pageNumber"></span>&thinsp;/&thinsp;<span class="totalPages"></span>
      </div>`,
      // Generous top/bottom margins so header/footer don't overlap body content
      margin: { top: '0.85in', bottom: '0.65in', left: '0', right: '0' },
    });

    writeFileSync(outputPath, pdfBuffer);

    const sizeKb = Math.round(pdfBuffer.length / 1024);
    return { path: outputPath, sizeKb, template: opts.template };
  } finally {
    await browser.close();
  }
}
