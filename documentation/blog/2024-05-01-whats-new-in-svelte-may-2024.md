---
title: "What's new in Svelte: May 2024"
description: 'Svelte 5 Release Candidate and all the other highlights from Svelte Summit Spring'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Svelte Summit was last week - featuring a number of fantastic talks from across the community. In the final talk, What You Can Do For Your Framework, Rich Harris (with a little help from PuruVJ's neoconfetti library) [announced that Svelte 5 is now in the "Release Candidate"](https://www.youtube.com/live/gkJ09joGBZ4?si=O5HR0PF-TDvNdVNf&t=8898).

Lots of pre-release changes to cover in this post and a host of community showcase items... so let's dive in!

## Highlights from Svelte Summit Spring 2024

Below, you'll find links to all the talks in the livestream version of Svelte Summit.

- [Simple and Sustainable web development in academic libraries with Svelte](https://www.youtube.com/live/gkJ09joGBZ4?si=ha0iruRIXv2Mql1w&t=894)
- [Building a SaaS module for SvelteKit](https://www.youtube.com/live/gkJ09joGBZ4?si=bqRe0Fbykm9sUqZS&t=1517)
- [Intro To LayerChart](https://www.youtube.com/live/gkJ09joGBZ4?si=o3rn0WqGBBQckF_2&t=2680)
- [Spatial Programming with Threlte Studio](https://www.youtube.com/live/gkJ09joGBZ4?si=dBL-EfWTLtu4fYSt&t=4026)
- [Convex (Sponsored talk)](https://www.youtube.com/live/gkJ09joGBZ4?si=5KKpLYXi0fLQqwZZ&t=4891)
- [Kitbook: Easily Build, Document, Inspect & Test Svelte Components](https://www.youtube.com/live/gkJ09joGBZ4?si=NMhjp5rBWgf3lV76&t=5903)
- [Fullstack Testing](https://www.youtube.com/live/gkJ09joGBZ4?si=8p5CRD9z-LADsMtO&t=6749)
- [What You Can Do For Your Framework](https://www.youtube.com/live/gkJ09joGBZ4?si=h4LKM12I_vJBBLZ-&t=8515) - also covers a ton of the new features listed below

These will all get broken up into more sharable (and rewatchable) videos over time, so make sure you subscribe to the [Svelte Society YouTube channel](https://www.youtube.com/@SvelteSociety/featured) to keep up to date.

## What's new in Svelte

[Svelte 5 is officially in the Release Candidate stage](https://svelte-5-preview.vercel.app/docs/introduction) and gets closer to release every day. Below, you'll find some highlights from its pre-release [changelog](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md):

- Hot module reloading is now supported in Svelte 5 (**5.0.0-next.97 and 101**, [#11106](https://github.com/sveltejs/svelte/pull/11106), [#11132](https://github.com/sveltejs/svelte/pull/11132))
- It is now possible to define global (or child global) styles in a block (**5.0.0-next.111**, [#11276](https://github.com/sveltejs/svelte/pull/11276))
- Compiled code is even more efficient for `if` blocks, `each` blocks and attribute updates (**5.0.0-next.83-85**, [#10906](https://github.com/sveltejs/svelte/pull/10906), [#10937](https://github.com/sveltejs/svelte/pull/10937) and [#10917](https://github.com/sveltejs/svelte/pull/10917))
- The built-ins from `svelte/reactivity` are now re-exported to be available on the server (**5.0.0-next.88**, [Docs](https://svelte-5-preview.vercel.app/docs/imports#svelte-reactivity), [#10973](https://github.com/sveltejs/svelte/pull/10973))
- A new reactive URL object is now available in `svelte/reactivity` (**5.0.0-next.103**, [Docs](https://svelte-5-preview.vercel.app/docs/imports#svelte-reactivity), [#11157](https://github.com/sveltejs/svelte/pull/11157))
- HTML tags are now faster with more efficient hydration markers (**5.0.0-next.90-91**, [#10986](https://github.com/sveltejs/svelte/pull/10986) and [#11019](https://github.com/sveltejs/svelte/pull/11019))
- The new `$host` rune retrieves the `this` reference of the custom element that contains a component - removing the need for `createEventDispatcher` (**5.0.0-next.96**, [Docs](https://svelte-5-preview.vercel.app/docs/runes#host), [#11059](https://github.com/sveltejs/svelte/pull/11059))


---

## Community Showcase

**Apps & Sites built with Svelte**

- [Collabwriting](https://www.reddit.com/r/sveltejs/comments/1c6zylc/weve_just_raised_12m_launched_new_product_2year/) just raised $1.2M and launched a new product - [Collabwriting for Teams](https://www.producthunt.com/posts/collabwriting-for-teams). Congrats!
- [Skypix](https://github.com/GhostWalker562/css475-music-library) is a music library that allows users to create playlists, add songs to their library, and share their music with friends
- [Jonze](https://github.com/Pelps12/jonze) is an open-source but managed tool for managing member information. It features attendance tracking and membership plans
- [midi-note-trainer](https://github.com/TeemuKoivisto/midi-note-trainer) is a music notation trainer app built with Web MIDI
- [Easy-Rd](https://easyrd.dev/) is a free tool for coding-based ER diagram creation
- [Gamera](https://gamera.app/) is a simple site analytics tool for a privacy-first world
- [Collecta](https://collecta.space/) lets you collect your internet in a single space - organize images, bookmarks, inspiration, and share your vibe with friends
- [ColdCraft](https://coldcraft.ai/) writes for you by turning bullet points and LinkedIn profiles into effective cold emails
- [Fourplay](https://github.com/kilroyjones/fourplay) is a multiplayer word game written with Rust and Svelte 
- [how-long-is-a-click](https://www.how-long-is-a-click.com/) is a site that measures how long *exactly* a click is on the web


**Learning Resources**

_Featuring Svelte Contributors and Ambassadors_
- [Preprocessors Are The Most Powerful Svelte Feature No One Talks About](https://www.youtube.com/watch?v=FNIwqQx7mOo), [How To Make A Custom Markdoc Renderer](https://www.youtube.com/watch?v=mWt7jsgZIWw) and [Responsive CSS Grid Layout In One Line Of Code](https://www.youtube.com/watch?v=b9N1qLTVhvs) by JoyOfCode
- [Phoenix LiveView and Svelte with Wout De Puysseleir](https://www.svelteradio.com/episodes/phoenix-liveview-and-svelte-with-wout-de-puysseleir) by Svelte Radio
- Svelte London - April 2024:
  - [Auth in SvelteKit, the hard & easy ways](https://www.youtube.com/live/IJh7w6DtOIs?si=Y7f0U3y8FUGtdU_X&t=191) by Ajit Krishna
  - [3 stories of walking in the fire with my SvelteKit project](https://www.youtube.com/live/IJh7w6DtOIs?si=uOoqnEa1MWUZsHJp&t=1993) by Rowan Aldean
- This Week in Svelte:
  - [29 Mar](https://www.youtube.com/watch?v=OqwVuE2I5lM) - Superforms
  - [5 Apr](https://www.youtube.com/watch?v=MmiBRw8aoXI) - When to go serverless?
  - [12 Apr](https://www.youtube.com/watch?v=WQFjaM1-Hm0) - svelte-api-keys with Captain Codeman
  - [19 Apr](https://www.youtube.com/watch?v=r_snb9XDX6Q) - Multiple Action Forms
  - [26 Apr](https://www.youtube.com/watch?v=TbZpK-LtCME) - Service Workers


_To Read_

- [LiveView is best with Svelte](https://blog.sequin.io/liveview-is-best-with-svelte/) by Anthony Accomazzo
- [Optimizing My SvelteKit Blog](https://www.refact0r.dev/blog/optimizing-sveltekit) by refac0r
- [Why Lucia might be the best authentication library for SvelteKit](https://omrecipes.dev/blog/lucia-best-auth-library-sveltekit) by Justin Ahinon
- [Deploying a Svelte App with Docker and Node.js: A Developer's Guide](https://www.klevertopee.com/post?id=d85fccb0-ed24-4175-8165-b601e661a37d) by Klevert Opee
- [SvelteKit Todo App with Firebase Admin](https://code.build/p/sveltekit-todo-app-with-firebase-admin-tqdc5j) by Jonathan Gamble
- [Dependency injection in Svelte for fun and profit](https://kylenazario.com/blog/dependency-injection-in-svelte) by Kyle Nazario
- [Don't Lazy-Load Translations](https://inlang.com/g/mqlyfa7l/guide-lorissigrist-dontlazyload) by Loris Sigrist
- [View Transitions in SvelteKit](https://thnee.se/sveltekit-view-transitions) by Mattias Tomas Bobo Lindvall
- [Why is Svelte better?](https://www.zackwebster.com/blogs/why-is-svelte-better) by Zack Webster
- [Mocking SvelteKit Stores in Storybook](https://tylergaw.com/blog/mocking-sveltekit-stores-in-storybook/) by Tyler Gaw
- [Deploy SvelteKit to AWS Amplify: A Step-by-Step Guide](https://www.launchfa.st/blog/deploy-sveltekit-aws-amplify) by Rishi Raj Jain
- [SvelteKit and Stripe demo](https://www.thespatula.io/projects/sveltekit-stripe-demo/demo/) by the spatula
- [SvelteKit Turso Fly.io App Guide](https://scottspence.com/posts/sveltekit-turso-flyio-app-guide) by Scott Spence


_To Watch_

- [Build a Animated Website with SvelteKit, GSAP & Prismic](https://www.youtube.com/watch?v=v5Ncz5AcXjI) by Prismic
- [Svelte 5: What's New](https://www.youtube.com/watch?v=kvFqpaTP0a0) by Simon Holthausen
- [Build the Ultimate Learning Platform with SvelteKit, PocketBase & TailwindCSS!](https://www.youtube.com/watch?v=b2ftRSX1iZ0&t=47s) and [Lets Build A Filtering System with Svelte 5 , Sveltekit 2, Tailwind, Upstash](https://www.youtube.com/watch?v=5urk4ui_l5o) by Lawal Adebola
- [Porting a vanilla JavaScript library to Svelte 5](https://www.youtube.com/watch?v=apIJlWJ3HgQ) by Stanislav Khromov


**Libraries, Tools & Components**

- [sk-seo](https://github.com/TheDahoom/Sveltekit-seo/) is a dead simple, no dependencies, svelte component that automates a lot of the annoying SEO parts for you
- [Svelte Lib Helpers](https://github.com/shinokada/svelte-lib-helpers) is a utility package designed to streamline various tasks when developing Svelte libraries
- [skitsa](https://github.com/michaelcuneo/sveltekit-sst-auth) is a simple yet fully fledged operational demonstration of SvelteKit Magic Links using SST, hosted on AWS, as a Lambda application
- [svelte-zoomable-circles](https://www.npmjs.com/package/svelte-zoomable-circles) is a Svelte component for displaying and browsing hierarchical data using zoomable circles


That's it for this month! Feel free to let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next month 👋
