---
title: "What's new in Svelte: May 2022"
description: "Dynamically switch between HTML element types with `<svelte:element>`"
author: Daniel Sandoval
authorURL: https://desandoval.net
---

With yesterday's Svelte Summit behind us, we've got a lot of news to share! Check out all of the recordings on the [Svelte Society YouTube Channel](https://www.youtube.com/sveltesociety) and the rest of this month's updates below...

## What's new in Svelte
- The `<svelte:element>` element lets you render an element of a dynamically specified type. This is useful, for example, when rendering rich text content from a CMS. Check out the [docs](https://svelte.dev/docs#template-syntax-svelte-element) or the [tutorial](https://svelte.dev/tutorial/svelte-element) for more info (**3.47.0**)!


## Language Tools updates
- `svelte:element` and `sveltekit:reload` are now supported
- Invalid Svelte import paths will now be automatically detected - see PR for getting back the old behavior ([#1448](https://github.com/sveltejs/language-tools/pull/1448))
- `source.sortImports` lets you sort imports without deleting unused imports ([#1338](https://github.com/sveltejs/language-tools/issues/1338))
- Hovering over HTML attributes will now show HTML hover info instead of the TS hover info - resulting in much more useful information ([#1447](https://github.com/sveltejs/language-tools/pull/1447))
- In VS Code, you can now wrap existing blocks of code in control flow tags using the `Insert Snippet` command ([#1373](https://github.com/sveltejs/language-tools/pull/1373))

## What's new in SvelteKit
- Files and directories can now be named `__tests__` and `__test__` in the routes directory ([#4438](https://github.com/sveltejs/kit/pull/4438))
- Netlify Edge Functions ([#4657](https://github.com/sveltejs/kit/pull/4657)) and the Vercel build output API ([#4663](https://github.com/sveltejs/kit/pull/4663)) are now supported
- Custom `load` dependencies, array of strings representing URLs the page depends on, are now available when loading routes ([Docs](https://kit.svelte.dev/docs/loading#output-dependencies), [#4536](https://github.com/sveltejs/kit/pull/4536))


**Breaking Changes**
- Validators are now called "matchers" ([Docs](https://kit.svelte.dev/docs/routing#advanced-routing-matching), [#4358](https://github.com/sveltejs/kit/pull/4358))
- `__layout.reset` has been replaced by named layouts - which have much configurability for shared layout elements ([Docs](https://kit.svelte.dev/docs/layouts#named-layouts), [#4388](https://github.com/sveltejs/kit/pull/4388))
- Prerendering is now skipped for `rel="external"` links ([#4545](https://github.com/sveltejs/kit/pull/4545))
- `maxage` is now `cache` in `LoadOutput` ([#4690](https://github.com/sveltejs/kit/pull/4690))


---

## Community Showcase

**Apps & Sites built with Svelte**
- [polySpectra AR](https://ar.polyspectra.com/) lets you prototype faster 3D Printing with seamless AR file handoffs ([video demo](https://www.youtube.com/watch?v=VhYCeVGcG3E))
- [Pixel Art Together](https://github.com/liveblocks/pixel-art-together) is a free multiplayer pixel art editor powered by Liveblocks
- [Tooling Manager](https://tooling-manager.netlify.app/) lets you compare your JavaScript tech stack against industry standard boilerplates
- [Easy Portfolio](https://easy-portfolio.com/) generates a portfolio based on your GitHub profile
- [FLOAT](https://github.com/muttoni/float) is an attendance tracking program for events
- [The Coin Perspective](https://thecoinperspective.com/) is a cryptocurrency price tracker and portfolio management tool
- [Locutionis](https://github.com/pbouillon/locutionis) is a small, online reference of figures of speech (en français)
- [ASM Editor](https://asm-editor.specy.app/) is an all in one web editor for M68K and MIPS
- [Otium](https://github.com/alombi/otium) is a free and open source book manager and bookshelf organiser, that helps you managing your books and the ones you would like to read
- [Sinwaver](https://github.com/Hugo-Dz/Sinwaver) is an SVG sine wave generator

Want to contribute to a modern SvelteKit website? [Help build the Svelte Society site](https://github.com/svelte-society/sveltesociety.dev/issues)!


**Learning Resources**

_To Read_
- [4 tips for cleaner Svelte components](https://geoffrich.net/posts/clean-component-tips/) by Geoff Rich
- [Building a Clubhouse clone with Svelte and 100ms](https://www.100ms.live/blog/clubhouse-clone-with-svelte) By Seun Taiwo
- [SvelteKit uvu Testing: Fast Component Unit Tests](https://rodneylab.com/sveltekit-uvu-testing/) by Rodney Lab
- [SvelteKit JWT authentication tutorial](https://dev.to/pilcrowonpaper/sveltekit-jwt-authentication-tutorial-2m34) by pilcrowOnPaper
- [Converting a Rollup-based Svelte SPA to SvelteKit](https://github.com/sveltejs/kit/discussions/4595) by Simon H
- [Add Commitint, Commitizen, Standard Version, and Husky to SvelteKit Project](https://davipon.hashnode.dev/add-commitint-commitizen-standard-version-and-husky-to-sveltekit-project) by David Peng

_To Watch or Hear_
- [Rich Harris - The Road to SvelteKit 1.0 (Svelte Society NYC)](https://www.youtube.com/watch?v=s6a1pbTVcUs) by Svelte Society
- [Svelte Fundamentals - Intro to Svelte](https://codingcat.dev/course/intro-to-svelte) by Coding Cat
- [Svelte Components Using Custom Markdown Renderers - Weekly Svelte](https://www.youtube.com/watch?v=ZiEROAqobwM) by LevelUpTuts
- [Implementing {@const} in if block](https://www.youtube.com/watch?v=f5iReGqjmG0) by lihautan
- [Svelte and Contributing to Open-Source with Geoff Rich](https://podcast.20minjs.com/1952066/10417700-episode-6-svelte-and-contributing-to-open-source-with-geoff-rich) by 20minJS


**Libraries, Tools & Components**
- [KitDocs](https://github.com/svelteness/kit-docs) is a documentation integration for SvelteKit - like VitePress for Svelte.
- [Svelte Copy](https://github.com/ghostdevv/svelte-copy) is a click/tap-to-copy library that makes it easy to copy to the clipboard
- [Svend3r](https://github.com/oslabs-beta/svend3r) provides beautiful visualizations that harness the power of D3 to bring your data to life while abstracting away its imperative-style code
- [Svelte Hamburgers](https://github.com/ghostdevv/svelte-hamburgers) is the easy to use Hamburger menu component for Svelte
- [Svelte Droplet](https://github.com/probablykasper/svelte-droplet) is a file dropzone for Svelte
- [Svelte MP3](https://www.npmjs.com/package/svelte-mp3) is a light blazingly fast yet simple minimalistic audio player for Svelte 
- [SvelteUI](https://github.com/Brisklemonade/svelteui) is a component library for building fully functional & accessible web applications faster than ever 
- [svelte-spotlight](https://github.com/beynar/svelte-spotlight) is a headless spotlight component to help you build your site's global search box in minutes
- [svelte-pdf-simple](https://github.com/gspasov/svelte-pdf-simple) is a simple svelte library for displaying PDFs and giving you all the control
- [persistent-svelte-store](https://github.com/omer-g/persistent-svelte-store) is a generic persistent writable store, built from scratch in TypeScript according to the Svelte store contract
- [svelte-exmarkdown](https://github.com/ssssota/svelte-exmarkdown) is Svelte component to render markdown dynamically
- [Bookit](https://github.com/leveluptuts/bookit) is a storybook-like component rendering environment - finely tuned to work directly within your SvelteKit projects

Join us on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.com/invite/yy75DKs) to continue the conversation.

If you'd prefer to join us in person, Svelte Summit is finally transitioning properly into the real world. Come join us for two days of awesome Svelte content! [Get your tickets now!](https://ti.to/svelte/svelte-summit-fall-edition)

See y'all next month!
