---
title: "What's new in Svelte: March 2021"
description: Call for Svelte Summit Speakers! Improved SSR, non-HTML5 compilation targets, and ESLint TypeScript support
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Lots to cover this month with releases from across the Svelte ecosystem. Most importantly, Svelte Summit Spring 2021 has an [Open Call for Speakers](https://sessionize.com/svelte-summit-spring-2021). **The deadline is March 14** so if you have an idea for a talk, submit it now!

Let's dive into the news 🐬

## What's new in `sveltejs/svelte`

- SSR store handling has been reworked to subscribe and unsubscribe as in DOM mode. SSR stores should work much more consistently now (**3.31.2**, see [custom stores](https://svelte.dev/examples/custom-stores) and [Server-side component API ](https://svelte.dev/docs#run-time-server-side-component-api))
- Multiple instances of the same action are now allowed on an element (**3.32.0**, [example](https://svelte.dev/repl/01a14375951749dab9579cb6860eccde?version=3.32.0))
- The new `foreign` namespace should make it easier for alternative compile targets (like Svelte Native and SvelteGUI) by disabling certain HTML5-specific behaviour and checks (**3.32.0**, [more info](https://github.com/sveltejs/svelte/pull/5652))
- Support for inline comment sourcemaps in code from preprocessors (**3.32.0**)
- Destructured defaults are now allowed to refer to other variables (**3.33.0**, [example](https://svelte.dev/repl/0ee7227e1b45465b9b47d7a5ae2d1252?version=3.33.0))
- Custom elements will now call `onMount` functions when connecting and clean up when disconnecting (**3.33.0**, checkout [this PR](https://github.com/sveltejs/svelte/pull/4522) for an interesting conversation on how folks are using Svelte with Web Components)
- A `cssHash` option has been added to the compiler options to control the classname used for CSS scoping (**3.34.0**, [docs](https://svelte.dev/docs#compile-time-svelte-compile))
- Continued improvement to TypeScript definitions

For a complete list of changes, including bug fixes and links to PRs, check out [the CHANGELOG](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md)

## New from `sveltejs/language-tools`

- For language server clients that don't support `didChangeWatchedFiles`, a fallback file watcher will be used instead
- New highlighting rules for store accessors and element directives (like `bind:` and `class:`)
- HTML tags can now be renamed together
- Mustache tags parsing is now more robust and will provide better intellisense in more situations

Haven't tried the language-tools yet? Check out [Svelte Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) or find a plugin for your favorite IDE!

## Other changes from `sveltejs/*`

- [eslint-plugin-svelte3](https://github.com/sveltejs/eslint-plugin-svelte3) now supports TypeScript as of 3.1.0
- [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte/) released a number of minor versions to address whitespace and comment trimming issues.
- [svelte-preprocess](https://github.com/sveltejs/svelte-preprocess/) bug fixes this month include fixes to postcss transformations and support for both v2 and v3 of `postcss-load-config`
- [sapper](https://github.com/sveltejs/sapper/)'s 0.29.1 release fixes some bad imports in type definitions, updates typings to be compatible with express/polka, and restores hashing of all CSS file names.

---

## Community Showcase

**Apps & Sites**

- [Tracking the Coronavirus](https://www.nytimes.com/interactive/2021/us/new-york-city-new-york-covid-cases.html) from NYTimes is an example of SvelteKit in production
- [Budibase](https://github.com/Budibase/budibase) is an open-source low-code platform, helping developers and IT professionals build, automate, and ship internal tools 50x faster on their own infrastructure.
- [Track the Parcel](https://tracktheparcel.com/) is a one-stop tool for tracking parcel status with all major package shippers.
- [Memo](https://sendmemo.app/features/) is a replacement for email that uses Svelte for modern messaging
- [Userscripts Safari](https://github.com/quoid/userscripts) is an open-source userscript editor for Safari... a native Svelte app for Mac OS!
- [SVGX](https://svgx.app/) is "the desktop SVG asset manager designers and developers wished they had."
- [Armoria](https://azgaar.github.io/Armoria/) is a procedural heraldry generator and editor
- [FictionBoard](https://www.fictionboard.com) is a virtual table top (VTT) platform that just released fillable and responsive character sheets
- [Castles & Crusades Treasure Generator](https://treasure.playaheadgames.com/) is a treasure generator for the table top RPG: Castles and Crusades.
- [NESBit Studio](https://jensa.org/NESBitStudio-web/graphics/spritesheets) is a toolkit to help the development of homebrew NES games
- [ElectroBlocks](https://electroblocks.org/) is an online Arduino IDE with a built-in simulator (Chrome Only)
- [Goblin.life](https://store.steampowered.com/app/552180/GoblinLife/) is a 3D world builder whose UI is built with Svelte
- [farmbox](https://farmbox.ae/) is a UAE-based grocery delivery services
- [heroeswearmasks.fun](https://heroeswearmasks.fun/) is a client-side machine learning tool that determines whether or not you're wearing a mask.
- [weatherify](https://brdtheo-weatherify.netlify.app/) is a very pretty (and [open source](https://github.com/brdtheo/weatherify)) weather app
- [DSN Live](https://dsn-live.netlify.app/#/) lets you monitor connections between NASA/JPL and interplanetary spacecraft missions in real time.

**Demos, Libraries, Tools & Components**

- [spc](https://github.com/khang-nd/spc) is a special characters picker component for the web
- [svelte-injector](https://www.npmjs.com/package/svelte-injector) lets you inject Svelte components in React, Angular, Vue, jQuery, Vanilla JS.
- [Felte](https://felte.dev/) is a form library for Svelte with simple validation reporting.
- [svelte-use-form](https://github.com/noahsalvi/svelte-use-form#readme) is form library that "is easy to use and has 0 boilerplate."
- [Formula](https://formula.svelte.codes/) provides "Zero Configuration Reactive Forms for Svelte."
- [Houdini](https://github.com/AlecAivazis/houdini) is "the disappearing GraphQL client built for Sapper and Sveltekit."
- [svelte-split-pane](https://www.reddit.com/r/sveltejs/comments/leoe33/sveltesplitpane/) is a draggable split pane component
- [svelte-virtualized-auto-sizer](https://github.com/micha-lmxt/svelte-virtualized-auto-sizer) is a high-order component that automatically adjusts the width and height of a single child.
- [svelte-window](https://github.com/micha-lmxt/svelte-window) are components for efficiently rendering large, scrollable lists and tabular data.
- [Svelte Persistent store](https://github.com/MacFJA/svelte-persistent-store) is a Svelte store that keep its value through pages and reloads
- [Svelte Dark](https://marketplace.visualstudio.com/items?itemName=NickScialli.svelte-dark) is a VS Code theme inspired by the svelte.dev REPL
- [Import Cost](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost) has been updated to support Svelte libraries and help developers keep their bundle size under control.
- [Tree-sitter-svelte](https://github.com/Himujjal/tree-sitter-svelte) provides tree-sitter grammar for svelte
- [Svelte Ripple](https://svelte.dev/repl/b73224a0fd4248178e3eab41943d41a9?version=3.31.2) is a Material Design ripple effect that doesn't depend on `@material/ripple` (made by @karakara in the Svelte Discord)
- [Analog SVG Clock](https://svelte.dev/repl/270e83f43e7a48918d8f2d497760904f?version=3.32.1) is a great example of easing functions (made by @tonmcg in the Svelte Discord)
- [Console Log Styler](https://svelte.dev/repl/11f609d0d90746f08da6d3d90bba84fc?version=3.32.0) lets you generate a styled console log using pseudo HTML and CSS (made by @EmNudge in the Svelte Discord)
- [svelte-heroicons](https://github.com/martinse/svelte-heroicons) is a handy wrapper for the Heroicons icon library
- [supabase-ui-svelte](https://github.com/joshnuss/supabase-ui-svelte) are UI components for Supabase authentication

**Have your own Svelte Component to share?** Check out the [Components](https://sveltesociety.dev/components) page on the Svelte Society site. You can contribute by making [a PR to this file](https://github.com/svelte-society/sveltesociety.dev/blob/master/src/pages/components/components.json).

**Learning Resources & Starters**

- [The **unofficial** SvelteKit docs](https://sk-incognito.vercel.app/learn/what-is-sveltekit) were built using SvelteKit and are [open for contributions](https://github.com/GrygrFlzr/kit-docs)
- [📦 Svelte Store](https://www.youtube.com/playlist?list=PLoKaNN3BjQX3fG-XOSwsPHtnV8FUY6lgK) course by lihautan covers the basics of Svelte Stores and best practices.
- [Svelte Events](https://www.youtube.com/watch?v=cbxxbBofjAw&feature=youtu.be) by WebJeda explains how directives like `on:` can be used to listen to DOM events.
- [How to Set Up Protected Routes in Your Svelte Application](https://www.webtips.dev/how-to-set-up-protected-routes-in-your-svelte-application) describes how to authenticate your users to access your routes
- [Using Fauna's streaming feature to build a chat with Svelte](https://dev.to/fauna/using-fauna-s-streaming-feature-to-build-a-chat-with-svelte-1gkd) demonstrates how to setup and configure Fauna to build a real-time chat interface with Svelte
- [Using TakeShape with Sapper](https://www.takeshape.io/articles/using-takeshape-with-sapper/) demonstrates how to connect the TakeShape CMS with Sapper
- [YastPack](https://github.com/rodabt/yastpack) is Yet Another Snowpack-Svelte-TailwindCss-Routify Template Pack
- [S2T2](https://ralphbliu.medium.com/s2t2-snowpack-svelte-tailwindcss-typescript-8928caa5af6c) is a Snowpack + Svelte + TailwindCSS + TypeScript template
- [tonyketcham/sapper-tailwind2-template](https://github.com/tonyketcham/sapper-tailwind2-template) is a Sapper Template w/ Tailwind 2.0, TypeScript, ESLint, and Prettier

## See you next month!

Got something to add? Join us on [Svelte Society](https://sveltesociety.dev/), [Reddit](https://www.reddit.com/r/sveltejs/) and [Discord](https://discord.com/invite/yy75DKs)!
