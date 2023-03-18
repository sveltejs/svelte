---
title: "What's new in Svelte: January 2022"
description: 'Faster builds with SvelteKit and a much anticipated REPL feature'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Happy new year, Svelte Community! Lots to share this month across Svelte, SvelteKit, Language Tools and the Showcase. Thanks to everyone who made 2021 a great year to use Svelte. Looking forward to the next one 🚀

## What's new in SvelteKit

- `@sveltejs/adapter-static` for SvelteKit now has a `precompress` option to make brotli compression of assets and pages easier to do out of the box ([#3079](https://github.com/sveltejs/kit/pull/3079))
- Concurrency mode in SvelteKit will now prerender pages in parallel ([#3120](https://github.com/sveltejs/kit/pull/3120)). It is enabled by default in `1.0.0-next.205` and later
- CSS is now automatically included before JS for improved page performance ([d13efe](https://github.com/sveltejs/kit/commit/d138efe21692f5925f1e89afc0a33f42d6a1a711))
- A new config option adds the ability to disable service worker registration to do your own custom registration ([#2988](https://github.com/sveltejs/kit/pull/2988))
- SSR route-splitting is here - breaking monolithic builds into smaller pieces for improved startup and routing performance ([#2931](https://github.com/sveltejs/kit/pull/2931))
- `request.origin/path/query` is now `request.url` - simplifying the config and page `load` functions ([#3126](https://github.com/sveltejs/kit/pull/3126))
- After the [update to Vite 2.7](https://github.com/sveltejs/kit/pull/3018), SvelteKit users are [reporting significant performance improvements](https://www.reddit.com/r/sveltejs/comments/rljhfc/sveltekit_massive_compiler_improvement_by/) and loading third-parties libraries in SSR has also been greatly improved
- SvelteKit server will now automatically restart when the config files is changed ([vite-plugin-svelte#237](https://github.com/sveltejs/vite-plugin-svelte/pull/237))

## Other new bits from `svelte/*`

- [Svelte 3.44.3](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md#3443) is out with a few bug fixes in the binding and loop code
- Svelte Language Tools has introduced support for the then/catch shorthands from Svelte 3.41 and TypeScript's "go to" functionality ([105.8.0 and later](https://github.com/sveltejs/language-tools/releases/tag/extensions-105.8.0))
- The Svelte REPL got a nice upgrade as well - letting you delete saved REPLs. Try it out by logging in at [svelte.dev/apps](https://svelte.dev/apps)

---

## Community Showcase

**Apps & Sites**

- [Discover Twitter Spaces](https://github.com/navneetsharmaui/discover-twitter-spaces) is a tool that helps you find the Twitter Spaces
- [Modern Fluid Typography Editor](https://github.com/codeAdrian/modern-fluid-typography-editor) helps create beautiful fluid typography using CSS clamp
- [Unnwhiteboard](https://github.com/AviKKi/unnwhiteboard) is a job board for companies (or teams) that don't do "whiteboard" interviews
- [Secret Santa](https://gitlab.com/arturoguzman/secret-santa-sveltekit) is a gift giving coordination app developed with easiness in mind
- [LogSnag](https://logsnag.com/) notifies you of your projects' events and provides you with a timeline to keep track of anything important that happens
- [Version 0.2 of Tangent](http://tangentnotes.com/Download), a Svelte-based note writing app, is now in beta
- [Intl Explorer](https://github.com/jesperorb/intl-explorer) is a tool for viewing output for all possible formatters for Intl

A lot of work this month has gone into migrating the Svelte main website and Svelte REPL to live in the https://github.com/sveltejs/sites repository - including a brand new homepage for [svelte.dev](https://svelte.dev/). Thanks to all the contributors who made this possible!

If you're looking for a fun SvelteKit project to work on, [you can contribute to the Svelte Society site rewrite](https://github.com/svelte-society/sveltesociety-2021/issues) 💅

**Learning and Listening**

_To Read_

- [Mutating Query Params in SvelteKit Without Page Reloads or Navigations](https://dev.to/mohamadharith/mutating-query-params-in-sveltekit-without-page-reloads-or-navigations-2i2b) by Mohamad Harith
- [Svelte for Reactaholics : A guide for React developers](https://www.100ms.live/blog/svelte-guide-for-react-developers) by Puru Vijay
- [Svelte's lifecycle methods can be used anywhere](https://geoffrich.net/posts/svelte-lifecycle-examples/) and [The many meanings of $ in Svelte](https://geoffrich.net/posts/svelte-$-meanings/) by Geoff Rich
- [Vercel and Svelte: A Perfect Match for Web Developers](https://thenewstack.io/vercel-and-svelte-a-perfect-match-for-web-developers/) by Darryl K. Taft
- [User-defined TailwindCSS Color Scheme with Svelte Stores](https://blog.dayslice.io/user-defined-tailwindcss-color-scheme-with-svelte-stores-ad80ca2cf038) by jeremy zaborowski
- [Ionic 6 + Svelte 🚀](https://medium.com/@raymondboswel/ionic-6-svelte-ae904caa82df) by Raymond Boswel
- [What happened in #Svelte language tools this year](https://twitter.com/dummdidumm_/status/1474158105395179525?t=ytj2K2Q52iD5-lNyLnQaAQ&s=19) by Simon H

_To Watch_

- [The Future of Svelte (Interview with Rich Harris)](https://www.youtube.com/watch?v=uQntFkK8Z54) by Lee Robinson, Director of Developer Relations at Vercel
- [Svelte is becoming the go-to framework](https://www.youtube.com/watch?v=fo6BKY2xR2w&t=1834s) for Obsidian plugin developers
- [Sveltekit WordPress Headless Blog](https://www.youtube.com/watch?v=c0UDVgjPxFw) by WebJeda
- [Getting started with SvelteKit](https://www.youtube.com/watch?v=i2suPKMPUFA) by Lihau Tan
- [Deploy a full-stack SvelteKit app on Cloudflare Pages](https://www.youtube.com/watch?v=Wc1_U6Dy5Tw) by 1nf

_To Listen To_

- [Syntax podcast: How To Do Things In Svelte](https://podcasts.apple.com/ca/podcast/how-to-do-things-in-svelte/id1253186678?i=1000544796072)
- [JS Party #205: So much Sveltey goodness (w/ Rich Harris)](https://changelog.com/jsparty/205)

**Libraries, Tools & Components**

- [svelte-headlessui](https://github.com/rgossiaux/svelte-headlessui) is an unofficial, complete Svelte port of the Headless UI component library
- [svelte-forms v2](https://chainlist.github.io/svelte-forms/) has been released - the author is [looking for feedback](https://www.reddit.com/r/sveltejs/comments/r6354j/svelteforms_v2_has_been_released/)
- [Percival](https://github.com/ekzhang/percival) is a declarative data query and visualization language
- [Svelte FlatList](https://github.com/snuffyDev/svelte-flatlist) is a mobile-friendly, simple, and customizable draggable menu
- [svelte-keyed](https://github.com/bryanmylee/svelte-keyed) is a writable derived store for objects and arrays
- [Svemix](https://github.com/svemix/svemix) is Remix for Svelte - providing server scripts inside your Svelte components/routes, which will be transformed into endpoints

Want to add something to the showcase? Need help bringing your next idea to life in Svelte? Join us on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.com/invite/yy75DKs).

See ya next month!
