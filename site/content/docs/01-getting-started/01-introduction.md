---
title: Introduction
---

Welcome to Svelte docs. These are for folks who are already familiar with Svelte and want to learn more about the details of how it works.

If that's not you (yet), you may prefer to visit the [interactive tutorial](/tutorial) or the [examples](/examples) before consulting this reference.

Don't be shy about asking for help in the [Discord chatroom](https://svelte.dev/chat).

Using an older version of Svelte? Have a look at the [v2 docs](https://v2.svelte.dev).

## Start a new project

To try Svelte in an interactive online environment you can try [the REPL](https://svelte.dev/repl) or [StackBlitz](https://node.new/svelte).

To create a project locally we recommend using [SvelteKit](https://kit.svelte.dev/), the official application framework from the Svelte team:

```
npm create svelte@latest myapp
cd myapp
npm install
npm run dev
```

SvelteKit will handle calling [the Svelte compiler](https://www.npmjs.com/package/svelte) to convert your `.svelte` files into `.js` files that create the DOM and `.css` files that style it. It also provides all the other pieces you need to build a web application such as a development server, routing, and deployment. [SvelteKit](https://kit.svelte.dev/) utilizes [Vite](https://vitejs.dev/) to build your code and handle server-side rendering (SSR). There are [plugins for all the major web bundlers](https://sveltesociety.dev/tools#bundling) to handle Svelte compilation, which will output `.js` and `.css` that you can insert into your HTML, but most others won't handle SSR.

### Alternatives to SvelteKit

If you don't need a full-fledged app framework and instead want to build a simple frontend-only site/app, you can also use Svelte (without Kit) with Vite by running `npm init vite` and selecting the `svelte` option. With this, `npm run build` will generate HTML, JS and CSS files inside the `dist` directory.

Notable Mentions:

- [Routify](https://www.routify.dev/)
- [Elder.js](https://elderjs.com/)

## Differences from SvelteKit

Svelte renders UI components. You can compose these components and render an entire page with just Svelte, but you need more than just Svelte to write an entire app.

SvelteKit provides basic functionality like a [router](https://kit.svelte.dev/glossary#routing) — which updates the UI when a link is clicked — and [server-side rendering (SSR)](https://kit.svelte.dev/glossary#ssr). But beyond that, building an app with all the modern best practices is fiendishly complicated. Those practices include [build optimizations](https://vitejs.dev/guide/features.html#build-optimizations), so that you load only the minimal required code; [offline support](https://kit.svelte.devservice-workers); [preloading](https://kit.svelte.dev/link-options#data-sveltekit-preload-data) pages before the user initiates navigation; [configurable rendering](https://kit.svelte.dev/page-options) that allows you to render different parts of your app on the server with [SSR](https://kit.svelte.dev/glossary#ssr), in the browser [client-side rendering](https://kit.svelte.dev/glossary#csr), or at build-time with [prerendering](https://kit.svelte.dev/glossary#prerendering); and many other things. SvelteKit does all the boring stuff for you so that you can get on with the creative part.

It reflects changes to your code in the browser instantly to provide a lightning-fast and feature-rich development experience by leveraging [Vite](https://vitejs.dev/) with a [Svelte plugin](https://github.com/sveltejs/vite-plugin-svelte) to do [Hot Module Replacement (HMR)](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#hot).

## Editor tooling

The Svelte team maintains a [VS Code extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) and there are integrations with various other [editors](https://sveltesociety.dev/tools#editor-support) and tools as well.

If you're having trouble, get help on [Discord](https://svelte.dev/chat) or [StackOverflow](https://stackoverflow.com/questions/tagged/svelte).
