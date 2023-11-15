---
title: "What's new in Svelte: November 2023"
description: 'Svelte Summit on Nov 11 and better DevEx for all!'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Mark your calendars! [Svelte Summit Fall](https://www.sveltesummit.com/2023/fall) is on November 11th. Join us on [YouTube](https://www.youtube.com/@SvelteSociety/streams) and in the [Discord](https://svelte.dev/chat) for hours of Svelte-focused fun 🎥

Every month, maintainers within the Svelte ecosystem fix bugs, improve performance and bring new features to Svelte, SvelteKit and the tooling around them. This month's releases brings an improved developer experience with better [block folding](https://code.visualstudio.com/docs/editor/codebasics#_folding), inferred types and configuration for `use:enhance`.

Let's take a closer look 👀...

## What's new in Svelte & Language Tools

- Svelte 4.2.2 cleans up a few element-specific features ([Release Notes](https://github.com/sveltejs/svelte/blob/master/packages/svelte/CHANGELOG.md#422))
- Extensions 107.12.0 improves block folding for functions, if statements and more ([Release Notes](https://github.com/sveltejs/language-tools/releases/tag/extensions-107.12.0), [PR](https://github.com/sveltejs/language-tools/pull/2169))

## What's new in SvelteKit

- Route parameter types will now be inferred from the applicable matcher's guard check (**kit@1.26.0**, [Docs](https://kit.svelte.dev/docs/advanced-routing#matching), [#10755](https://github.com/sveltejs/kit/pull/10755))
- The new `invalidateAll` boolean option lets you turn on and off the `invalidateAll()` form function within the `enhance` callback (**kit@1.27.0**, [Docs](https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance), [#9476](https://github.com/sveltejs/kit/issues/9476))
- The output of the project creation wizard will now reflect which package manager you're using (**create-svelte@5.1.1**, [#10811](https://github.com/sveltejs/kit/pull/10811))

For a complete list of bug fixes and performance updates, check out the [SvelteKit CHANGELOG](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md). You can also find adapter-specific CHANGELOGs in each of [the `adapter` directories](https://github.com/sveltejs/kit/tree/master/packages).

---

## Community Showcase

**Apps & Sites built with Svelte**

- [4THSEX](https://4thsex.com/) is a creative website for the producer / creative director with the same name
- [Syntax.fm](https://github.com/syntaxfm/website) has been redesigned from the ground up with SvelteKit
- [GitContext](https://gitcontext.com/) is an early-access tool to improve the process of reviewing code
- [Lunier](https://www.lunier.fr/) is a site to browse and buy handbags (site is in French)
- [Feldman Architecture](https://feldmanarchitecture.com/) is a portfolio set for the architects of the same name
- [Formulator](https://formulator.app/) is a faster way to iterate, experiment, & build user interfaces
- [Dwarf](https://www.dwarf.domains/) is a relaxed domain name marketplace for domain hoarders
- [Teek](https://teek.vercel.app/) is a simple, free time tracker for developers with an hourly rate
- [Sessionic](https://github.com/navorite/sessionic) is a web extension to easily save browser sessions and manage them
- [Pilink](https://pil.ink/) is a "suckless" link shortener

**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_

- [Wolfensvelte 3D and the Svelte Language Server in the Browser with Jason Bradnick](https://www.svelteradio.com/episodes/wolfensvelte-3d-and-the-svelte-language-server-in-the-browser-with-jason-bradnick) by Svelte Radio
- [This Is How You Sveltify Any JavaScript Library](https://www.youtube.com/watch?v=RuM4KHTZqD4), [Svelte Actions Make Svelte The Best JavaScript Framework](https://www.youtube.com/watch?v=LGOqg0Y7sAc) and [How Svelte Stores Make State Management Easy](https://www.youtube.com/watch?v=L3uBfL-4dDM) by Joy of Code
- Svelte Society Talks
  - [Svelte Society - San Diego October 2023](https://www.youtube.com/watch?v=9FZYJTr24ZI)
  - [Daniils Petrovs - SvelteKit: From landing page to offline PWAs](https://www.youtube.com/watch?v=SaccqQ-JrZ4)
  - [Lukas Stracke - State of Sentry for Svelte 2023](https://www.youtube.com/watch?v=V4Hup134wdA)
- This Week in Svelte:
  - [2023 September 29](https://www.youtube.com/watch?v=SduFW1onshg) - Svelte 4.2.1, SvelteKit 1.25.1, Runes FAQ, data mocking
  - [2023 October 6](https://www.youtube.com/watch?v=CMXST0R6xRY) - Ordering attribs, client hints, async custom store with runes
  - [2023 October 13](https://www.youtube.com/watch?v=Tp6ctouCX7A) - SvelteKit 1.25.2, How Melt UI works
  - [2023 October 20](https://www.youtube.com/watch?v=O13bGtOV-aA) - Kit 1.26.0, Svelte 4.2.2, dynamically-loaded components

_To Watch_

- [SvelteKit & TailwindCSS Tutorial – Build & Deploy a Web Portfolio](https://www.youtube.com/watch?v=-2UjwQzxvBQ) by freeCodeCamp.org
- [Why SvelteKit? [Intro to SvelteKit 1.0, part 1]](https://www.youtube.com/watch?v=FP4AylVsiT8) by Jeffrey Codes Javascript
- [Build an AI Chatbot - it's that easy?!](https://www.youtube.com/watch?v=FcDj9_590Xg) by Simon Prammer
- [Introduction to SvelteKit | FREE 5 HOUR SVELTE WORKSHOP 2023 | Lessons + Coding Exercises](https://www.youtube.com/watch?v=wWRhX_Hzyf8) by This Dot Media

_To Read_

- [What we learned from migrating our web app to SvelteKit](https://blog.datawrapper.de/migrating-our-web-app-to-sveltekit/) by Marten Sigwart
- [SvelteKit Tutorial: Build a Website From Scratch](https://prismic.io/blog/svelte-sveltekit-tutorial) by Prismic has been updated based on the latest SvelteKit features
- [Svelte by Example](https://sveltebyexample.com/) is a succinct, gentle introduction to Svelte & SvelteKit
- [The Comprehensive Guide to Locals in SvelteKit](https://khromov.se/the-comprehensive-guide-to-locals-in-sveltekit/) by Stanislav Khromov
- [How to build a blog, the hard way](https://cpf.sh/blog/2023/10/27/how-to-build-a-blog-the-hard-way) by Curtis Parfitt-Ford
- [How to make a full-content RSS feed for your SvelteKit blog](https://www.kylenazario.com/blog/full-content-rss-feed-with-sveltekit) by Kyle Nazario
- [A simple hash-routed dialog system with Svelte](https://inorganik.net/posts/2023-10-08-routed-svelte-dialogs) by Jamie Perkins
- [When and Where to Render](https://blog.robino.dev/posts/rendering-strategies) and [One Less Reason to Build a Native App](https://blog.robino.dev/posts/install-web-app) by Ross Robino
- [Open Neovim From Your Browser - Integrating nvim with Svelte’s Inspector](https://theosteiner.de/open-neovim-from-your-browser-integrating-nvim-with-sveltes-inspector) by Theo Steiner

**Libraries, Tools & Components**

- Work to [support SvelteKit in Deno](https://github.com/denoland/deno/issues/17248) is ongoing and [Deno now supports](https://github.com/denoland/deno/pull/21026) creating SvelteKit projects out-of-the-box!
- [Purplix](https://github.com/WardPearce/Purplix.io) is an open-source collection of tools dedicated to user privacy and creating trust with your audience
- [Obra Icons](https://github.com/Obra-Studio/obra-icons-svelte-public) is a simple, consistent set of icons, perfect for user interfaces
- [svelte-chat-langchain](https://github.com/SimonPrammer/svelte-chat-langchain) is a minimal version of "Chat LangChain" implemented with SvelteKit, Vercel AI SDK and of course Langchain
- [Cloudinary just released](https://svelte.cloudinary.dev/) an official Svelte SDK ([GitHub](https://github.com/cloudinary-community/svelte-cloudinary))

That's it for this month! Feel free to let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋
