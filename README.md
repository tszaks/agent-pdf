<h1 align="center">agent-pdf</h1>

<p align="center">
  Turn Markdown, JSON or HTML into a styled PDF from the command line or from an AI agent, with no design decisions.
</p>

<p align="center">
  <a href="https://github.com/tszaks/agent-pdf/actions/workflows/ci.yml"><img src="https://github.com/tszaks/agent-pdf/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/tszaks/agent-pdf" alt="MIT license"></a>
  <img src="https://img.shields.io/badge/node-18%2B-blue" alt="Node 18 or later">
</p>

```console
$ agent-pdf generate report.md --template report
⏳ Generating report PDF…
✅ Saved to: ~/Desktop/Quarterly-Review.pdf
   Size: 112 KB
```

Agents are good at content and poor at page design. `agent-pdf` takes the content in whatever form the agent has it, applies one of six built-in templates, and renders a PDF with headless Chromium (Puppeteer).

It is for people and agents that need a presentable report, invoice, proposal, doc or resume without writing CSS. It runs as a CLI and as an MCP server over stdio.

## Features

- **Six templates.** `report`, `proposal`, `invoice`, `docs`, `minimal` and `resume`.
- **Any input.** Markdown, JSON or raw HTML. The format is detected from the content.
- **Invoices from JSON.** Line items, tax and totals are computed for you.
- **Brand colors and logo.** Override the primary and accent colors and add a logo by URL or data URI.
- **Page options.** Letter or A4, and an optional diagonal watermark such as `DRAFT`.
- **MCP server.** Two tools, `generate_pdf` and `list_templates`, over stdio.

## Install

`agent-pdf` is not published to npm yet. Install it from source. You need Node.js 18 or later.

```bash
git clone https://github.com/tszaks/agent-pdf.git
cd agent-pdf
npm install
npm run build
```

Run it with `node dist/cli.js`, or run `npm link` once to get an `agent-pdf` command on your path. The examples below use `agent-pdf`.

Puppeteer downloads Chromium when it installs. If your package manager skips install scripts, run `npx puppeteer browsers install chrome` once.

## Quick start

```bash
# Markdown to a report
agent-pdf generate report.md --template report

# JSON invoice
agent-pdf generate invoice.json --template invoice

# From stdin
echo "# Hello World" | agent-pdf generate - --template minimal
```

The PDF goes to `~/Desktop/<title>.pdf` unless you pass `-o`. The title comes from the first `# Heading`, the JSON `title`, or `--title`.

## Templates

| Template   | Style | Best for |
|------------|-------|----------|
| `report`   | Formal and academic. Navy cover, Playfair Display and Source Serif. | Research, analysis, quarterly reviews |
| `proposal` | Modern and bold. Gradient accents, Plus Jakarta Sans. | Sales proposals, pitches, RFPs |
| `invoice`  | Clean tabular layout. Inter, green accent on totals. | Billing, estimates, contracts |
| `docs`     | Technical. JetBrains Mono, dark code blocks, table of contents. | API docs, guides, manuals |
| `minimal`  | Plain typography. Lora and Inter, lots of whitespace. | Essays, letters, anything else |
| `resume`   | Tight layout, uppercase section headers, no running header or footer. | CVs and resumes |

## Usage

```
agent-pdf generate <file|-> [options]    (alias: g)

  -t, --template <name>    report | proposal | invoice | docs | minimal | resume  [required]
  -o, --output <path>      Output path (default: ~/Desktop/<title>.pdf)
  --title <title>          Document title
  --author <author>        Author name
  --date <date>            Date string (default: today)
  --page-size <size>       letter | a4 (default: letter)
  --watermark <text>       Diagonal watermark
  --primary-color <hex>    Brand primary color
  --accent-color <hex>     Brand accent color
  --logo-url <url>         Logo URL or data URI

agent-pdf templates        List templates
agent-pdf serve            Start the MCP server (stdio)
```

The `--help` text for `--template` lists five names, but `resume` works too.

### Input formats

**Markdown.** The first `# Heading` becomes the title and is removed from the body.

**JSON (generic).** Use `sections`, or a single `content` string of Markdown. Other fields: `title`, `author`, `date`, `subtitle`, `tagline`, `preparedFor`, `preparedBy`, `abstract`, `version`.

