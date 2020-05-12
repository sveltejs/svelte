---
question: Is there a router?
---

You can use any router lib you want. A lot of people use [page.js](https://github.com/visionmedia/page.js). There's also [navaid](https://github.com/lukeed/navaid), which is very similar.

If you prefer a declarative HTML approach, there's [svelte-routing](https://github.com/EmilTholin/svelte-routing).

If you need hash-based routing on the client side, check out [svelte-spa-router](https://github.com/ItalyPaleAle/svelte-spa-router), or [abstract-state-router](https://github.com/TehShrike/abstract-state-router/), a mature router for business software.

For filesystem-based routing, you can take a look at [Routify](https://routify.dev).

For an official solution, there's nothing that's simply a routing library. There is, however, the official [Sapper](https://sapper.svelte.dev/) framework, a Next.js-style application framework built on Svelte, which includes its own filesystem-based routing.