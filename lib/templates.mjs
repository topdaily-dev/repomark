/** @type {Record<string, { path: string; content: string }>} */
export const FIX_TEMPLATES = {
  license: {
    path: "LICENSE",
    content: `MIT License

Copyright (c) ${new Date().getFullYear()} Project contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`,
  },
  security: {
    path: "SECURITY.md",
    content: `# Security policy

## Supported versions

Security fixes are applied to the latest release on the default branch.

## Reporting a vulnerability

Please report security issues privately — do **not** open a public issue.

Email: security@example.com (replace with your contact)

Include:

- A description of the issue
- Steps to reproduce
- Impact assessment if known

We aim to acknowledge reports within 72 hours.
`,
  },
  contributing: {
    path: "CONTRIBUTING.md",
    content: `# Contributing

Thanks for your interest in contributing!

## Getting started

1. Fork the repository and create a branch from \`main\`.
2. Install dependencies and run tests locally.
3. Keep commits focused; use [Conventional Commits](https://www.conventionalcommits.org/) where possible.

## Pull requests

- Describe what changed and why.
- Link related issues when applicable.
- Ensure CI passes before requesting review.

## Code of conduct

Be respectful and constructive. See \`CODE_OF_CONDUCT.md\` if present.
`,
  },
  "code-of-conduct": {
    path: "CODE_OF_CONDUCT.md",
    content: `# Contributor Covenant Code of Conduct

## Our pledge

We pledge to make participation in our project a harassment-free experience for
everyone, regardless of age, body size, disability, ethnicity, gender identity
and expression, level of experience, nationality, personal appearance, race,
religion, or sexual identity and orientation.

## Our standards

Examples of behavior that contributes to a positive environment:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

Examples of unacceptable behavior:

- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission

## Enforcement

Project maintainers may remove, edit, or reject comments, commits, code, wiki
edits, issues, and other contributions that are not aligned to this Code of
Conduct.

Report unacceptable behavior to the maintainers via the contact listed in
\`SECURITY.md\` or repository issues (for non-sensitive reports).
`,
  },
  dependabot: {
    path: ".github/dependabot.yml",
    content: `version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
  - package-ecosystem: github-actions
    directory: "/"
    schedule:
      interval: weekly
`,
  },
  nvmrc: {
    path: ".nvmrc",
    content: "20\n",
  },
  ci: {
    path: ".github/workflows/ci.yml",
    content: `name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - run: npm ci
      - run: npm test
`,
  },
};