```json
{
  "title": "My Document",
  "author": "Your Name",
  "sections": [
    { "heading": "Introduction", "content": "Content as markdown..." }
  ]
}
```

**JSON (invoice).** Used with `--template invoice`, or whenever `"type": "invoice"`. `quantity` defaults to 1, `amount` defaults to `rate` times `quantity`, `currency` defaults to `USD`.

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

Also accepted: `date`, `dueDate`, `tax` (an amount, not a percent), `notes`.

**Raw HTML.** Injected into the template body as is.

### Theming

```bash
agent-pdf generate brief.md \
  --template proposal \
  --primary-color "#1B4FD8" \
  --accent-color "#F59E0B" \
  --logo-url "https://example.com/logo.png"
```

## Configuration

`agent-pdf` has no config file and reads no environment variables of its own. Everything is a flag (CLI) or an argument (MCP).

## Using with agents

Start the server with `agent-pdf serve` (stdio). Point your MCP client at the built file. Use the absolute path to your clone.

Claude Code:

```bash
claude mcp add agent-pdf -- node /Users/you/agent-pdf/dist/cli.js serve
```

Claude Desktop, Codex or any client that uses an `mcpServers` JSON block:

```json
{
  "mcpServers": {
    "agent-pdf": {
      "command": "node",
      "args": ["/Users/you/agent-pdf/dist/cli.js", "serve"]
    }
  }
}
```

### Tools

| Tool | What it does |
|---|---|
| `generate_pdf` | Renders a PDF and returns its path, size and template. |
| `list_templates` | Lists the templates with a description of each. |

`generate_pdf` arguments:

| Argument | Type | Notes |
|---|---|---|
| `content` | string, required | Markdown, JSON or HTML. Auto-detected. |
| `template` | string, required | `report`, `proposal`, `invoice`, `docs`, `minimal` or `resume`. |
| `output_path` | string | Defaults to `~/Desktop/<title>.pdf`. Missing folders are created. |
| `title` | string | Overrides the extracted title. |
| `author` | string | Author name. |
| `date` | string | Defaults to today. |
| `page_size` | string | `letter` (default) or `a4`. |
| `watermark` | string | Diagonal text, for example `DRAFT`. |
| `primary_color` | string | Brand hex color, for example `#0F2344`. |
| `accent_color` | string | Brand hex color, for example `#B8962E`. |
| `logo_url` | string | URL or data URI. |

More in [docs/agents.md](docs/agents.md).

## FAQ

**Does it make network calls?**
Yes. The templates load fonts from Google Fonts while rendering, and a `logo_url` or any image in your content is fetched. Rendering waits for the network to go quiet, up to 30 seconds. Without a connection the PDF falls back to system fonts or the render can time out.

**Where does the PDF go?**
`~/Desktop/<title>.pdf` by default. The title is stripped to letters, digits, dashes and underscores, and spaces become dashes. An existing file with the same name is overwritten.

**Is it safe to feed it untrusted content?**
No. Content is turned into HTML and rendered in Chromium, which Puppeteer starts with `--no-sandbox`. Treat it like rendering a web page you wrote. See [SECURITY.md](SECURITY.md).

**What do I need installed?**
Node.js 18 or later and the Chromium that Puppeteer downloads.

## Adding a template

Templates are HTML and CSS in `templates/<name>/template.html`. Variables use `{{DOUBLE_BRACES}}`.

Shared variables: `{{TITLE}}`, `{{BODY}}`, `{{AUTHOR}}`, `{{DATE}}`, `{{LOGO_HTML}}`, `{{THEME_VARS}}`, `{{WATERMARK}}`, `{{PAGE_SIZE}}`. Some templates also use `{{SUBTITLE}}`. See [docs/architecture.md](docs/architecture.md) for the rest.

Copy an existing template folder, add the name to `TemplateName` in `src/types.ts` and to the template lists in `src/cli.ts` and `src/index.ts`, and open a pull request.

## Contributing

Bug reports and pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first. Security problems go through [SECURITY.md](SECURITY.md). Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).

Docs: [agents guide](docs/agents.md) · [architecture](docs/architecture.md) · [changelog](CHANGELOG.md)

## License

[MIT](LICENSE) © 2026 Tyler Szakacs
