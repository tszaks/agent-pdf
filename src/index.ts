#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import { generate } from './generate.js';
import type { GenerateOptions, TemplateName, PageSize } from './types.js';

const TEMPLATES: TemplateName[] = ['report', 'proposal', 'invoice', 'docs', 'minimal'];
const PAGE_SIZES: PageSize[] = ['letter', 'a4'];

function ok(text: string): CallToolResult {
  return { content: [{ type: 'text', text }] };
}

function err(message: string): CallToolResult {
  return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

const server = new Server(
  { name: 'agent-pdf', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generate_pdf',
      description: [
        'Generate a world-class PDF document from content.',
        'Handles markdown, JSON, or raw HTML automatically.',
        'Returns the path to the saved PDF on disk.',
      ].join(' '),
      inputSchema: {
        type: 'object' as const,
        required: ['content', 'template'],
        properties: {
          content: {
            type: 'string',
            description: 'Document content — markdown, a JSON object/schema, or raw HTML. Auto-detected.',
          },
          template: {
            type: 'string',
            enum: TEMPLATES,
            description: 'Visual template: report (formal/academic), proposal (modern/bold), invoice (clean tabular), docs (technical), minimal (spare typography)',
          },
          output_path: {
            type: 'string',
            description: 'Full output path for the PDF. Defaults to ~/Desktop/<title>.pdf',
          },
          title: {
            type: 'string',
            description: 'Document title. Auto-extracted from content if omitted.',
          },
          author: {
            type: 'string',
            description: 'Author name displayed on the cover.',
          },
          date: {
            type: 'string',
            description: 'Date string. Defaults to today.',
          },
          page_size: {
            type: 'string',
            enum: PAGE_SIZES,
            description: 'Page size. Defaults to letter.',
          },
          watermark: {
            type: 'string',
            description: 'Diagonal watermark text (e.g. "DRAFT", "CONFIDENTIAL").',
          },
          primary_color: {
            type: 'string',
            description: 'Brand primary color as hex (e.g. "#0F2344"). Overrides template default.',
          },
          accent_color: {
            type: 'string',
            description: 'Brand accent color as hex (e.g. "#B8962E").',
          },
          logo_url: {
            type: 'string',
            description: 'URL or data URI for a logo image.',
          },
        },
      },
    },
    {
      name: 'list_templates',
      description: 'List available PDF templates with descriptions and best use cases.',
      inputSchema: { type: 'object' as const, properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'list_templates') {
    const descriptions = [
      '📊 report    — Formal academic/consulting style. Playfair Display + Source Serif. Navy cover page. Best for: research, analysis, quarterly reviews.',
      '🚀 proposal  — Modern bold layout. Plus Jakarta Sans. Gradient accents. Best for: sales proposals, pitches, RFPs.',
      '🧾 invoice   — Clean professional tabular layout. Inter. Green accent on totals. Best for: billing, contracts, estimates.',
      '📖 docs      — Technical documentation style. Inter + JetBrains Mono. Dark code blocks, TOC. Best for: API docs, guides, READMEs.',
      '✦  minimal   — Pure typography, maximum whitespace. Lora + Inter. Best for: essays, letters, any content type.',
    ];
    return ok(descriptions.join('\n'));
  }

  if (name === 'generate_pdf') {
    const content = str(args?.content);
    const template = str(args?.template) as TemplateName | undefined;

    if (!content) return err('content is required');
    if (!template || !TEMPLATES.includes(template)) {
      return err(`template must be one of: ${TEMPLATES.join(', ')}`);
    }

    const opts: GenerateOptions = {
      template,
      outputPath: str(args?.output_path),
      title: str(args?.title),
      author: str(args?.author),
      date: str(args?.date),
      pageSize: (str(args?.page_size) as PageSize | undefined),
      watermark: str(args?.watermark),
      theme: {
        primaryColor: str(args?.primary_color),
        accentColor: str(args?.accent_color),
        logoUrl: str(args?.logo_url),
      },
    };

    try {
      const result = await generate(content, opts);
      return ok(
        `✅ PDF generated successfully\n\nPath: ${result.path}\nSize: ${result.sizeKb} KB\nTemplate: ${result.template}`
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return err(`PDF generation failed: ${message}`);
    }
  }

  return err(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(e => {
  console.error('agent-pdf MCP server error:', e);
  process.exit(1);
});
