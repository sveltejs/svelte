---
title: Svelte 5 Release Candidate
description: We're almost there
author: The Svelte team
authorURL: https://svelte.dev/
---

Svelte 5 is now in the Release Candidate phase. This means that the design of the framework is largely settled, with no anticipated breaking changes between now and the stable release, and that the most egregious bugs have been stomped.

It _doesn't_ mean that it's ready for production, or that nothing will change between now and 5.0. But if you've held off on dabbling with Svelte 5 during the public beta phase, now is a great time to try it out. You can select the 'Try the Svelte 5 preview' option when starting a new SvelteKit project...

```bash
npm create svelte@latest
```

...or you can add Svelte 5 to an existing project...

```bash
npm install --save-dev svelte@next
```

...or you can tinker in the [Svelte 5 Preview](https://svelte-5-preview.vercel.app) website.

## I'm out of the loop. What's Svelte 5?

For the last several months, we've been hard at work rewriting Svelte from the ground up to be faster, easier to use and more robust, applying the lessons we've collectively learned from several years of building apps with Svelte.

You can learn more about the new features from the [preview documentation](https://svelte-5-preview.vercel.app/docs), and by watching the presentation from the most recent [Svelte Summit](https://www.sveltesummit.com/):

<div class="max">
<figure style="max-width: 960px; margin: 0 auto">
<div style="aspect-ratio: 1.755; position: relative; margin: 0 auto;">
	<iframe style="position: absolute; width: 100%; height: 100%; left: 0; top: 0; margin: 0;" src="https://www.youtube-nocookie.com/embed/xCeYmdukOKI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

<figcaption>What You Can Do For Your Framework</figcaption>
</figure>
</div>

The highlights include:

- [runes](/blog/runes), the new signal-powered reactivity API that sits at the heart of Svelte 5 and unlocks _universal, fine-grained reactivity_
- overhauled event handling with less boilerplate and more flexibility
- better component composition through [_snippets_](https://svelte-5-preview.vercel.app/docs/snippets)
- native TypeScript support, including inside your markup

## Will I need to rewrite everything?

Components written for Svelte 4 will continue to work with Svelte 5, with a [handful of exceptions](https://svelte-5-preview.vercel.app/docs/breaking-changes). If you install Svelte 5 in an existing app, the only real change should be that things get faster. If you maintain a Svelte app, we recommend updating to Svelte 5 as soon as it's stable. (In the meantime, if you're currently on Svelte 3 then you should [update to Svelte 4](/docs/v4-migration-guide).)

Eventually — in Svelte 6 or 7 — support for certain Svelte 4 features will be dropped in favour of their modern replacements. Because of that, we do encourage you to incrementally migrate your components (you can mix and match old and new components in the same app). We'll release a command line tool for automating much of this migration, and you can try an experimental version of that tool in the [playground](https://svelte-5-preview.vercel.app) by pasting in some Svelte 4 code and clicking the 'migrate' button.

## When is the stable release?

[When it's done](https://github.com/sveltejs/svelte/milestone/9), and we've updated all the documentation. Bear with us!
