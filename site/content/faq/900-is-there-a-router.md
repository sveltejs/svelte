---
question: Is there a router?
---

The official routing library is [SvelteKit](https://kit.svelte.dev/), which is currently in beta. SvelteKit provides a filesystem router, server-side rendering (SSR), and hot module reloading (HMR) in one easy-to-use package. It shares similarities with Next.js for React.

However, you can use any router lib you want. A lot of people use [page.js](https://github.com/visionmedia/page.js). There's also [navaid](https://github.com/lukeed/navaid), which is very similar. And [universal-router](https://github.com/kriasoft/universal-router), which is isomorphic with child routes, but without built-in history support.

If you prefer a declarative HTML approach, there's the isomorphic [svelte-routing](https://github.com/EmilTholin/svelte-routing) library and a fork of it called [svelte-navigator](https://github.com/mefechoel/svelte-navigator) containing some additional functionality.

If you need hash-based routing on the client side, check out [svelte-spa-router](https://github.com/ItalyPaleAle/svelte-spa-router) or [abstract-state-router](https://github.com/TehShrike/abstract-state-router/).

[Routify](https://routify.dev) is another filesystem-based router, similar to SvelteKit's router. Version 3 supports Svelte's native SSR.
