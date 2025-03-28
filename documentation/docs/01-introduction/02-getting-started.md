---
title: Getting started
---

We recommend using [SvelteKit](../kit), which lets you [build almost anything](../kit/project-types). It's the official application framework from the Svelte team and powered by [Vite](https://vite.dev/). Create a new project with:

```bash
npx sv create myapp
cd myapp
npm install
npm run dev
```

Don't worry if you don't know Svelte yet! You can ignore all the nice features SvelteKit brings on top for now and dive into it later.

## Alternatives to SvelteKit

You can also use Svelte directly with Vite by running `npm create vite@latest` and selecting the `svelte` option. With this, `npm run build` will generate HTML, JS, and CSS files inside the `dist` directory using [vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte). In most cases, you will probably need to [choose a routing library](faq#Is-there-a-router) as well.

>[!NOTE] Vite is often used in standalone mode to build [single page apps (SPAs)](../kit/glossary#SPA), which you can also [build with SvelteKit](../kit/single-page-apps).

There are also plugins for [Rollup](https://github.com/sveltejs/rollup-plugin-svelte), [Webpack](https://github.com/sveltejs/svelte-loader) [and a few others](https://sveltesociety.dev/packages?category=build-plugins), but we recommend Vite.

## Editor tooling

The Svelte team maintains a [VS Code extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode), and there are integrations with various other [editors](https://sveltesociety.dev/resources#editor-support) and tools as well.

You can also check your code from the command line using [sv check](https://github.com/sveltejs/cli).

## Getting help

Don't be shy about asking for help in the [Discord chatroom](/chat)! You can also find answers on [Stack Overflow](https://stackoverflow.com/questions/tagged/svelte).
