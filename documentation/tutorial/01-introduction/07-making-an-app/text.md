---
title: Making an app
---

This tutorial is designed to get you familiar with the process of writing components. But at some point, you'll want to start writing components in the comfort of your own text editor.

First, you'll need to integrate Svelte with a build tool. There are officially maintained plugins for [Vite](https://vitejs.dev/), [Rollup](https://rollupjs.org) and [webpack](https://webpack.js.org/)...

* [vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte)
* [rollup-plugin-svelte](https://github.com/sveltejs/rollup-plugin-svelte)
* [svelte-loader](https://github.com/sveltejs/svelte-loader)

...and a variety of [community-maintained ones](https://github.com/sveltejs/integrations#bundler-plugins).

Don't worry if you're relatively new to web development and haven't used these tools before. We've prepared a simple step-by-step guide, [Svelte for new developers](blog/svelte-for-new-developers), which walks you through the process.

You'll also want to configure your text editor. If you're using VS Code, install the [Svelte extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode), otherwise follow [this guide](blog/setting-up-your-editor) to configure your text editor to treat `.svelte` files the same as `.html` for the sake of syntax highlighting.

Then, once you've got your project set up, using Svelte components is easy. The compiler turns each component into a regular JavaScript class — just import it and instantiate with `new`:

```js
import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		// we'll learn about props later
		answer: 42
	}
});
```

You can then interact with `app` using the [component API](docs#Client-side_component_API) if you need to.
