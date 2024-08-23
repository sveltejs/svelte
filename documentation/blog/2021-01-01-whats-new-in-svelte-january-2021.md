---
title: "What's new in Svelte: January 2021"
description: A Svelte-packed showcase to kick-off the new year!
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Happy new year from Svelte! In the last month we made progress on Sapper's upcoming release, fine-tuned our `SvelteComponent` typings, and have seen some amazing apps, sites, and libraries coming out in the showcase.

## What's changed in Svelte?

A new minor release replaces the `SvelteComponent` class with a `SvelteComponentTyped` class. This renaming should help with backwards compatibility. We've updated [last month's blog post](https://svelte.dev/blog/whats-new-in-svelte-december-2020) to avoid any confusion with the name change.

If you're using `SvelteComponent` or the new `SvelteComponentTyped` in your project or library, let us know what you're using it for and we'll add it to the showcase!

## What's going on in Sapper?

More quality of life features are landing in the upcoming release every day. `0.29.0` will include new TypeScript definitions, fixes to scroll tracking and prefetching behavior, and improvements to the runtime router to support encoded query parameters.

If you're upgrading from 0.28.x, check out [the migration guide](https://sapper.svelte.dev/migrating/#0_28_to_0_29) for steps on updating to Sapper 0.29.

## Is SvelteKit ready yet?

To avoid too much churn during development, SvelteKit is still being worked on in a private repo. There will be an announcement on the Discord, blog and Twitter when it's ready for a larger group of users and contributors.

In the meantime, you can explore the current build by running `npm init svelte@next` from your command line.

As cautioned in _[What's the deal with SvelteKit?](https://svelte.dev/blog/whats-the-deal-with-sveltekit)_, there are no docs or support available yet... So use at your own risk / for your own enjoyment!

---

## Community Showcase

**Apps & Sites**

- [manitu.me](https://manitu.me/) is a background sound / pomodoro timer for focus and relaxation
- [Answer Socrates](https://answersocrates.com/) helps you find trending questions on the internet so that you can write the most relevant blog post, tweet, or billboard
- [multris](https://multris.s1h.org/) is a multiplayer Tetris game. You can read about its development [here](https://blog.s1h.org/svelte-multiplayer-game/)
- [weather-ab](https://github.com/ganochenkodg/weather-ab) compares the archive of weather in different cities of the world. Indispensable for people thinking about migration
- [Game Nibs](https://gamenibs.com/) is a platform for gamers to find and share concise bite-sized bits of gaming advice, tips, tricks, screenshots, builds, and much more
- [Ora](https://github.com/cupcakearmy/ora) is an open source website tracking and limiting tool for Chrome and Firefox
- [vscode-dms](https://github.com/techsyndicate/vscode-dms) is a group direct messaging chat app for VS Code
- [Zero.2](https://zero.oleksandrdemian.tech/) is a math-based challenge game where you try to get to zero as quickly as possible
- [Octave Compass](https://octavecompass.com/2741) is a chord table and scale explorer for many popular musical scales
- [Infinite Walking Bass Generator 2](https://github.com/elialbert/infinitewalkingbass2) is an online music player that generates a unique walking bass line
- [ListenAddict](https://www.listenaddict.com/) is a site that notifies you whenever a person has a new talk/interview on podcast

**Demos, Libraries & Components**

- [svelte-tiny-virtual-list](https://github.com/Skayo/svelte-tiny-virtual-list) speeds up long lists by only rendering visible items
- [svelte-query](https://github.com/TanStack/svelte-query) is a collection of helpful hooks for managing, caching and syncing asynchronous and remote data
- [svelte-previous](https://github.com/bryanmylee/svelte-previous) is a svelte store to remember previous values - helpful for transitions or a quick undo stack
- [Let's Build a Confetti Cannon](https://varun.ca/confetti/) explains how to build a particle system and integrate a Canvas based animation into a larger application
- [svelte-micro](https://github.com/ayndqy/svelte-micro) is a one-component router
- [svelte-standalone-router](https://github.com/hjalmar/svelte-standalone-router) is a standalone router with an API based on [standalone-router](https://github.com/hjalmar/standalone-router)
- [svelte-datepicker](https://github.com/beyonk-adventures/svelte-datepicker) is a datepicker component with variations for time selection, date ranges and responsive themes
- [svelte-slimscroll](https://github.com/MelihAltintas/svelte-slimscroll) is a action for Svelte.js, which can transforms any div into a scrollable area with a nice scrollbar.
- [Svelte Zoomable](https://svelte.dev/repl/58dfe87756ee4db897c281b52fdef7b7?version=3.31.0) is a custom transition with a nice zoom effect

**Have a component you'd like to share?** Check out the [Components](https://sveltesociety.dev/components) page on the Svelte Society site. You can contribute by making [a PR to this file](https://github.com/svelte-society/sveltesociety.dev/blob/master/src/pages/components/components.json).

**Learning Resources**

- [Using Svelte to create a scroll video effect](https://blog.koenvangilst.nl/tutorial-svelte-scroll-video/) showcases how the `bind` command can be used to create a cool scroll video effect with very little code
- [How to make a flappybird game in svelte and typescript](https://www.youtube.com/watch?v=nhrYBoVI8pQ) is a video tutorial including docs and code for reference
- [Accessible Svelte Transition](https://www.youtube.com/watch?v=QK_QuRL7nSo&feature=youtu.be) walks through `prefers-reduced-motion` to make svelte transitions more accessible
- [Svelte's module scripts explained](https://codechips.me/svelte-module-scripts-explained/) is a great introduction to the module context, a common Sapper pattern
- [Awesome Svelte](https://github.com/TheComputerM/awesome-svelte#readme) is a curated list of Svelte resources
- [.NET Core and Svelte](https://dev.to/cainux/net-core-and-svelte-f8o) explains how to get Svelte up and running with .NET Core
- [A la découverte de Svelte JS](https://www.youtube.com/watch?v=SLpx1Y8e1ek&list=PLff5I1miao9ZEUhpqkrOx7k8RGAZt-nm9) is a svelte tutorial series in French!
- [Svelte for React Developers](https://soshace.com/svelte-for-react-developers/) explains Svelte's core concepts to folks who are used to React
- [Building a Svelte Static Website with Smooth Page Transitions](https://www.youtube.com/watch?v=dvPfmcGtmrI&feature=emb_title) shows how to build a static website with Svelte and add smooth page transitions using Three.js and GSAP.
- [Using Apollo Client in Sapper](https://bjornlu.com/blog/using-apollo-client-in-sapper/) explains the "simplest" solutions to integrate the Apollo query client into Sapper
- [Reactive web apps with Crystal + Svelte](https://www.youtube.com/watch?v=i1xjLd6z7BU) explores how to build full-stack, server-rendered Svelte apps with a [Crystal](https://crystal-lang.org) backend

**Related Projects**

- [Snowpack's v3 release candidate](https://www.snowpack.dev/posts/2020-12-03-snowpack-3-release-candidate) is out now in preparation for a January 6 release date. Check out the [Getting Started with Svelte](https://www.snowpack.dev/tutorials/svelte) for more info on how to use Snowpack.
- [Uppy](https://uppy.io/blog/2020/12/1.24/), the open source file uploader, announced Svelte support in its new version 1.24

## See you next month!

Want to add your work to the Showcase? Want to contribute to Svelte? Check out the [Svelte Society](https://sveltesociety.dev/), [Reddit](https://www.reddit.com/r/sveltejs/) and [Discord](https://discord.com/invite/yy75DKs) to get involved!
