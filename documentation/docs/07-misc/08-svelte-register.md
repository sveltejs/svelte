---
title: svelte/register
---

Usually Svelte components are compiled by a bundler like [Vite](https://vite.dev). Sometimes, for example in a small Node server or a script, you just want to import a component and use it. `svelte/register` lets Node do that by compiling `.svelte`, `.svelte.js` and `.svelte.ts` files when they're imported:

```sh
node --import svelte/register server.js
```

```js
/// file: server.js
// @noErrors
import { render } from 'svelte/server';
import App from './App.svelte';

const { head, body } = render(App, { props: { name: 'world' } });
```

This requires Node 22.15 or later. `require('./App.svelte')` works too.

> [!NOTE] If you're already using Vite (including via SvelteKit), use it instead. `svelte/register` is meant for cases where a bundler would be overkill.

## Configuration

Compiler options are read from your Svelte config, found from the directory you run `node` from. This can be a `svelte.config.js` file or the options of the Svelte plugin in your `vite.config.js`, the same as the other Svelte tools.

```js
/// file: svelte.config.js
export default {
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};
```

A few differences from the usual defaults:

- [`css`](svelte-compiler#CompileOptions) is `'injected'` unless configured otherwise, so components' styles are applied without having to collect and serve the CSS yourself
- `hmr` is ignored, and so is `dev` when the config comes from `vite.config.js`
- `preprocess` is not supported, and is ignored with a warning

## Client and server

Components are compiled for the server by default, so they can be used with `render`. To get the client version instead, use the `generate` [import attribute](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with):

```js
// @noErrors
import App from './App.svelte' with { generate: 'client' };
```

Each combination of attributes results in a separate module, so you can import both versions of a component in the same process.

## Getting the compiled code

With `as: 'source'`, you get the compiled code as a string instead of the component itself. This is useful to serve components to the browser from a Node server. The code is compiled for the client unless you also pass `generate: 'server'`:

```js
// @noErrors
import code, { css } from './App.svelte' with { as: 'source' };

// `code` is the compiled JavaScript, and `css` is the compiled CSS
// (`null` when the styles are injected, which is the default)
```

The compiled code imports from `svelte` (e.g. `svelte/internal/client`). The browser can't resolve those imports by itself, so you'll need an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap) or something similar to point them at the files of the `svelte` package.

> [!NOTE] TypeScript doesn't know about these attributes and will type `code` as a component and throw a type error for `css`.
