# Changelog

All notable changes to agent-pdf are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- MIT `LICENSE` file, contributing guide, security policy, code of conduct, agent guide, issue and pull request templates, and a CI workflow that builds the project.

## [0.1.0] - 2026-06-03

First version. No git tag or npm release exists for it yet.

### Added
- `agent-pdf` command line tool with `generate`, `templates` and `serve` commands.
- MCP server over stdio with the `generate_pdf` and `list_templates` tools.
- Templates: `report`, `proposal`, `invoice`, `docs` and `minimal`.
- Input detection for Markdown, JSON (generic and invoice) and raw HTML.
- Options for page size (Letter or A4), watermark, brand colors and logo.
- `resume` template.

### Fixed
- Double title and double line bugs in the templates.
