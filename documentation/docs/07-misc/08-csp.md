---
title: Content Security Policy (CSP)
---


`hydratable` adds an inline `<script>` block to the `head` returned from `render`. If you're using [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) (CSP), this script will likely fail to run. You can provide a `nonce` to `render`:

```js
/// file: server.js
import { render } from 'svelte/server';
import App from './App.svelte';
// ---cut---
const nonce = crypto.randomUUID();

const { head, body } = await render(App, {
	csp: { nonce }
});
```

This will add the `nonce` to the script block, on the assumption that you will later add the same nonce to the CSP header of the document that contains it:

```js
/// file: server.js
let response = new Response();
let nonce = 'xyz123';
// ---cut---
response.headers.set(
  'Content-Security-Policy',
  `script-src 'nonce-${nonce}'`
 );
```

It's essential that a `nonce` — which, British slang definition aside, means 'number used once' — is only used when dynamically server rendering an individual response.

If instead you are generating static HTML ahead of time, you must use hashes instead:

```js
/// file: server.js
import { render } from 'svelte/server';
import App from './App.svelte';
// ---cut---
const { head, body, hashes } = await render(App, {
	csp: { hash: true }
});
```

`hashes.script` will be an array of strings like `["sha256-abcd123"]`. As with `nonce`, the hashes should be used in your CSP header:

```js
/// file: server.js
let response = new Response();
let hashes = { script: ['sha256-xyz123'] };
// ---cut---
response.headers.set(
  'Content-Security-Policy',
  `script-src ${hashes.script.map((hash) => `'${hash}'`).join(' ')}`
 );
```

We recommend using `nonce` over hash if you can, as `hash` will interfere with streaming SSR in the future.

## Trusted Types

When using Content Security Policy (CSP) with Trusted Types enabled, Svelte supports the `svelte-trusted-html` policy. This allows you to safely handle HTML content in your templates.

Use `trusted-types svelte-trusted-html` directive to enable Trusted Types policy for Svelte-generated HTML:

You can also utilize `{@html policy.createHTML(html)}` to create trusted HTML strings that comply with your CSP policy
