# Contributing to agent-pdf

Thanks for helping. `agent-pdf` has a narrow job: turn content into a good-looking PDF with no design decisions from the caller. Changes that keep it small and predictable are the easiest to accept.

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- For bugs, open an issue with the template. The input file or JSON that triggers the bug is the most useful thing you can attach.
- For features, open an issue first and describe the problem you want to solve.
- Small fixes (typos, clear bugs) can go straight to a pull request.
- Security problems go through [SECURITY.md](SECURITY.md), not a public issue.

## Setup

You need Node.js 18 or later.

```sh
git clone https://github.com/tszaks/agent-pdf.git
cd agent-pdf
npm install
npm run build
```

Useful commands:

```sh
npm run dev                  # tsc --watch
node dist/cli.js templates   # list templates
node dist/cli.js generate sample.md -t report -o /tmp/sample.pdf
```

Puppeteer downloads Chromium on install. If it did not, run `npx puppeteer browsers install chrome`.

## Tests

There is no test suite yet. Before you open a pull request:

- `npm run build` passes with no TypeScript errors.
- Generate a PDF with every template your change could affect and look at it. For a template change, check the Letter and A4 sizes.

If you add a test setup, add a script to `package.json` and mention it here.

## Code style

- **Match the surrounding code.** Same naming, same comment density, same idiom as the file you are editing. There is no formatter to run, so read the neighbors.
- TypeScript in strict mode, ES modules. Imports of local files end in `.js`.
- Keep dependencies to a minimum. No new dependency without discussion.
- Templates are plain HTML and CSS with `{{VARIABLE}}` placeholders. No build step for templates.

## Pull request checklist

- [ ] `npm run build` passes.
- [ ] You generated a PDF with the affected templates and checked the result.
- [ ] The change is small and focused. Unrelated cleanups go in their own pull request.
- [ ] The code matches the surrounding style and adds no dependency.
- [ ] Docs updated if flags, MCP arguments, input formats or templates changed (README, `docs/`).
- [ ] A line added under `[Unreleased]` in [CHANGELOG.md](CHANGELOG.md) for anything a user would notice.

## Using AI agents to contribute

Fine, as long as you read and understand what you submit and the checklist above is true. [AGENTS.md](AGENTS.md) tells coding agents how this repository works.

## License

By contributing you agree that your contribution is licensed under the [MIT License](LICENSE).
