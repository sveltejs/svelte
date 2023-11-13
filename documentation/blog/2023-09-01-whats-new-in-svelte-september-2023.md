---
title: "What's new in Svelte: September 2023"
description: "New parameters in SvelteKit's redirect and an onNavigate lifecycle function come to life"
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Happy September y'all! With all the [sneak peeks at what's coming soon in Svelte 5](https://twitter.com/Rich_Harris/status/1688581184018583558), we thought it'd be best to look back at the last month to see what's shipped and what the community is building with Svelte.

Before we jump in, a warm welcome to the new Svelte Ambassadors: [@cainux](https://github.com/cainux) and [@grischaerbe](https://github.com/grischaerbe)! Welcome to the crew ⛴️

## What's new in Svelte & Language Tools

- `svelteHTML` has moved from language-tools into Svelte core so that `svelte/element` types will now load correctly (**4.2.0** in Svelte, **107.10.0** in Language Tools)

## What's new in SvelteKit

- `URL` is now accepted in the `redirect` function (**1.23.0**, [Docs](https://kit.svelte.dev/docs/modules#sveltejs-kit-redirect), [#10570](https://github.com/sveltejs/kit/pull/10570))
- Mistyped route filenames will now throw a warning (**1.23.0**, [#10558](https://github.com/sveltejs/kit/pull/10558))
- The new `onNavigate` lifecycle function enables view transitions - Check out the [blog post](https://svelte.dev/blog/view-transitions) for more info (**1.24.0**, [Docs](https://kit.svelte.dev/docs/modules#app-navigation-onnavigate), [#9605](https://github.com/sveltejs/kit/pull/9605))

But that's just the new features! For all the patches and performance updates from this month, check out the [SvelteKit CHANGELOG](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md). You can also find adapter-specific CHANGELOGs in each of [the `adapter` directories](https://github.com/sveltejs/kit/tree/master/packages).

---

## Community Showcase

**Apps & Sites built with Svelte**

- [Planet Of The Bugs](https://planetofthebugs.xyz/) allows developers to practice and hone their skill-sets by exposing them to an endless supply of unique, curated issues and bugs from popular open-source projects on Github
- [Minesweeper](https://github.com/ProductionPanic/minesweeper/tree/main) is an Android game built with SvelteKit, Capacitor, TailwindCSS and DaisyUI (check it out on the [Google Play Store](https://play.google.com/store/apps/details?id=com.production.panic.minesweeper&pli=1))
- [Pendor](https://www.pendor.ai/) is an AI component generator for Svelte
- [Avatars Pro](https://senja.io/testimonial-widgets/avatars-pro) is a social proof widget made for the web
- [Pomodoro Focus](https://github.com/con-dog/pomodoro-focus) is a pomodoro timer browser extension
- [memegen](https://github.com/bhupeshpr25/memegen) is a Firefox web extension that allows users to generate memes using various templates
- [Resgen](https://resgen.app/) is a Chrome extension that tailors resumes based on job descriptions and your experiences
- [Icono Search](https://www.icono-search.com) is an AI-powered video search engine
- [digital-paper](https://github.com/danferns/digital-paper) is a writing app with no backspace or undo
- [Ubuntu 22.04 in Svelte](https://github.com/manhhungpc/ubuntu2204-svelte) aims to replicate the Ubuntu 22.04 desktop experience on the web
- [My Queue](https://www.myqueue.so/) creates a playlist of written articles by turning them into audio stories

**Learning Resources**
_Featuring Svelte Contributors and Ambassadors_

- [Svelte Society - London August 2023](https://www.youtube.com/watch?v=90Psdk5rAnU)
- [Building a Blog using SvelteKit and Nostr as a CMS (Part 1](https://kevinak.se/blog/building-a-blog-using-sveltekit-and-nostr-as-a-cms-part-1-1690807337563)) by Kev
- [Mastering SvelteKit with Geoff Rich | JS Drops](https://www.youtube.com/watch?v=MaF8kRbHbi0) by This Dot Media
- [Using GitHub Contributions To Flex On The Normies](https://youtu.be/f9fd1L1FEts?si=3hbihW-X5-GKSJxN), [Learn Svelte By Making A Matching Game](https://www.youtube.com/watch?v=w2q9caYXgkg) and [Who Needs API Permission When You Can Use Web Scraping](https://www.youtube.com/watch?v=T-lBPpeokfY) by Joy of Code
- [The missing guide to understanding adapter-static in SvelteKit](https://khromov.se/the-missing-guide-to-understanding-adapter-static-in-sveltekit/) by Stanislav Khromov
- This Week in Svelte:
  - [2023 July 28](https://www.youtube.com/watch?v=mvTEQ_C0qRQ) - Screen reader market share, Svelte to plain JS, Web Components
  - [2023 Aug 4](https://www.youtube.com/watch?v=Ye8cCJyPZjg) - Svelte 4.1.2, SvelteKit 1.22.4, ES Modules, Types in markup
  - [2023 August 11](https://www.youtube.com/watch?v=A8XUaiCVkCI) - Svelte 4.2.0, SvelteKit 1.22.5, How to create Toggle Switches
  - [2023 August 18](https://www.youtube.com/watch?v=nJ5Wf3uL7dM) - SvelteKit 1.22.6, accessible form error summaries
  - [2023 August 25](https://www.youtube.com/watch?v=JoPzvlBKXXE) - SvelteKit 1.23.0, Bun and SvelteKit, Enhanced search
- Svienna (Svelte Society Vienna) Sessions
  - [Ermin Celikovic - You might not need a slider library](https://www.youtube.com/watch?v=dSUmtijkFOc)
  - [Lukas Stracke - How to use sentry.io in your SvelteKit App](https://www.youtube.com/watch?v=u41-MtPGH04)
  - [Jean-Yves Couet - SvelteKit & Remult... fullstack apps in minutes!](https://www.youtube.com/watch?v=N8d290fTzq8)
- Sirens Sessions
  - [Prismic Slice Machines & SvelteKit](https://www.youtube.com/watch?v=19Meb-yMsAg) with Sam Littlefair
  - [Medusa and SvelteKit E-Commerce Stack](https://www.youtube.com/watch?v=rVVHxows9dY) with Lacey Pevey
  - [Design Systems: Lessons Learned](https://www.youtube.com/watch?v=YHZaiIGSqsE) with Eric Liu

_To Watch_

- [Image optimization in SvelteKit with vite-imagetools](https://www.youtube.com/watch?v=285vSLe9LQ8) by hartenfellerdev
- [Building a Todo App with Rust and SvelteKit: Complete Tutorial](https://www.youtube.com/watch?v=w7is2bCTUg0) and [Stripe Payment In SvelteKit With Dynamic Pricing](https://www.youtube.com/watch?v=o8gvCLgz1vs) by SvelteRust
- [Leaflet maps in SvelteKit like it's 2023 (HowTo)](https://www.youtube.com/watch?v=JFctWXEzFZw)
  ShipBit

_To Read_

- [Internationalization in SvelteKit (Series)](https://blog.aakashgoplani.in/series/i18n-in-sveltekit) by Aakash Goplani
- [The easiest Chatbot you will ever build](https://simon-prammer.vercel.app/blog/post/sveltekit-langchain) and [Intro to LangSmith🦜️🛠️](https://simon-prammer.vercel.app/blog/post/langsmith) by Simon Prammer
- [SvelteKit: How to make code-based router, instead of file-based router [August 2023]](https://dev.to/maxcore/sveltekit-how-to-make-code-based-router-instead-of-file-based-router-august-2023-5f9) by Max Core
- [SvelteKit Hydration Gotcha](https://www.captaincodeman.com/sveltekit-hydration-gotcha) by Captain Codeman
- [Automatically generate sitemap.xml in SvelteKit](https://alex-schnabl.medium.com/automatically-generate-sitemap-xml-in-sveltekit-910bd09d17e7) by Alex Schnabl
- [Discovering Svelte: Things I Learned While Using Svelte](https://www.tronic247.com/discovering-svelte-things-i-learned-while-using-svelte/) by Posandu Mapa
- [Typed fetch with Sveltekit and Hono using RPC](https://dev.to/subhendupsingh/typed-fetch-with-sveltekit-and-hono-using-rpc-2clf) by Subhendu Pratap Singh
- [Svelte Context Module Scripts Explained](https://raqueebuddinaziz.com/blog/svelte-context-module-scripts-explained) by raqueebuddin aziz
- [Building with GPT4 and Svelte](https://kvak.io/meoweler) by levmiseri
- [Type-safe User Authentication in SvelteKit with Lucia, Planetscale, and Upstash Redis](https://upstash.com/blog/lucia-sveltekit) by Chris Jayden
- [Document Svelte Projects with HTML and JSDoc Comments](https://blog.robino.dev/posts/doc-comments-svelte) by Ross Robino

**Libraries, Tools & Components**

- [Carta](https://github.com/BearToCode/carta-md) is a lightweight, fast and extensible Svelte Markdown editor and viewer, based on Marked
- [Threlte](https://threlte.xyz/), the 3D framework built from Svelte and Three.js has released version 6
- [vite-plugin-web-extension](https://vite-plugin-web-extension.aklinker1.io/guide/frontend-frameworks.html#svelte-integration) works great with Svelte to make building browser extensions easier
- [Salvia-kit Svelte Dashboards](https://github.com/salvia-kit/svelte-dashboards) contains 10 free dashboard templates for SvelteKit
- [drab](https://github.com/rossrobino/drab) is an Unstyled Svelte component library
- [svelte-img-previewer](https://www.npmjs.com/package/svelte-img-previewer?activeTab=readme) is a tool for displaying images from input file types in Svelte
- [sveltekit-search-params](https://github.com/paoloricciuti/sveltekit-search-params) describes itself as the fastest way to read AND write from query search params in SvelteKit

That's it for this month! Feel free to let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋
