# Svelte Coding Agent Guide

This guide is for AI coding agents working in the Svelte monorepo.

**Important:** Read and follow [`CONTRIBUTING.md`](./CONTRIBUTING.md) as well - it contains essential information about testing, code structure, and contribution guidelines that applies here.

When submitting a PR, you **MUST** read [`PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md) and fill it out correctly. **DO NOT** submit a PR without running the full test suite.

## Security Policy

See https://github.com/sveltejs/svelte/security/policy.

## Quick Reference

If asked to do a performance investigation, use the `performance-investigation` skill.

## Tests

Most commonly, new tests will go in the `runtime-runes` suite. Observe the conventions established by existing tests, but don't be beholden to them — a lot of mistakes were made while building the test suite. In particular:

- prefer `<script lang="ts">`
- try to put everything in a single `main.svelte` file unless you are specifically testing cross-module or child component behaviour, so the test is more portable.
- Avoid using `props` unless necessary, and use buttons and inputs to change state rather than component exports
- put the expected contents in an `<output>` element, get a reference to it with `const [output] = target.querySelectorAll('output')` (unlike `querySelector`, this tricks TypeScript into believing it exists, without non-null assertions). You can then `assert.htmlEqual(output.innerHTML, ...)` without having to include all the buttons etc
