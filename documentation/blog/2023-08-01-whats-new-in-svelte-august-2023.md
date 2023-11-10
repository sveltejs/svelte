---
title: "What's new in Svelte: August 2023"
description: 'Extending Custom Element Classes and new +server exports'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Some sweet new features have dropped in both Svelte and SvelteKit, this month. It's also great to see how many products and side projects have launched using Svelte as their core technology!

More on all that down below...

## What's new in Svelte & Language Tools

There's been a bunch of minor bugfixes since the Svelte 4 release. You can find them in the [CHANGELOG](https://github.com/sveltejs/svelte/blob/master/packages/svelte/CHANGELOG.md).

The **4.1.0 release** added the ability to further customize the custom element class that wraps the underlying Svelte component. Check out the [Custom Elements API docs](https://svelte.dev/docs/custom-elements-api) or the [PR](https://github.com/sveltejs/svelte/pull/8991) for more info!

In addition to supporting SvelteKit's new `HEAD` server method, Svelte's language tools now support Prettier v3 (**extensions-107.9.0**) and workspace trust settings are now used to support all settings in workspace (**extensions-107.8.0**).

## What's new in SvelteKit

- The `HEAD` server method is now available in API routes (**1.22.0**, [Docs](https://kit.svelte.dev/docs/routing#server), [#9753](https://github.com/sveltejs/kit/pull/9753))
- Responses with `Vary` headers are now cached, too (except for `Vary: *`) (**1.22.0**, [Docs](https://kit.svelte.dev/docs/routing#server-content-negotiation), [#9993](https://github.com/sveltejs/kit/pull/9993))
- There's now a more helpful error for preview if SvelteKit's build output doesn't exist (**1.22.2**, [#10337](https://github.com/sveltejs/kit/pull/10337))

For all the patches and performance updates from this month, check out the [SvelteKit CHANGELOG](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md). You can also find adapter-specific CHANGELOGs in each of [the `adapter` directories](https://github.com/sveltejs/kit/tree/master/packages).

---

## Community Showcase

**Apps & Sites built with Svelte**

- [GitLight](https://github.com/ColinLienard/gitlight) brings GitHub & GitLab notifications to your desktop
- [Days](https://github.com/paprikka/days) is paprikka's life in days, inspired by Buster Benson's Life in Weeks
- [Mofi](https://mofi.loud.red/) is a content-aware fill and trim for music
- [JSON Bucket](https://github.com/Nico-Mayer/json-bucket) stores your JSON data so you can access it anywhere through generated API routes
- [Soggy Planet](https://www.cosmicplayground.org/soggy-planet) is an interactive map of Earth where sea levels rise and fall and the lights of civilization shine through the night ([Source](https://github.com/ryanatkn/cosmicplayground))
- [PaperClip](https://www.paperclipapp.xyz/) is a Chrome extension that makes it easy to memorize details from papers in machine learning, computer vision, and natural language processing.
- [Maktaba](https://www.maktaba.digital/) is a bookmark manager that "you will actually use"
- [Whispering](https://github.com/braden-w/whispering-extension) is a Chrome extension that lets you access OpenAI's Whisper API for fast transcription in the browser (including ChatGPT)
- [DocuTalk](https://docutalk.co/) is an AI Customer Support chatbot for your website
- [Krello](https://github.com/iamrishupatel/trello-clone) is a Trello clone built with Svelte, Appwrite and Flowbite
- [Been](https://beeneverywhere.net/) is a map builder with travel stats like visited countries, extreme visited points, etc.
- [image-to-social-media-thumbnail](https://brody.fyi/tools/image-to-social-media-thumbnail) lets you convert any image to a social media thumbnail
- [Svelte Capacitor Store](https://github.com/sdekna/svelte-capacitor-store) is a persistent store that uses capacitor (preferences) storage on native devices, and localStorage otherwise, making it ideal for multi-platform projects

**Learning Resources**
_Featuring Svelte Contributors and Ambassadors_

- [Exploring Svelte 4 w/ Kevin AK: Performance, Compatibility, & Web Component Support | Modern Web Pod](https://www.youtube.com/watch?v=YOL0HGGVib4) by This Dot Media
- [Svelte Sirens Stream Design Systems: Lessons Learned](https://www.youtube.com/live/YHZaiIGSqsE?feature=share) featuring Eric Liu, creator of Carbon Components Svelte and the `sveld` docgen library
- This Week in Svelte:
  - [2023 June 30](https://www.youtube.com/watch?v=sDz4_BLoYQ4) - Svelte 4.0.1, SK 1.21, lists, screen readers, loading
  - [2023 July 7](https://www.youtube.com/watch?v=0tq1ph4DDFA) - Svelte 4.0.5, Kit 1.22.1, Svelte 5, local storage and markdown
  - [2023 July 21](https://www.youtube.com/watch?v=AG4_3kon3zU) - Svelte 4.1.1, SvelteKit 1.22.3, Progressive enhancement

_To Watch/Hear_

- [What is The Transitional Web? with Chris Ferdinandi](https://www.smashingmagazine.com/2023/07/smashing-podcast-episode-63/?ref=dailydevbytes.com) by Smashing Podcast
- [SvelteKit in 100 seconds](https://www.youtube.com/watch?v=H1eEFfAkIik) by Fireship
- [Primo V2 Introduction](https://www.youtube.com/watch?v=ThInVXgxJ1Q) by Primo (a [visual CMS](https://primocms.org/) based on Svelte)
- [Understanding Svelte (vs React)](https://www.youtube.com/watch?v=lYYGhm7p74Q) by Kodaps Academy
- [Is it thàt simple? - Mastering SvelteKit](https://www.youtube.com/watch?v=6Vrc1VO8pgs) by Threeveloper
- [Markdown in SvelteKit with custom Components: mdsvex](https://www.youtube.com/watch?v=VJFkyGd0FEA) by hartenfellerdev
- [How To Add Confetti for Svelte and Sveltekit 🎉](https://www.youtube.com/watch?v=gXtWSb94704) and [Make Your SvelteKit Code 10x Faster With Rust and WebAssembly](https://www.youtube.com/watch?v=Vn2bIv_J_UE) by SvelteRust

_To Read_

- [SvelteJS: My ecosystem is bigger than yours](https://hackmd.io/@roguegpu/r1RKQMdt3) by roguegpu
- [Avoid shared state on the server in SvelteKit](https://blog.aakashgoplani.in/avoid-shared-state-on-the-server-in-sveltekit) by Aakash Goplani
- [SvelteKit Fontaine: Reduce Custom Font CLS](https://rodneylab.com/sveltekit-fontaine/) by Rodney Lab
- [A Simple Guide to Redirects in Svelte Kit](https://rgbstudios.org/blog/redirects-in-svelte-kit) by Justin Golden
- [React vs Svelte (Q3 2023)](https://gee-astro-personal.vercel.app/blog/post2) by Gee
- [SvelteKit Page Reaction Component with Upstash Redis](https://scottspence.com/posts/sveltekit-page-reaction-component-with-upstash-redis) by Scott Spence
- [Building a privacy-friendly, self-hosted application architecture with SvelteKit](https://khromov.se/building-a-privacy-friendly-self-hosted-application-architecture-with-sveltekit/) and [Building a privacy-friendly, self-hosted application architecture with SvelteKit](https://khromov.se/building-a-privacy-friendly-self-hosted-application-architecture-with-sveltekit/) by Stanislav Khromov
- [Deploying Sveltekit on IIS](https://dev.to/nnutnonn/deploying-sveltekit-on-iis--5gf6) by Nutchapon Makelai
- [Streamlined Authentication and Secrets Management](https://eman.hashnode.dev/streamlined-authentication-and-secrets-management) by Eman

**Libraries, Tools & Components**

- [Melt UI](https://github.com/melt-ui/melt-ui) is a set of headless, accessible component builders for Svelte
- [MDsveX](https://github.com/pngwn/MDsveX/releases/tag/mdsvex%400.11.0) has been updated to work with Svelte 4
- [Svelte Sonner](https://github.com/wobsoriano/svelte-sonner) is an opinionated toast component for Svelte
- [WebExtensionTemplate](https://github.com/kyle-n/WebExtensionTemplate) lets you skip the boilerplate and write a Web Extension with TypeScript and Svelte or React
- [svelte-rust](https://github.com/Hugo-Dz/svelte-rust) lets you run Rust code in your Svelte app
- [SvelteKit SSE](https://github.com/tncrazvan/sveltekit-sse) provides an easy way to produce and consume server sent events
- [better-svelte-writable](https://github.com/tnthung/better-svelte-writable) provides a type-safe writable which gives you more control over the container
- [Svetch.ts](https://github.com/Bewinxed/svetch#readme) is a client/types/schema/docs generator for your API endpoints
- [sveltekit-localize-url](https://github.com/rinart73/sveltekit-localize-url) handles URL localization and routing
- [elegua](https://github.com/howesteve/elegua) is a small, reactive PWA router for Svelte
- [Molly](https://github.com/renefournier/molly/tree/main) is a bash script and npm module that helps you clean up unused Svelte components in your project
- [sveltekit-bot](https://github.com/begoon/sveltekit-bot) is a Telegram bot made with SvelteKit and Vercel

Thanks for reading! As always, feel free to let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋
