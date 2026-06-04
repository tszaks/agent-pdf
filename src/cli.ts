#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { generate } from './generate.js';
import type { GenerateOptions, TemplateName, PageSize } from './types.js';

const program = new Command();

program
  .name('agent-pdf')
  .description('World-class PDF generation for AI agents. Beautiful templates, zero design decisions.')
  .version('0.1.0');

program
  .command('generate <input>')
  .alias('g')
  .description('Generate a PDF from a file or stdin (-)')
  .requiredOption('-t, --template <name>', 'Template: report | proposal | invoice | docs | minimal')
  .option('-o, --output <path>', 'Output path (default: ~/Desktop/<title>.pdf)')
  .option('--title <title>', 'Document title')
  .option('--author <author>', 'Author name')
  .option('--date <date>', 'Date string')
  .option('--page-size <size>', 'Page size: letter | a4 (default: letter)')
  .option('--watermark <text>', 'Diagonal watermark text')
  .option('--primary-color <hex>', 'Brand primary color (e.g. #0F2344)')
  .option('--accent-color <hex>', 'Brand accent color (e.g. #B8962E)')
  .option('--logo-url <url>', 'Logo URL or data URI')
  .action(async (input: string, opts) => {
    const content = input === '-'
      ? readFileSync('/dev/stdin', 'utf-8')
      : readFileSync(input, 'utf-8');

    const options: GenerateOptions = {
      template: opts.template as TemplateName,
      outputPath: opts.output,
      title: opts.title,
      author: opts.author,
      date: opts.date,
      pageSize: opts.pageSize as PageSize | undefined,
      watermark: opts.watermark,
      theme: {
        primaryColor: opts.primaryColor,
        accentColor: opts.accentColor,
        logoUrl: opts.logoUrl,
      },
    };

    console.log(`⏳ Generating ${options.template} PDF…`);

    try {
      const result = await generate(content, options);
      console.log(`✅ Saved to: ${result.path}`);
      console.log(`   Size: ${result.sizeKb} KB`);
    } catch (e) {
      console.error('❌ Error:', e instanceof Error ? e.message : e);
      process.exit(1);
    }
  });

program
  .command('templates')
  .description('List available templates')
  .action(() => {
    const rows = [
      ['report',   'Formal/academic. Navy cover, serif fonts. Research, analysis, reviews.'],
      ['proposal', 'Modern/bold. Gradient accents, sans-serif. Sales, pitches, RFPs.'],
      ['invoice',  'Clean tabular. Crisp Inter. Billing, estimates, contracts.'],
      ['docs',     'Technical. Code blocks, TOC, dark theme. API docs, guides.'],
      ['minimal',  'Pure typography. Lora + Inter. Essays, letters, anything.'],
      ['resume',   'Tight professional layout. Inter. Uppercase headers, ATS-friendly. CVs, resumes.'],
    ];

    console.log('\n  agent-pdf templates\n');
    for (const [name, desc] of rows) {
      console.log(`  ${name.padEnd(10)} ${desc}`);
    }
    console.log('');
  });

program
  .command('serve')
  .description('Start the MCP server (stdio transport)')
  .action(async () => {
    // Importing index.ts as a side-effect starts the MCP server
    await import('./index.js');
  });

program.parse();
