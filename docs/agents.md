# Using agent-pdf from an agent

`agent-pdf` is an MCP server over stdio. Start it with `node /path/to/agent-pdf/dist/cli.js serve`. Setup is in the [README](../README.md#using-with-agents).

## Pick a template

Call `list_templates`, or choose from this table.

| Template | Use for |
|---|---|
| `report` | Research, analysis, reviews |
| `proposal` | Proposals, pitches, RFPs |
| `invoice` | Invoices and estimates. Pass JSON. |
| `docs` | Guides and API docs. Adds a table of contents from `#` to `###` headings. |
| `minimal` | Essays, letters, anything else |
| `resume` | CVs and resumes. One layout with no page header or footer. |

## Call `generate_pdf`

Smallest call:

```json
{ "content": "# Weekly update\n\nShipped the new importer.", "template": "minimal" }
```

The result is text with the saved path, size and template. Give the path to the user. If `output_path` is not set, the file lands in `~/Desktop`.

An invoice:

```json
{
  "template": "invoice",
  "content": "{\"type\":\"invoice\",\"invoiceNumber\":\"INV-001\",\"from\":{\"name\":\"Your Company\"},\"to\":{\"name\":\"Client\"},\"items\":[{\"description\":\"Design\",\"quantity\":2,\"rate\":500}]}"
}
```

## Tips

- `content` is a string. For JSON input, pass the JSON as a string.
- The first `# Heading` in Markdown becomes the title. Pass `title` to override it.
- Set `output_path` when the user wants the file somewhere specific. Missing folders are created, and an existing file is overwritten.
- Failures come back as `Error: ...` with `isError` set. Common causes: missing `content`, an unknown template, invalid JSON, or Chromium not installed.
- Rendering needs network access for fonts. See the [FAQ](../README.md#faq).
