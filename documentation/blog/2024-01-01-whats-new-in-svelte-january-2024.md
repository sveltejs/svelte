---
title: "What's new in Svelte: January 2024"
description: 'SvelteKit 2 and a much-improved $state rune'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Happy New Year! It's been a busy month for the Svelte maintainers - with tons of new features dropping in the Svelte 5 preview and the [release of SvelteKit 2](https://svelte.dev/blog/sveltekit-2)!

You can find all the new features in both projects below, along with a bunch of resources and sites built with Svelte in the Community Showcase.

Let's jump in...

## What's new in SvelteKit (2.0 and more!)

With its 2.0 release, SvelteKit is now more capable than ever. Be sure to check out the docs links in each update for more info on how to use each feature as well as the new [Performance](https://kit.svelte.dev/docs/performance) page - which explains how SvelteKit works to make your applications as performant as possible.

- `resolvePath` has been replaced by `resolveRoute` in `$app/paths`. Use it to populate a route ID with params to resolve a pathname (**1.29.0**, [Docs](https://kit.svelte.dev/docs/modules#app-paths-resolveroute), [#11261](https://github.com/sveltejs/kit/pull/11261))
- `response.arrayBuffer()` will now be inlined during SSR (**1.30.0**, [Docs](https://kit.svelte.dev/docs/load#making-fetch-requests), [#10535](https://github.com/sveltejs/kit/pull/10535))
- [SvelteKit 2.0.0](https://github.com/sveltejs/kit/blob/main/packages/kit/CHANGELOG.md#200) adds:
  - `untrack` to `load` to opt-out of invalidation ([Docs](https://kit.svelte.dev/docs/load#rerunning-load-functions-untracking-dependencies), [#11311](https://github.com/sveltejs/kit/pull/11311))
  - shallow routing to create history entries without navigating ([Docs](https://kit.svelte.dev/docs/shallow-routing), [#11307](https://github.com/sveltejs/kit/pull/11307))
  - html typings ([#11222](https://github.com/sveltejs/kit/pull/11222))
  - redacted internal stack traces when reporting config errors ([#11292](https://github.com/sveltejs/kit/pull/11292))
  - fine grained invalidation of search params ([Docs](https://kit.svelte.dev/docs/load#rerunning-load-functions), [#11258](https://github.com/sveltejs/kit/pull/11258))

You can find a migration guide for SvelteKit 2.0 [on the SvelteKit docs](https://kit.svelte.dev/docs/migrating-to-sveltekit-2). Things should be pretty seamless with the `svelte-migrate` command doing much (if not all) for you!


## What's new in Svelte

With [Svelte 5 in preview](https://svelte-5-preview.vercel.app/docs/introduction), Svelte 4 (`@latest`) has only been getting bug fixes - with its current version at `4.2.8`. The updates below are from version 5's preview branch:

- The new `$inspect` rune is like `console.log` except that it will re-run whenever its argument changes (**5.0.0-next.16**, [Docs](https://svelte-5-preview.vercel.app/docs/runes#inspect), [#9705](https://github.com/sveltejs/svelte/pull/9705))
- `$state` is now proxied to make reactivity nested by default. This is a response to user feedback with plenty of context in the PR - so check it out if you're interested on how the syntax has improved during the preview (**5.0.0-next.18**, [Docs/Examples](https://svelte-5-preview.vercel.app/docs/fine-grained-reactivity), [#9739](https://github.com/sveltejs/svelte/pull/9739))
- Fallback values for bindings are disallowed in runes mode since they're confusing, and a source of bugginess and implementation complexity (5.0.0-next.19, [#9784](https://github.com/sveltejs/svelte/pull/9784))
- Fallback props are now readonly (unless used with `bind:`). By extension, default values should also be readonly (**5.0.0-next.19**, [#9789](https://github.com/sveltejs/svelte/pull/9789))
- The new `unstate` function allows you to remove reactivity from objects and arrays created with `$state` (**5.0.0-next.19**, [Docs](https://svelte-5-preview.vercel.app/docs/functions#unstate), [#9776](https://github.com/sveltejs/svelte/pull/9776))
- GamepadEventHandlers for window.addEventListener (`gamepadconnected` and `gamepaddisconnected`) have been added (**5.0.0-next.23**, [Docs](https://developer.mozilla.org/en-US/docs/Web/API/GamepadEvent), [#9861](https://github.com/sveltejs/svelte/pull/9861))
- `{@const}` can now be used inside snippet blocks (**5.0.0-next.24**, [#9904](https://github.com/sveltejs/svelte/pull/9904))
- The new `$state.frozen` rune lets you access a read-only version of `$state` that cannot be mutated. This is useful if you want to work with data using immutable patterns rather than mutable patterns (**5.0.0-next.27**, [Docs](https://svelte-5-preview.vercel.app/docs/runes#state-frozen), [#9851](https://github.com/sveltejs/svelte/pull/9851))

For all the release notes going forward, check out [the CHANGELOG on main](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md).


---

## Community Showcase

**Apps & Sites built with Svelte**

- [eCourse](https://github.com/Ilyas-Codes/eCourse) is a sleek and customizable website template designed for effortless self-hosting of your online course
- [Typogram](https://typogram.co/) is a brand design tool with "a sprinkle of AI"
- [calcium](https://github.com/ethanlynn/calcium) is a browser extension for devs with fuzzy-find on browser tabs, bookmarks, history
and common developer docs
- [hintable](https://github.com/willuhmjs/hintable) is an exciting word guessing game
- [domian.io](https://domian.io/) retrieves a list of the most likely misspellings for your domain, their availability, and an easy way to register them
- [Story Scroller](https://svelte.dev/repl/6182be0c3ada4a15b5046f7d0d031727?version=4.2.8) is a REPL showcasing how Svelte can be used to make a scrollable cards list
- [The Atlas of Sustainable Development Goals 2023](https://datatopics.worldbank.org/sdgatlas?lang=en) presents interactive storytelling and data visualizations about the 17 Sustainable Development Goals.
- [Lingotrack](https://lingotrack.com/) is a social platform for you as a language learner to track your progress and find engaging new media
- [Lofi Flow](https://github.com/nico-mayer/lofi-flow) lets you save your best-loved YouTube lofi live radios and videos in one spot

**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_
- [Svelte in dynamic e-commerce widgets with Jacob Stordahl](https://www.svelteradio.com/episodes/svelte-in-dynamic-e-commerce-widgets-with-jacob-stordahl) and [Slicing Svelte with Sam Littlefair and Prismic](https://www.svelteradio.com/episodes/slicing-svelte-with-sam-littlefair-and-prismic) from Svelte Radio
- [I already love SvelteKit v2](https://www.youtube.com/watch?v=B19DEGEclfk) by Huntabyte
- [14 Awesome Real World Projects That Use Svelte](https://www.youtube.com/watch?v=E9HxrW5yivs) by Joy of Code
- [Building a SvelteKit Adapter for WinterJS](https://www.youtube.com/watch?v=8HaAagG6V-Q) with Willow and Kev
- [Progressive Splash Screen](https://www.sveltevietnam.dev/en/blog/20231220-behind-the-screen-progressive-splashscreen) by Quang Phan (Svelte Vietnam)
- This Week in Svelte:
  - [2023 Dec 1](https://www.youtube.com/watch?v=GH5NxbdCZ74) - Svelte 4.2.8, reusing searchParams, peerDependencies!
  - [2023 Dec 8](https://www.youtube.com/watch?v=kgrIhRQ9sh8) - validating forms UX, suppress ESLint warnings, bound functions
  - [2023 Dec 15](https://www.youtube.com/watch?v=57tawstksmc) - SvelteKit 2.0
  - [22 Dec 2023](https://www.youtube.com/watch?v=O5ElGJICg0s) - SvelteKit 2.0.6, handling peerDependencies, action params
  - [29 Dec 2023](https://www.youtube.com/watch?v=byeF6ECbvGY)

_To Watch/Hear_

- [Let's Build A Dropbox clone With SvelteKit And Firebase 🔥, Tailwind css, Shad-cn svelte etc 😁](https://www.youtube.com/watch?v=6RhSzX7Ac0k) by Lawal Adebola
- ["App-like" List → Detail View Transitions 🦸 with SvelteKit](https://www.youtube.com/watch?v=suuxXrMs5P4) by Johnny Magrippis
- [Learn SvelteKit · Build a Modern Landing Page w. SvelteKit & TailwindCSS](https://www.youtube.com/watch?v=N6wf2QXEHYk) by Smoljames

_To Read_

- [Deploy a SvelteKit App to GitHub Pages](https://www.captaincodeman.com/deploy-a-sveltekit-app-to-github-pages) by Captain Codeman
- [A Practical Guide to Mocking Svelte Stores with Vitest](https://bentilling.com/a-practical-guide-to-mocking-svelte-stores-with-vitest) by Ben Tilling
- [Svelte 5 is good, but runes need improvement](https://kylenazario.com/blog/svelte-5-runes-impressions) by Kyle Nazario
- [Shader Park and 2D](https://untested.sonnet.io/Shader+Park+and+2D) by Untested


**Libraries, Tools & Components**

- [Routify](https://routify.dev/blog/routify-3-release-candidate), the popular routing library used in many Svelte apps, has its first Release Candidate for version 3
- [Superforms v2](https://blog.encodeart.dev/superforms-v2-supporting-all-validation-libraries) is out now - supporting all validation libraries
- [SvelteKit-Design-Pattern](https://github.com/Kreonovo/SvelteKit-Design-Pattern) is a template showcase Kreonovo's SvelteKit MVC Design patterns (more info in [the Reddit post](https://www.reddit.com/r/sveltejs/comments/18ndcd8/our_design_pattern_for_sveltekit_how_we_organize/))
- [Shadcn's Svelte VSCode extension](https://github.com/selemondev/vscode-shadcn-svelte) helps you install and use Shadcn components directly without leaving your IDE 
- [SGSG](https://github.com/mpiorowski/sgsg) is an alternative "full-stack application" template based on Svelte, Go, SQLite and gRPC
- [mistral-kit](https://github.com/kevmodrome/mistral-kit) is a prompt-to-code site using mistral-7b and ollama
- [svelte-browser-import](https://github.com/repalash/svelte-browser-import) provides functions to import and render a Svelte App/Component (.svelte files) directly inside a browser without a build step.
- [progressbar-svelte](https://www.npmjs.com/package/progressbar-svelte) is a Svelte package for customizable progress bars
- [MdCraft](https://github.com/lovelindhoni/mdcraft) is an open-source web app that serves as an in-browser Markdown editor and previewer


That's it for this month! Feel free to let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Have a great year 🥳
