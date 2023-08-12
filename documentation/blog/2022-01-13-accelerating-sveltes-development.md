---
title: "Accelerating Svelte's Development"
description: 'Scaling the team, building partnerships, and growing the community'
author: Ben McCann
authorURL: https://www.benmccann.com/
---

[Svelte](/) is a frontend framework for building fast reactive web apps with less code. If you’re new here, [check out the tutorial](/tutorial) or [examples](/examples) to get a feel for it.

Svelte was [launched 5 years ago](https://news.ycombinator.com/item?id=13069841) and has [come a long way in the time since](https://www.youtube.com/watch?v=YeY5M29-WcY). In 2021, as usage more than doubled, it was voted the [most loved](https://insights.stackoverflow.com/survey/2021#section-most-loved-dreaded-and-wanted-web-frameworks) framework with the [most satisfied](https://2020.stateofjs.com/en-US/technologies/front-end-frameworks/) developers in a pair of surveys. Alongside high-profile companies like The New York Times, Apple, Spotify, Square, Rakuten, Bloomberg, Reuters, Ikea, Brave, and countless others, Svelte is used to power everything from hobby projects to embedded systems interfaces.

To help developers build fully-featured applications with Svelte without worrying about the hard parts, we’ve been developing the [SvelteKit](https://kit.svelte.dev/) application framework. We’re moving quickly towards a [stable 1.0 release](https://github.com/sveltejs/kit/issues?q=is%3Aopen+is%3Aissue+milestone%3A1.0) with the help of early adopters who have already downloaded SvelteKit almost one million times.

## Scaling the team

Rich Harris, Svelte’s creator, has [joined Vercel to work on Svelte full-time](https://vercel.com/blog/vercel-welcomes-rich-harris-creator-of-svelte). We’re incredibly excited to have Rich’s level of involvement in Svelte increase even more and have him steward Svelte into the future.

Svelte has been made possible by the work of a large, dedicated community. Svelte has added numerous core maintainers over the course of the pandemic, including three this past week. In alphabetical order:

- [benmccann](https://github.com/benmccann) - primary maintainer of SvelteKit for much of 2021
- [bluwy](https://github.com/bluwy) - major contributor across SvelteKit, vite-plugin-svelte, and Vite
- [dominikg](https://github.com/dominikg) - creator of vite-plugin-svelte
- [dummdidumm](https://github.com/dummdidumm) - maintainer of language-tools, which includes the VS Code extension and `svelte-check`
- [ehrencrona](https://github.com/ehrencrona) - contributor to SvelteKit and uses Svelte at work
- [geoffrich](https://github.com/geoffrich) - has driven efforts to improve the accessibility of the Svelte site and documentation
- [GrygrFlzr](https://github.com/GrygrFlzr) - holds a unique status as a maintainer of both SvelteKit and Vite
- [Halfnelson](https://github.com/Halfnelson) - creator of svelte-native
- [ignatiusmb](https://github.com/ignatiusmb) - regular SvelteKit contributor especially to TypeScript support
- [jasonlyu123](https://github.com/jasonlyu123) - maintainer of language-tools, which includes the VS Code extension and `svelte-check`
- [kaisermann](https://github.com/kaisermann) - creator of svelte-preprocess
- [RedHatter](https://github.com/RedHatter) - creator of Svelte Devtools
- [rixo](https://github.com/rixo) - creator of svelte-hmr

Svelte began accepting donations via [OpenCollective](https://opencollective.com/svelte) last year and has now had over $60,000 donated to-date with [Cohere](https://cohere.ai/) giving $10,000 just today. We hope that these funds will allow existing maintainers to spend more time on Svelte or that the funds could otherwise support Svelte on a part-time or contract basis, which we will continue to investigate.

## Partnerships

Multiple major cloud vendors are stepping up to make deploying SvelteKit applications anywhere a seamless experience. As a result of Rich’s new job, SvelteKit will soon run on [Vercel Edge Functions](https://vercel.com/features/edge-functions). Netlify has made [big contributions](https://github.com/sveltejs/kit/pull/2113) to the SvelteKit Netlify adapter and also [updated](https://github.com/dependents/node-precinct/pull/88) their zip-it-and-ship-it tool to better support SvelteKit. The recent [Cloudflare Pages launch](https://blog.cloudflare.com/cloudflare-pages-goes-full-stack/) featured SvelteKit as a day one partner via a [new adapter](https://github.com/sveltejs/kit/tree/master/packages/adapter-cloudflare) written by Svelte maintainers [pngwn](https://twitter.com/evilpingwin) and [lukeed](https://twitter.com/lukeed05), the latter of whom joined Cloudflare in 2021. [Begin](https://begin.com) created a [SvelteKit adapter](https://github.com/architect/sveltekit-adapter) for [Architect](https://arc.codes) apps. And community members have [contributed adapters](https://sveltesociety.dev/components#adapters) for environments such as Firebase and Deno, showcasing SvelteKit’s ability to run wherever JavaScript does.

We’ve also been working closely with the [Vite](https://vitejs.dev) team to iron out SSR issues uncovered by SvelteKit users. Vite is the build tool that makes the SvelteKit developer experience possible, and thanks to hard work from a contributor base that includes representatives of multiple frameworks, recent releases have solved almost all the issues we’ve been tracking as SvelteKit 1.0 release blockers.

## A growing community

[SvelteSociety](https://sveltesociety.dev/) just hosted the [4th Svelte Summit](https://sveltesummit.com/) — [read a summary here](https://svelte.dev/blog/whats-new-in-svelte-december-2021#what-happened-at-svelte-summit) — and Kevin Åberg Kultalahti is [going full-time to lead SvelteSociety](https://twitter.com/kevmodrome/status/1463151477174714373). In addition to hosting Svelte Summit, Kevin and SvelteSociety host and manage the [Svelte Radio podcast](https://www.svelteradio.com/), the [SvelteSociety YouTube channel](https://www.youtube.com/SvelteSociety), and the [Svelte subreddit](https://www.reddit.com/r/sveltejs). SvelteSociety has become the home of all things related to the Svelte community, with the sveltejs/community and sveltejs/integrations repos being retired in favor of [sveltesociety.dev](https://sveltesociety.dev/), which has been redesigned and rebuilt in SvelteKit. In October [Brittney Postma](https://github.com/brittneypostma), [Willow aka GHOST](https://ghostdev.xyz), [Steph Dietz](https://github.com/StephDietz), and [Gen Ashley](https://twitter.com/coderinheels) founded [Svelte Sirens](https://sveltesirens.dev/), a group for women & non-binary community members and their allies.

Hundreds of developers join the Svelte Discord every week to chat about Svelte. You may have noticed that, as of recently, some members of the server have purple names. These are people with the ambassadors role, which was created to recognise some of the community’s most valued members and help manage the demands of a rapidly growing community. Svelte ambassadors are people who are well known for their helpfulness and contributions and for upholding Svelte’s reputation as a friendly, welcoming community, and we’re deeply grateful for their involvement. The initial ambassadors in alphabetical order are:

- [babichjacob](https://github.com/babichjacob)
- [brady fractal](https://github.com/FractalHQ)
- [brittney postma](https://github.com/brittneypostma)
- [d3sandoval](https://github.com/d3sandoval)
- [geoffrich](https://github.com/geoffrich)
- [kev](https://github.com/kevmodrome)
- [puru](https://github.com/PuruVJ)
- [rainlife](https://github.com/stephane-vanraes)
- [rmunn](https://github.com/rmunn)
- [stolinski](https://github.com/stolinski)
- [swyx](https://github.com/sw-yx)
- [theo](https://github.com/theo-steiner)

We’re also testing out [GitHub discussions on SvelteKit](https://github.com/sveltejs/kit/discussions) and may bring this to other repos in the Svelte organization if feedback is positive.

## Things to watch

SvelteKit is continuing to progress towards 1.0 and, in just the past week, we have added major features like [improved client-only rendering](https://github.com/sveltejs/kit/pull/2804), [routing hooks](https://github.com/sveltejs/kit/pull/3293), and [the ability to pass data from child components to layouts](https://github.com/sveltejs/kit/pull/3252) (e.g. to support easier management of `<meta>` tags). We're currently working on a number of other high priority items such as discussing API designs for features like streaming and file uploads and contributing to the upcoming Vite 2.8 release.

While a lot of effort has been going into SvelteKit recently, we continue to progress the entire ecosystem. [Svelte 3.46.0](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md#3460) was one of our biggest releases in awhile with two major new features added: [constants in markup](https://github.com/sveltejs/rfcs/blob/master/text/0007-markup-constants.md) and [style directives](https://github.com/sveltejs/rfcs/blob/master/text/0008-style-directives.md).

Svelte and SvelteKit’s trajectories have been accelerated by the numerous investments above and there will be many more updates to come — subscribe to the [blog](/blog) via [RSS](https://svelte.dev/blog/rss.xml) or check monthly to be the first to get them.
