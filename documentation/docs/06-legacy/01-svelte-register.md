---
title: 'svelte/register'
---

> This API is removed in Svelte 4. `require` hooks are deprecated and current Node versions understand ESM. Use a bundler like Vite or our full-stack framework [SvelteKit](https://kit.svelte.dev) instead to create JavaScript modules from Svelte components.

To render Svelte components in Node.js without bundling, use `require('svelte/register')`. After that, you can use `require` to include any `.svelte` file.

```js
// @noErrors
require('svelte/register');

const App = require('./App.svelte').default;

// ...

const { html, css, head } = App.render({ answer: 42 });
```

> The `.default` is necessary because we're converting from native JavaScript modules to the CommonJS modules recognised by Node. Note that if your component imports JavaScript modules, they will fail to load in Node and you will need to use a bundler instead.

To set compile options, or to use a custom file extension, call the `register` hook as a function:

```js
// @noErrors
require('svelte/register')({
	extensions: ['.customextension'], // defaults to ['.html', '.svelte']
	preserveComments: true
});
```
