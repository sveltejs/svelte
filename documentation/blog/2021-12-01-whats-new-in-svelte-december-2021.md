---
title: "What's new in Svelte: December 2021"
description: 'Svelte Summit Fall 2021 Recap, Rich Harris joins Vercel, and Kevin goes full-time on Svelte Society'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

With SvelteKit getting more and more stable each day, there's not much to cover in terms of code changes other than bug fixes... So, in this month's newsletter, we'll be covering Svelte Summit Fall 2021!

If you want to dive deep into the last month's worth of bug fixes, check out the [Svelte](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md) and [SvelteKit](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md) changelogs, respectively.

## What happened at Svelte Summit?

If you missed Svelte Summit, you can watch the entire live stream on [YouTube](https://www.youtube.com/watch?v=1Df-9EKvZr0) and catch a recap in the [#svelte-summit channel on Discord](https://discord.gg/YmHcdnhu).

Here are the highlights:

- [Rich Harris](https://twitter.com/rich_harris) took us through a tour of Svelte's history and announced [his move to Vercel](https://vercel.com/blog/vercel-welcomes-rich-harris-creator-of-svelte) - where he will be helping maintain Svelte full-time! ([20:00](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=1200s))
- [Steph Dietz](https://twitter.com/steph_dietz_) explained how Svelte's simple abstractions makes it easy for beginners and experts alike to learn and use JavaScript - without the boilerplate ([29:00](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=1740s))
- [Kevin Bridges](https://twitter.com/kevinast) dove deep into Svelte's reactivity logic by visualizing it through `ReflectiveCounter` and showing how to "fine tune" it, as needed. A full "syllabus" for the presentation is available on [Kevin's site](https://wiibridges.com/presentations/ResponsiveSvelte/). ([42:55](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=2575s))
- [Mateo Morris](https://twitter.com/_mateomorris) launched [Primo](https://primo.af/), an all-in-one SvelteKit CMS to help build and manage static sites ([1:12:34](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=4354s))
- [Guillermo Rauch](https://vercel.com/about/rauchg) explained Vercel's commitment to Svelte, what it means to have Rich on the team, and what's coming next from the company... ([1:21:54](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=4914s))
- [Geoff Rich](https://twitter.com/geoffrich_) introduced various ways to modify motion and transitions within Svelte to be more accessible to all users of the web. Slides and a full transcription of the talk are available on [Geoff's site](https://geoffrich.net/posts/svelte-summit-2021/). ([1:32:30](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=5550s))
- [Dean Fogarty](https://df.id.au/) demoed a number of different use-cases for custom stores - transforming data to and from storage mechanisms within Svelte. Transcript and code is available on [Dean's GitHub](https://github.com/angrytongan/svelte-summit-2021). ([1:43:06](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=6186s))
- [Kellen Mace](https://twitter.com/kellenmace) shared how we can let content creators keep using WordPress, while leveraging Svelte on the frontend to provide a phenomenal user experience ([1:49:30](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=6570ss))
- [Ben Holmes](https://twitter.com/bholmesdev) explained the "islands" architecture and how 11ty + [Slinkity](https://slinkity.dev/) can bring these islands to any HTML template ([2:17:15](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=8235s))
- [Scott Tolinski](https://twitter.com/stolinski) shared the lessons learned from rewriting the React-based LevelUpTutorials in Svelte and "found developer bliss" ([3:16:35](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=11795s))
- [Svelte Sirens](https://sveltesirens.dev) was announced as the new Svelte community for women, non-binary and allies. Their first event was on November 29th - all future events can be found on [the Svelte Sirens website](https://sveltesirens.dev/events) ([3:50:45](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=13845s))
- [Rich Harris](https://twitter.com/rich_harris) discussed creating libraries with SvelteKit, better ways to link packages when developing, and how SvelteKit helps with modern JavaScript library development ([3:56:00](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=14160s))
- [Ken Kunz](https://twitter.com/kennethkunz) explained how finite state machines (and the svelte-fsm library) can make managing Svelte component states more... manageable. Examples from the talk are available on [Ken's GitHub](https://github.com/kenkunz/svelte-fsm/wiki/Examples). ([4:07:18](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=14838s))
- [Austin Crim](https://twitter.com/crim_codes) connected learning to code on the web to learning how to play an instrument. By giving learners early wins and introducing the fundamentals through real-world apps, learning Svelte (and the fundamentals underneath) doesn't have to be a chore ([4:21:50](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=15710s))
- [Jesse Skinner](https://twitter.com/JesseSkinner) brought our legacy apps into the future by explaining how to use (and reuse) Svelte components within React (and even jQuery!) projects ([4:32:30](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=16350s))
- [Jim Fisk](https://twitter.com/jimafisk) and [Stephanie Luz](https://stephanie-luz.medium.com/) introduced [Plenti](https://plenti.co/) and its theming tools to make building new Svelte sites much faster ([4:59:00](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=17940s))
- [Evyatar Alush](https://twitter.com/evyataral) helped us all make (and maintain) better forms using a powerful validation library called [Vest](https://github.com/ealush/vest) ([5:08:55](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=18535s))
- Dominik G. presented a fresh take on icon libraries - one that reduces the bundle size of applications and opens up the entire iconify library for use in any Svelte app ([5:30:04](https://www.youtube.com/watch?v=1Df-9EKvZr0&t=19804s))

Thanks to [Kevin](https://twitter.com/kevmodrome) and all the Svelte Society volunteers for pulling together such an amazing event! Excitingly, [Kevin announced](https://twitter.com/kevmodrome/status/1463151477174714373) after the event that he will now be working full-time on Svelte Society! You can check out all the talks, broken up into individual videos for convenience, in [this Svelte Society YouTube Playlist](https://www.youtube.com/playlist?list=PL8bMgX1kyZTg2bI9IOMgfBc8lrU3v2itt).

If you have feedback on the Svelte Summit, Kev is [looking for feedback on the Svelte subreddit](https://www.reddit.com/r/sveltejs/comments/qzgo3k/svelte_summit_feedback/) 👀

---

## Community Showcase

**Apps & Sites**

- [pixeldrain](https://github.com/Fornaxian/pixeldrain_web) is a free-to-use file sharing platform
- [LifeHash](http://lifehash.info/) generates beautiful visual hashes from Blockchain Commons
- [simple-cloud-music](https://github.com/dufu1991/simple-cloud-music) is a lightweight third-party NetEase cloud music player for modern browsers (likely only works on Chrome)
- [palette.rocks](https://palette.rocks/) is a color palette generator with contrast-checking built-in
- [Kadium](https://github.com/probablykasper/kadium) is an app for staying on top of YouTube channel uploads
- [Multi-Monitor Calculator](https://multimonitorcalculator.com/) is a tool for planning your multi-monitor setup
- [Your Home](https://yourhome.fb.com/) is an interactive overview of Facebook's privacy settings
- [Svelte Crush](https://svelte-crush.netlify.app/) is a Candy Crush style match-3 game
- [100.000 Corona deaths in Germany](https://twitter.com/h_i_g_s_c_h/status/1463767113563353089?s=20) is a visualization made for Spiegel Gesundheit

**Looking for a Svelte project to work on? Interested in helping make Svelte's presence on the web better?** Check out [the list of open issues](https://github.com/svelte-society/sveltesociety-2021/issues) if you'd like to contribute to the Svelte Society rewrite in SvelteKit.

**Videos, Blogs and Podcasts**

- [How To Make and Publish a Svelte Library](https://www.youtube.com/watch?v=_TymiadmPrc)
- [SvelteKit is now fully supported in WebContainers](https://blog.stackblitz.com/posts/sveltekit-supported-in-webcontainers/)
- [Introducing Svelte, and Comparing Svelte with React and Vue](https://joshcollinsworth.com/blog/introducing-svelte-comparing-with-react-vue)
- [Testing a Svelte app with Jest](https://www.roboleary.net/2021/11/18/svelte-app-testing-jest.html)
- [How to create a toast notification library package with SvelteKit](https://www.sarcevic.dev/blog/toasting-in-svelte)
- [Svelte training: Here you can learn Svelte](https://sustainablewww.org/principles/svelte-training-here-you-can-learn-svelte)
- [Introduction to Svelte Actions](https://blog.logrocket.com/svelte-actions-introduction/)
- [Enjoy making DAPPs using SvelteWeb3](https://chiuzon.medium.com/enjoy-making-dapps-using-svelteweb3-b78dfea1d902)
- [Svelte creator: Web development should be more fun](https://www.infoworld.com/article/3639521/svelte-creator-web-development-should-be-more-fun.html)
- [Svelte Radio: Rich Harris is now working full-time on Svelte 🤯](https://share.transistor.fm/s/d9b04961)
- [Web Rush: Svelte and Elder.js with Nick Reese](https://webrush.io/episodes/episode-158-svelte-and-elderjs-with-nick-reese)
- [Building SvelteKit applications with Serverless Redis](https://blog.upstash.com/svelte-with-serverless-redis)

**Libraries, Tools & Components**

- [svelte-cubed](https://github.com/Rich-Harris/svelte-cubed) is a Three.js component library for Svelte - created by Rich Harris for his presentation at Svelte Summit Fall 2021
- [svelte-fsm](https://github.com/kenkunz/svelte-fsm) is a tiny, simple, expressive, pragmatic Finite State Machine (FSM) library, optimized for Svelte
- [bromb](https://github.com/samuelstroschein/bromb) is a feedback widget for websites/web apps that is small and easy to integration/self-host
- [Spaper](https://github.com/Oli8/spaper) is a set of PaperCSS components for Svelte
- [svelte-intl-precompile](https://github.com/cibernox/svelte-intl-precompile) is an i18n library for Svelte that analyzes and compiles your translations at build time
- [svelte-preprocess-svg](https://github.com/svitejs/svelte-preprocess-svg) automatically optimizes inline svg in Svelte components for better performance and reduced file size
- [svelte-subcomponent-preprocessor](https://github.com/srmullen/svelte-subcomponent-preprocessor) allows you to write more than one component within a svelte file
- [svelte-pdfjs](https://github.com/gtm-nayan/svelte-pdfjs) is a crude implementation of a Svelte PDF viewer component
- [svelte-inview](https://github.com/maciekgrzybek/svelte-inview) is a Svelte action that monitors an element enters or leaves the viewport/parent element
- [sveltekit-adapter-wordpress-shortcode](https://github.com/tomatrow/sveltekit-adapter-wordpress-shortcode) is an adapter for SvelteKit which turns your app into a wordpress shortcode
- [svelte-websocket-store](https://github.com/arlac77/svelte-websocket-store) is a Svelte store with a websocket backend
- [Svelte Auto Form](https://github.com/leveluptuts/auto-form) is a fast and fun form library focused on ease of use, rather than flexibility.
- [set-focus](https://www.npmjs.com/package/@svackages/set-focus) is an Svelte action that will set focus on `<a>` or `<button>` elements as soon as they mount - useful for some experiences and testing

Got an idea for SvelteKit? Check out the new [GitHub Discussions](https://github.com/sveltejs/kit/discussions) in the Svelte repo. You can also join us on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.com/invite/yy75DKs).

See you next ~~month~~ year!
