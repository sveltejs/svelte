---
title: Frequently asked questions
---

## Background and motivations

### What is this?

You're on the Svelte 5 preview site! If you don't know what Svelte is but somehow ended up here
anyway, we suggest visiting [svelte.dev](https://svelte.dev) first to get familiar.

### What's special about Svelte 5?

Svelte 5 is a ground-up rewrite of the framework, designed to make your apps faster, smaller, and more robust.

It introduces <em>runes</em>, a powerful set of primitives for controlling reactivity inside your Svelte components and — for the first time — inside `.svelte.js` and `.svelte.ts` modules. You can learn about runes by reading the [Introducing runes](https://svelte.dev/blog/runes) blog post and watching the accompanying video, and by reading the preliminary [docs](/docs) on this site.

### Doesn't this make Svelte harder to learn?

Au contraire! Svelte today involves certain mental gymnastics:

- `let x` declares reactive state, but only at the top level of a component
- `export let x` declares a prop, but only inside a component. `export const y = ...`, meanwhile, means something totally different
- In addition to `export let`, you have to learn `$$props` and `$$restProps`
- `$:` might be declaring a reactive binding, or running side-effects; like `let x`, it only works at the top level of a component. When these statements re-run is dependent on rules that are hard to understand
- In general, code behaves differently inside and outside components, making refactoring difficult and requiring frequent context-switching

Runes, by contrast, are explicit, predictable and refactorable.

### Why can't we keep the old syntax?

Beyond the complexities listed above, the current design imposes some unfortunate limitations:

- There's no way to indicate which variables should _not_ be considered reactive. This becomes problematic when applying Svelte rules outside the top level of a component (for example in `.js` files)
- The `$:` syntax doesn't play well with TypeScript. For example, you can't declare the type of `theme` in a statement like this — it's a syntax error:
  ```ts
  // @errors: 2362 2363 2304 1005
  // @filename: ambient.d.ts
  declare global {
  const dark: boolean;
  }
  export {};
  // @filename: index.ts
  // ---cut---
  $: theme: 'light' | 'dark' = dark ? 'dark' : 'light';
  ```
  But with runes, it works just fine:
  ```ts
  // @filename: ambient.d.ts
  declare global {
  	const dark: boolean;
  }
  export {};
  // @filename: index.ts
  // ---cut---
  let theme: 'light' | 'dark' = $derived(
  	dark ? 'dark' : 'light'
  );
  ```
- Updating values inside `$:` statements can cause [confusing behaviour](https://github.com/sveltejs/svelte/issues/6732) and [impossible to resolve bugs](https://github.com/sveltejs/svelte/issues/4933) and the statements may run in an [unexpected order](https://github.com/sveltejs/svelte/issues/4516)
- `$: {...}` doesn't let you return a cleanup function the way that [`$effect`](runes#$effect) does
- Typing props is unduly cumbersome when you want to share interfaces between multiple components
- Prefixing store names with `$` to access their values works in a `.svelte` file, but cannot work in `.js` and `.ts` without causing linting and typechecking errors. Having a unified approach to reactive state solves this problem

## Breaking changes and migration

### Is it a breaking change?

We're striving to make Svelte 5 a drop-in replacement for Svelte 4, and to that end we've ported over the entire test suite. The new features are opt-in, and you can mix-and-match the new stuff with the old stuff within an app (though not within a component — in 'runes mode', certain features are deliberately disabled).

Having said that, the underlying mechanisms are totally different. It's inevitable that some of you will hit edge cases, which is why this is a major version (5.0) rather than a minor (4.x).

### No but really, am I going to have to rewrite everything?

Eventually, you'll have to make some changes — most of which we hope to automate. We don't want to end up in a situation where people feel like they have to juggle knowledge of a bunch of different ways of doing things.

Our current plan is that some or all of the features that runes make unnecessary like `let`-style reactivity, `$:`, `$$props` and `$$restProps` will be deprecated in Svelte 6 and removed in Svelte 7. But don't worry — that won't happen for some time, and we'll provide automatic migration tooling to do as much of the change as possible. There are no plans to deprecate `onMount` or stores at the current time.

### Which things are disabled in runes mode?

When you opt into runes mode, you can no longer use the features that runes replace:

- `$state` replaces top-level `let` declarations implicitly creating reactive state
- `$derived` replaces `$: x = ...`
- `$effect` replaces `$: {'{ ... }'}`
- `$props` replaces `export let`, `$$props` and `$$restProps`

All other features, including stores, are still fully supported in runes mode.

### Which things will be deprecated in Svelte 5?

`beforeUpdate` and `afterUpdate` are deprecated — use `$effect.pre` and `$effect` instead, as these are more conservative about when they run code. Everything else will remain.

## Schedule and future plans

### When is it coming out?

When it's done. The goal is sometime in early 2024.

### Should I prepare my code for Svelte 5?

No. You can do the migration towards runes incrementally when Svelte 5 comes out.

### When can I `npm install` the Svelte 5 preview?

Right now!

```bash
npm install svelte@next
```

You can also opt into Svelte 5 when creating a new SvelteKit project:

```bash
npm create svelte@latest
```

### What's left to do?

A great many things. Transitions, for example, are not fully implemented. We also haven't fully solved all aspects of things like server-side rendering. We're getting there!

### Will feature X be part of 5.0?

If you have to ask, then probably not. Aside from runes, 5.0 is mostly about taking everything we've learned over the last few years (including from other frameworks — thanks friends!) and making Svelte the leanest and most powerful framework out there.

We know that some of you are very keen on certain feature ideas, and we are too. We have some big ideas for 5.1 and beyond.

## Discussion, contributing, and help

### I want to help. How do I contribute?

We appreciate your enthusiasm! We welcome issues on the [sveltejs/svelte](https://github.com/sveltejs/svelte) repo. Pull requests are a little dicier right now since many things are in flux, so we recommended starting with an issue.

### How can I share feedback or cool examples of what this enables?

You can use the `#svelte-5-alpha` channel on the [Discord server](https://svelte.dev/chat) or the tag `#svelte-5-alpha` on social media.

### My question wasn't answered. What gives?

It must not have been asked frequently enough. To fix that, stop by the `#svelte-5-alpha` channel of the [Discord server](https://svelte.dev/chat).
