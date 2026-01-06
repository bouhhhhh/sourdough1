# Security Policy

Thank you for taking security seriously. This document describes how to report security vulnerabilities and what to expect after reporting them.

## Reporting a Vulnerability

- Preferred: Open a private security advisory on the repository (GitHub) so maintainers can coordinate the fix before public disclosure.
- If a private advisory is not available, open an issue and mark it as sensitive, or email the maintainers if an address is provided in repository settings.

Do not post exploit details publicly until a fix is released.

## Supported Versions

We aim to support the current release and the previous major release of this project. Security fixes will be prioritized for supported versions.

## Response and Timeline

- Acknowledgement: within 3 business days.
- Initial triage: within 7 business days.
- Fix/Patch: depends on severity; critical issues will be prioritized.

If you require a PGP key or specific secure contact channel, please open a private advisory with that preference.

## Disclosure Policy

We follow a coordinated disclosure approach: maintainers will work with reporters to fix the issue and prepare a public advisory when appropriate.

## Security Best Practices (for contributors)

- Keep secrets out of source code — use environment variables or secrets management.
- Rotate API keys and credentials if they may have been exposed.
- Follow dependency update practices and run regular vulnerability scans.
