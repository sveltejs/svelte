---
title: Getting started
---

---

To try Svelte in an interactive online environment you can try [the REPL](https://svelte.dev/repl) or [StackBlitz](https://node.new/svelte).

To create a project locally we recommend using [SvelteKit](https://kit.svelte.dev/), the official application framework from the Svelte team:
```
npm create svelte@latest myapp
cd myapp
npm install
npm run dev
```

SvelteKit will handle calling [the Svelte compiler](https://www.npmjs.com/package/svelte) to convert your `.svelte` files into `.js` files that create the DOM and `.css` files that style it. It also provides all the other pieces you need to build a web application such as a development server, routing, and deployment. [SvelteKit](https://kit.svelte.dev/) utilizes [Vite](https://vitejs.dev/) to build your code and handle server-side rendering (SSR). There are [plugins for all the major web bundlers](https://sveltesociety.dev/tools#bundling) to handle Svelte compilation, which will output `.js` and `.css` that you can insert into your HTML, but most others won't handle SSR.

If you don't need a full-fledged app framework and instead want to build a simple frontend-only site/app, you can also use Svelte (without Kit) with Vite by running `npm init vite` and selecting the `svelte` option. With this, `npm run build` will generate HTML, JS and CSS files inside the `dist` directory. 

The Svelte team maintains a [VS Code extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) and there are integrations with various other [editors](https://sveltesociety.dev/tools#editor-support) and tools as well.

If you're having trouble, get help on [Discord](https://svelte.dev/chat) or [StackOverflow](https://stackoverflow.com/questions/tagged/svelte).
