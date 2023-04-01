---
title: Differences from SvelteKit
---

Svelte renders UI components. You can compose these components and render an entire page with just Svelte, but you need more than just Svelte to write an entire app.

SvelteKit provides basic functionality like a [router](https://kit.svelte.dev/glossary#routing) — which updates the UI when a link is clicked — and [server-side rendering (SSR)](https://kit.svelte.dev/glossary#ssr). But beyond that, building an app with all the modern best practices is fiendishly complicated. Those practices include [build optimizations](https://vitejs.dev/guide/features.html#build-optimizations), so that you load only the minimal required code; [offline support](service-workers); [preloading](https://kit.svelte.dev/link-options#data-sveltekit-preload-data) pages before the user initiates navigation; [configurable rendering](https://kit.svelte.dev/page-options) that allows you to render different parts of your app on the server with [SSR](https://kit.svelte.dev/glossary#ssr), in the browser [client-side rendering](https://kit.svelte.dev/glossary#csr), or at build-time with [prerendering](https://kit.svelte.dev/glossary#prerendering); and many other things. SvelteKit does all the boring stuff for you so that you can get on with the creative part.

It reflects changes to your code in the browser instantly to provide a lightning-fast and feature-rich development experience by leveraging [Vite](https://vitejs.dev/) with a [Svelte plugin](https://github.com/sveltejs/vite-plugin-svelte) to do [Hot Module Replacement (HMR)](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#hot).
