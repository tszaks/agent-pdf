# Security policy

## Supported versions

Only the latest commit on `main` gets security fixes. No release has been tagged yet.

| Version | Supported |
|---|---|
| `main` (0.1.x) | Yes |
| Older | No |

## Reporting a vulnerability

Please report security problems privately, not in a public issue.

Use GitHub private vulnerability reporting: open the **Security** tab of this repository and choose **Report a vulnerability**. If that is not available to you, email tyler@szakacsmedia.com.

Please include:

- What you found and what an attacker could do with it.
- Steps to reproduce, or a sample input that triggers it.
- Your Node.js version and operating system.

You can expect a first reply within a few days. Once a fix is released we will credit you in the changelog unless you prefer to stay anonymous.

## What counts

`agent-pdf` writes HTML from your content and renders it in headless Chromium. These areas matter most:

- **Untrusted content.** Raw HTML input, and text fields in JSON input, are placed into the page without escaping. Chromium is started with `--no-sandbox`. Do not render content from people you do not trust, and do not run this as root on a machine with sensitive files.
- **Network requests.** Rendering loads Google Fonts, plus any image or logo URL in the content. Content can cause requests from your machine.
- **Output paths.** `-o` and `output_path` can write a PDF to any path the process can write to, and replace an existing file. The MCP server lets an agent choose that path.
