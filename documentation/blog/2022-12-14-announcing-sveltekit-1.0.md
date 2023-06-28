---
title: Announcing SvelteKit 1.0
description: Web development, streamlined
author: The Svelte team
authorURL: https://svelte.dev/
---

After two years in development, [SvelteKit](https://kit.svelte.dev) has finally reached 1.0. As of today, it’s the recommended way to build Svelte apps of all shapes and sizes.

We’re so excited to share this release with you. It’s the culmination of thousands of hours of work, both from the Svelte core team and the wider community, and we think it’s the most enjoyable way to build production-grade websites, whether you’re a solo developer working on a small project or part of a large team.

To get started, run `npm create svelte@latest`, and visit the [docs](https://kit.svelte.dev/docs) and (experimental!) [interactive tutorial](https://learn.svelte.dev).

<div class="max">
<figure style="max-width: 960px; margin: 0 auto">
<div style="height: 0; padding: 0 0 57.1% 0; position: relative; margin: 0 auto;">
	<iframe style="position: absolute; width: 100%; height: 100%; left: 0; top: 0; margin: 0;" src="https://www.youtube-nocookie.com/embed/N4BRVkQVoMc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

<figcaption>Svelte Radio Live: the Christmas special</figcaption>
</figure>
</div>

## What is SvelteKit?

SvelteKit is a framework for building web applications on top of [Svelte](https://svelte.dev), a UI component framework [that](https://insights.stackoverflow.com/survey/2021#section-most-loved-dreaded-and-wanted-web-frameworks) [developers](https://2021.stateofjs.com/en-US/libraries/front-end-frameworks/) [love](https://twitter.com/Rich_Harris/status/1589675637195042817) for its performance and ease of use.

If you’ve used component frameworks like Svelte, you’ll know that they make it much easier to build user interfaces than working with the DOM directly. But they leave a lot of questions unanswered:

- How do I structure my source code?
- How do I add server-side rendering?
- How do I add routing that works on the server and in the browser?
- How do I make client-side routing accessible?
- How do I fetch data?
- How do I mutate data?
- How do I handle errors?
- How do I optimise my production build?
- How do I handle environment variables sensibly and securely?
- How do I add CSP headers and CSRF protection?
- How do I add a service worker that knows what to cache?
- How do I prepare my application for deployment?

An application framework is designed to answer these questions. SvelteKit does so with a design informed by the real world needs of an army of beta testers (many of whom have been running SvelteKit in production for some time — we salute your courage and thank you for the invaluable feedback) and the best ideas from other application frameworks including [Next.js](https://nextjs.org/) and [Remix](https://remix.run/).

## How is it different?

Web developers today are spoiled for choice. Aside from the aforementioned frameworks, there are options like [Astro](https://astro.build/), battle-tested server frameworks like [Rails](https://rubyonrails.org/) and [Laravel](https://laravel.com/), and a million static site generators. These are all wonderful tools, and you should feel good about choosing them.

SvelteKit does things a little differently, however:

**Unlike traditional ‘multi-page app’ or MPA frameworks,** it defaults to client-side navigation after the initial server-rendered page load. This enables faster page transitions, state that persists between pages (such as a sidebar’s scroll position), and less data usage. It also avoids re-running third party scripts like analytics on every single page load.

**Unlike traditional server frameworks,** it allows you to use one language, instead of effectively having two tightly-coupled apps (one to generate HTML, one to handle client-side interaction). Because SvelteKit runs wherever JavaScript runs, you can deploy your app as a traditional Node server, or using serverless functions — including at the edge.

**Unlike static site generators,** you can build apps with personalised or dynamic data — without the performance-killing, layout-shifting effects of fetching it from the browser after the page loads.

With SvelteKit, you have flexibility. Many frameworks assume there’s one correct way to build an app, but reality is more nuanced. It’s not true, for example, that prerendering static pages is just a poor man’s `cache-control` — it also lets you do build-time validation or render data from the filesystem that your edge functions can’t access, and acts as a hedge against flaky databases. It’s not true that everything needs server-side rendering — it’s the right default if you want robust, performant apps with good SEO, but there are countless exceptions.

In a SvelteKit app, you can make these choices with as much granularity as you need — for example the page you’re looking at is prerendered, but the [REPL](/repl) is rendered with dynamic data. Switching between the two is a single line of code. We call apps built with this approach ‘[transitional apps](https://www.youtube.com/watch?v=860d8usGC0o)’.

## What can I use with SvelteKit?

Because SvelteKit uses [Vite](https://vitejs.dev/), the lightning-fast build tool, it has out-of-the-box support for hot module reloading, TypeScript, and many other things that developers rely on. You can install plugins from the vast Vite and Rollup ecosystems to add support for other tools.

When creating a SvelteKit project you’ll be asked if you want to add [TypeScript](https://www.typescriptlang.org/), [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [Playwright](https://playwright.dev/) (for end-to-end browser tests) and [Vitest](https://vitest.dev/) (for unit tests). Integration guides already exist for many popular projects — [Tailwind](https://tailwindcss.com/docs/guides/sveltekit) and [Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-sveltekit), for example. You can use [Storybook](https://github.com/storybookjs/storybook/blob/next/code/frameworks/sveltekit/README.md) and [Histoire](https://histoire.dev/guide/svelte3/getting-started.html) for your component stories. The community-maintained [svelte-add](https://github.com/svelte-add/svelte-add) lets you add a growing list of other integrations with a single command.

And of course you have access to everything [npm](https://npmjs.com/) has to offer. (Note that some packages require Node.js, and so can only be used when deployed to Node-based platforms.)

## Where can I deploy my apps?

Anywhere! The SvelteKit CLI needs Node.js installed locally, but the framework itself has no dependencies on any platform. This means you can deploy it wherever JavaScript runs.

This is made possible by [adapters](https://kit.svelte.dev/docs/adapters). The default adapter, [adapter-auto](https://github.com/sveltejs/kit/tree/master/packages/adapter-auto), provides zero-config support for Vercel, Netlify, Cloudflare Pages and Azure Static Web Apps, with more platforms coming in the future. Community-provided adapters add support for Deno, Bun, Firebase, App Engine, AWS Lambda and many others.

You can also deploy your app as a Node.js server using [adapter-node](https://github.com/sveltejs/kit/tree/master/packages/adapter-node).

If your entire app is suitable for prerendering, or is a single-page app (SPA), you can use [adapter-static](https://github.com/sveltejs/kit/tree/master/packages/adapter-static) — which turns SvelteKit into a static site generator — with any web server including [GitHub Pages](https://pages.github.com/).

## Acknowledgements

This release was made possible by the hard work of a great many people. First and foremost, we’d like to thank the Svelte community, whose insightful feedback and myriad contributions large and small have shaped this project into something we’re truly proud to share with the wider community of web developers.

We’re also indebted to [Svelte Society](https://sveltesociety.dev/) and the community ambassadors, who, through initiatives like [Svelte Summit](https://www.sveltesummit.com/) and [Svelte Sirens](https://sveltesirens.dev/), have created a lively and welcoming space for Svelte developers, both online and IRL.

There are too many content creators to name without leaving people left out, but to everyone who has released courses and produced educational content around SvelteKit: thank you.

Back in early 2021, when we adopted Vite, we were the first major application framework to do so. At the time it was a risky bet, but we’re thrilled with how that bet paid off. Vite has grown to be an unstoppable force in the JavaScript world, and the Vite team have been brilliant and gracious partners.

We’ve had terrific support from teams at [Vercel](https://vercel.com), [Netlify](https://netlify.app/) and [Cloudflare](https://www.cloudflare.com/) to make zero-config deployments for those platforms possible.

Our friends at [StackBlitz](https://stackblitz.com/) worked feverishly to make [learn.svelte.dev](https://learn.svelte.dev), our first-of-its-kind [WebContainer](https://blog.stackblitz.com/posts/introducing-webcontainers/)-powered interactive tutorial, a reality.

Finally, none of this could have happened without the project’s financial supporters. This includes hundreds of backers on [Open Collective](https://opencollective.com/svelte), and Vercel, which employs two core developers ([Rich](https://twitter.com/Rich_Harris/) and [Simon](https://twitter.com/dummdidumm_/)) to work on Svelte full time and supports the project in many other ways, such as [Steph’s](https://twitter.com/steph_dietz_) [Beginner SvelteKit](https://vercel.com/docs/beginner-sveltekit) course.

## Migrating

If you have an app built with pre-release versions of SvelteKit, we recommend upgrading to the final pre-release version — `@sveltejs/kit@1.0.0-next.588` — before upgrading to 1.0, as the stable release removes errors and warnings that were used for migrating between pre-release versions. We also recommend consulting [this migration guide](https://github.com/sveltejs/kit/discussions/5774), especially if you’re currently on an older version than 1.0.0-next-406.

## What’s next?

SvelteKit 1.0 is the beginning, not the end. It’s ready for production use today, but we’re just getting started. Our roadmap includes built-in i18n support, incremental static regeneration, granular control over deployment region and runtime, image optimisation, and many other improvements. Next year we’ll also start work on Svelte 4 — more on that later.

But don’t let us have the final word. Svelte is a community project, and many of our best ideas aren’t really ours at all — they’re yours. Subscribe to Svelte Society on [Twitter](https://twitter.com/SvelteSociety) and [YouTube](https://youtube.com/sveltesociety) to stay up to date, and join us in our [Discord server](https://svelte.dev/chat) and on [GitHub](https://github.com/sveltejs) to contribute back.

We can’t wait to see what you build.
