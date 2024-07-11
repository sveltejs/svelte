---
title: Getting started
---

- `npm create svelte@latest`, describe that it scaffolds SvelteKit project
- `npm create vite@latest`, describe that it scaffolds Svelte SPA powered by Vite
- mention `svelte-add`
- Jump off points to tutorial, SvelteKit etc

## Start a new project

We recommend using [SvelteKit](https://kit.svelte.dev/), the official application framework from the Svelte team:

```
npm create svelte@latest myapp
cd myapp
npm install
npm run dev
```

SvelteKit will handle calling [the Svelte compiler](https://www.npmjs.com/package/svelte) to convert your `.svelte` files into `.js` files that create the DOM and `.css` files that style it. It also provides all the other pieces you need to build a web application such as a development server, routing, deployment, and SSR support. [SvelteKit](https://kit.svelte.dev/) uses [Vite](https://vitejs.dev/) to build your code.

Don't worry if you don't know Svelte yet! You can ignore all the nice features SvelteKit brings on top for now and dive into it later.

### Alternatives to SvelteKit

If you don't want to use SvelteKit for some reason, you can also use Svelte with Vite (but without SvelteKit) by running `npm create vite@latest` and selecting the `svelte` option. With this, `npm run build` will generate HTML, JS and CSS files inside the `dist` directory thanks using [vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte). In most cases, you will probably need to [choose a routing library](faq#is-there-a-router) as well.

Alternatively, there are plugins for [Rollup](https://github.com/sveltejs/rollup-plugin-svelte), [Webpack](https://github.com/sveltejs/svelte-loader) [and a few others](https://sveltesociety.dev/packages?category=build-plugins) to handle Svelte compilation — which will output `.js` and `.css` that you can insert into your HTML — but setting up SSR with them requires more manual work.

## Editor tooling

The Svelte team maintains a [VS Code extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) and there are integrations with various other [editors](https://sveltesociety.dev/resources#editor-support) and tools as well.

You can also check your code from the command line using [svelte-check](https://www.npmjs.com/package/svelte-check) (using the Svelte or Vite CLI setup will install this for you).

## Getting help

Don't be shy about asking for help in the [Discord chatroom](https://svelte.dev/chat)! You can also find answers on [Stack Overflow](https://stackoverflow.com/questions/tagged/svelte).
