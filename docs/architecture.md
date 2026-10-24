# Architecture

`generate(content, options)` in `src/generate.ts` runs three steps.

1. **Normalize** (`src/engine/normalizer.ts`). The input string is classed as JSON (starts with `{` or `[`), HTML (contains a tag) or Markdown. Markdown is converted with `marked` (GitHub flavored). For Markdown and HTML, the first `<h1>` becomes the title and is removed from the body. JSON becomes a `NormalizedContent` object: invoices get line items, subtotal and total, other templates get HTML from `sections` or `content`. The `docs` template also gets heading ids and a table of contents.
2. **Build HTML** (`src/engine/template-loader.ts`). `templates/<type>/template.html` is loaded and every `{{VARIABLE}}` is replaced. Unknown variables become an empty string. Theme colors become a `<style>` block that sets `--color-primary` and `--color-accent`.
3. **Render** (`src/engine/renderer.ts`). Puppeteer launches headless Chromium, loads the HTML, waits for the network to go idle (30 second limit) plus half a second for fonts, then calls `page.pdf` on Letter or A4 with backgrounds on. All templates except `resume` get a small running header (title) and footer (page x / y).

## Template variables

| Variable | Used by | Source |
|---|---|---|
| `TITLE`, `BODY`, `AUTHOR`, `DATE`, `LOGO_HTML`, `THEME_VARS`, `WATERMARK`, `PAGE_SIZE` | all | Content and options. `DATE` defaults to today. |
| `SUBTITLE` | report, proposal, docs, minimal | JSON `subtitle` |
| `ABSTRACT` | report | JSON `abstract` |
| `TAGLINE`, `PREPARED_FOR`, `PREPARED_BY` | proposal | JSON `tagline`, `preparedFor`, `preparedBy` |
| `INVOICE_HEADER`, `INVOICE_NUMBER` | invoice | JSON `from`, `to`, `invoiceNumber`, `dueDate` |
| `VERSION`, `TOC_HTML` | docs | JSON `version`, headings |
| `CONTACT_LINE` | resume | Built from the resume contact fields in `ResumeContent` |

## Entry points

- `src/cli.ts` is the `agent-pdf` binary. `serve` imports `src/index.ts`.
- `src/index.ts` is the MCP server. It maps `generate_pdf` arguments (snake_case) to `GenerateOptions`.
