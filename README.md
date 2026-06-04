# agent-pdf

**World-class PDF generation for AI agents.** Beautiful templates, zero design decisions required.

Agents are great at content. Terrible at design — especially PDF design. `agent-pdf` bridges that gap: give it your content in any format, pick a use case, get a publication-quality PDF.

---

## Quick Start

```bash
npm install -g agent-pdf

# Generate a report from markdown
agent-pdf generate report.md --template report

# Generate an invoice from JSON
agent-pdf generate invoice.json --template invoice

# Pipe from stdin
echo "# Hello World" | agent-pdf generate - --template minimal
```

Output lands on `~/Desktop/<title>.pdf` by default.

---

## Templates

| Template   | Style | Best For |
|------------|-------|----------|
| `report`   | Formal/academic. Navy cover, Playfair Display + Source Serif. | Research, analysis, quarterly reviews |
| `proposal` | Modern/bold. Gradient accents, Plus Jakarta Sans. | Sales proposals, pitches, RFPs |
| `invoice`  | Clean tabular. Inter, green accent on totals. | Billing, estimates, contracts |
| `docs`     | Technical. JetBrains Mono, dark code blocks, auto-TOC. | API docs, guides, manuals |
| `minimal`  | Pure typography. Lora + Inter, maximum whitespace. | Essays, letters, any content |

---

## Input Formats

Auto-detected — no flag needed:

**Markdown**
```markdown
# Report Title

## Section One
Content here...
```

**JSON (generic)**
```json
{
  "title": "My Document",
  "author": "Tyler Szakacs",
  "sections": [
    { "heading": "Introduction", "content": "Content as markdown..." }
  ]
}
```

**JSON (invoice)**
```json
{
  "type": "invoice",
  "invoiceNumber": "INV-001",
  "from": { "name": "Your Company", "email": "you@example.com" },
  "to": { "name": "Client Name", "address": "123 Main St" },
  "items": [
    { "description": "Service", "quantity": 1, "rate": 1000 }
  ]
}
```

**Raw HTML** — injected directly into the template body.

---

## MCP Server

For AI agents using the Model Context Protocol:

```bash
# Add to your Claude Code MCP config
{
  "mcpServers": {
    "agent-pdf": {
      "command": "npx",
      "args": ["-y", "agent-pdf", "serve"]
    }
  }
}
```

### Tools

**`generate_pdf`** — Generate a PDF and return the path.

```
content      string   Markdown, JSON, or HTML (auto-detected)
template     string   report | proposal | invoice | docs | minimal
output_path  string?  Defaults to ~/Desktop/<title>.pdf
title        string?  Override extracted title
author       string?  Author name for cover page
date         string?  Date string (defaults to today)
page_size    string?  letter | a4
watermark    string?  Diagonal text e.g. "DRAFT"
primary_color string? Brand hex color e.g. "#0F2344"
accent_color  string? Brand hex color e.g. "#B8962E"
logo_url      string? URL or data URI for logo image
```

**`list_templates`** — List templates with descriptions.

---

## CLI Reference

```
agent-pdf generate <file> [options]

  -t, --template <name>    report | proposal | invoice | docs | minimal  [required]
  -o, --output <path>      Output path
  --title <title>          Document title
  --author <author>        Author name
  --date <date>            Date string
  --page-size <size>       letter | a4
  --watermark <text>       Diagonal watermark
  --primary-color <hex>    Brand primary color
  --accent-color <hex>     Brand accent color
  --logo-url <url>         Logo URL or data URI

agent-pdf templates        List all templates
agent-pdf serve            Start MCP server (stdio)
```

---

## Theming

Override template defaults with brand colors:

```bash
agent-pdf generate brief.md \
  --template proposal \
  --primary-color "#1B4FD8" \
  --accent-color "#F59E0B" \
  --logo-url "https://example.com/logo.png"
```

---

## Adding Templates

Templates are pure HTML/CSS in `/templates/<name>/template.html`. Variables use `{{DOUBLE_BRACES}}`.

Available variables: `{{TITLE}}`, `{{BODY}}`, `{{AUTHOR}}`, `{{DATE}}`, `{{SUBTITLE}}`, `{{LOGO_HTML}}`, `{{THEME_VARS}}`, `{{WATERMARK}}`, `{{PAGE_SIZE}}`

Copy an existing template folder, register the name in `src/types.ts`, and submit a PR.

---

## Requirements

- Node.js 18+
- Chromium (installed automatically by Puppeteer on first use)

---

## License

MIT
