# agent-pdf

A TypeScript CLI and MCP server that turns Markdown, JSON or HTML into a styled PDF with headless Chromium (Puppeteer). Node 18+, ES modules, strict TypeScript.

This file is for AI agents that work **on** this code. If you are an agent that **uses** agent-pdf, read [docs/agents.md](docs/agents.md).

## Build and run
- Install: `npm install`. Build: `npm run build` (`tsc` to `dist/`). Watch: `npm run dev`.
- CLI: `node dist/cli.js generate <file|-> -t <template> -o <path>`; `node dist/cli.js templates`.
- MCP server: `node dist/cli.js serve` (stdio). `src/index.ts` starts the server as an import side effect.
- There is no test suite and no linter. Run the build, then generate a PDF with each template you touched and check it. Write test PDFs to `/tmp`, not the user's Desktop.
- Puppeteer needs Chromium. If install scripts were skipped: `npx puppeteer browsers install chrome`.

## Code map
- `src/cli.ts`: commander CLI (`generate`, `templates`, `serve`).
- `src/index.ts`: MCP server and the two tools, `generate_pdf` and `list_templates`.
- `src/generate.ts`: `generate()` runs normalize, build HTML, render.
- `src/engine/normalizer.ts`: detects Markdown, JSON or HTML and builds a `NormalizedContent`.
- `src/engine/template-loader.ts`: fills `{{VARIABLES}}` in `templates/<name>/template.html`, builds theme CSS, watermark, logo, invoice header and table of contents.
- `src/engine/renderer.ts`: Puppeteer launch, `page.pdf`, output path (`~/Desktop/<title>.pdf` by default).
- `src/types.ts`: `TemplateName`, options and content types.
- `templates/`: one folder per template, one `template.html` each.

## Conventions
- Match the surrounding code: naming, comment density, idiom.
- A template name appears in four places: `TemplateName` in `src/types.ts`, `TEMPLATES` in `src/index.ts`, the descriptions in `src/index.ts` and `src/cli.ts`, and the folder under `templates/`. Keep them in step.
- `dist/` and `*.pdf` are git-ignored. Do not commit them.
- Do not add dependencies without discussion.

## Do not
- Do not write PDFs to the user's Desktop while testing.
- Do not publish to npm or push tags unless asked.
- Do not remove `--no-sandbox` from the launch args without checking it still runs in the places people use it (containers, CI). Note the security impact in [SECURITY.md](SECURITY.md).
