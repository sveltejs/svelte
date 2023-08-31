---
title: Unlocking view transitions in SvelteKit 1.24
description: Streamlined page transitions with onNavigate
author: Geoff Rich
authorURL: https://geoffrich.net
---

The [view transitions API](https://developer.chrome.com/docs/web-platform/view-transitions/) has been sweeping the web development world lately, and for good reason. It streamlines the process of animating between two page states, which is especially useful for page transitions.

However, until now, you couldn’t easily use this API in a SvelteKit app, since it was difficult to slot into the right place in the navigation lifecycle. SvelteKit 1.24 brought a new [`onNavigate`](https://kit.svelte.dev/docs/modules#$app-navigation-onnavigate) lifecycle hook to make view transitions integration much easier – let’s dive in.

## How view transitions work

You can trigger a view transition by calling `document.startViewTransition` and passing a callback that updates the DOM somehow. For our purposes today, SvelteKit will update the DOM as the user navigates. Once the callback finishes, the browser will transition to the new page state — by default, it does a crossfade between the old and the new states.

```js
// @errors: 2339
const domUpdate = async () => {};
// ---cut---
document.startViewTransition(async () => {
	await domUpdate(); // mock function for demonstration purposes
});
```

Behind the scenes, the browser does something really clever. When the transition starts, it captures the current state of the page and takes a screenshot. It then holds that screenshot in place while the DOM is updating. Once the DOM has finished updating, it captures the new state, and animates between the two states.

While it’s only implemented in Chrome (and other Chromium-based browsers) for now, [WebKit is also in favor](https://github.com/WebKit/standards-positions/issues/48#issuecomment-1679760489) of it. Even if you’re on an unsupported browser, it’s a perfect candidate for progressive enhancement since we can always fall back to a non-animated navigation.

It’s important to note that view transitions is a browser API, not a SvelteKit one. `onNavigate` is the only SvelteKit-specific API we’ll use today. Everything else can be used wherever you write for the web! For more on the view transitions API, I highly recommend the [Chrome explainer](https://developer.chrome.com/docs/web-platform/view-transitions/) by Jake Archibald.

## How `onNavigate` works

Before learning how to write view transitions, let's highlight the function that makes it all possible: [`onNavigate`](https://kit.svelte.dev/docs/modules#$app-navigation-onnavigate).

Until recently, SvelteKit had two navigation lifecycle functions: [`beforeNavigate`](https://kit.svelte.dev/docs/modules#$app-navigation-beforenavigate), which fires before a navigation starts, and [`afterNavigate`](https://kit.svelte.dev/docs/modules#$app-navigation-afternavigate), which fires after the page has been updated following a navigation. SvelteKit 1.24 introduces a third: `onNavigate`, which will fire on every navigation, immediately before the new page is rendered. Importantly, it will run _after_ any data loading for the page has completed – since starting a view transition prevents any interaction with the page, we want to start it as late as possible.

You can also return a promise from `onNavigate`, which will suspend the navigation until it resolves. This will let us wait to complete the navigation until the view transition has started.

```js
// @errors: 2304 7006
function delayNavigation() {
	return new Promise((res) => setTimeout(res, 100));
}

onNavigate(async (navigation) => {
	// do some work immediately before the navigation completes

	// optionally return a promise to delay navigation until it resolves
	return delayNavigation();
});
```

With that out of the way, let's see how you can use view transitions in your SvelteKit app.

## Getting started with view transitions

The best way to see view transitions in action is to try it yourself. You can spin up the SvelteKit demo app by running `npm create svelte@latest` in your local terminal, or in your browser on [StackBlitz](https://sveltekit.new). Make sure to use a browser that supports the view transitions API. Once you have the app running, add the following to the script block in `src/routes/+layout.svelte`.

```js
// @errors: 2305 7006 2339 2810
import { onNavigate } from '$app/navigation';

onNavigate((navigation) => {
	if (!document.startViewTransition) return;

	return new Promise((resolve) => {
		document.startViewTransition(async () => {
			resolve();
			await navigation.complete;
		});
	});
});
```

With that, every navigation that occurs will trigger a view transition. You can already see this in action – by default, the browser will crossfade between the old and new pages.

<video src="https://sveltejs.github.io/assets/video/vt-demo-1.mp4" controls muted playsinline></video>

<details>
<summary>How the code works</summary>

This code may look a bit intimidating – if you're curious, I can break it down line-by-line, but for now it’s enough to know that adding it will allow you to interact with the view transitions API during navigation.

As mentioned above, the `onNavigate` callback will run immediately before the new page is rendered after a navigation. Inside the callback, we check if `document.startViewTransition` exists. If it doesn’t (i.e. the browser doesn’t support it), we exit early.

We then return a promise to delay completing the navigation until the view transition has started. We use a [promise constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise) so that we can control when the promise resolves.

```js
// @errors: 1108
return new Promise((resolve) => {
	document.startViewTransition(async () => {
		resolve();
		await navigation.complete;
	});
});
```

Inside the promise constructor, we start the view transition. Inside the view transition callback we resolve the promise we just returned, which indicates to SvelteKit that it should finish the navigation. It’s important that the navigation waits to finish until _after_ we start the view transition – the browser needs to snapshot the old state so it can transition to the new state.

Finally, inside the view transition callback we wait for SvelteKit to finish the navigation by awaiting `navigation.complete`. Once `navigation.complete` resolves, the new page has been loaded into the DOM and the browser can animate between the two states.

It’s a bit of a mouthful, but by not abstracting it we allow you to interact with the view transition directly and make any customizations you require.

</details>

## Customizing the transition with CSS

We can also customize this page transition using CSS animation. In the style block of your `+layout.svelte`, add the following CSS rules.

```css
@keyframes fade-in {
	from {
		opacity: 0;
	}
}

@keyframes fade-out {
	to {
		opacity: 0;
	}
}

@keyframes slide-from-right {
	from {
		transform: translateX(30px);
	}
}

@keyframes slide-to-left {
	to {
		transform: translateX(-30px);
	}
}

:root::view-transition-old(root) {
	animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out, 300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
}

:root::view-transition-new(root) {
	animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in, 300ms cubic-bezier(0.4, 0, 0.2, 1) both
			slide-from-right;
}
```

Now when you navigate between pages, the old page will fade out and slide to the left, and the new page will fade in and slide from the right. These particular animation styles come from Jake Archibald’s excellent [Chrome Developers article on view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/), which is well worth a read if you want to understand everything you can do with this API.

Note that we have to add `:root` before the `::view-transition` pseudoelements – these elements are only on the root of the document, so we don’t want Svelte to [scope them](/docs/svelte-components#style) to the component.

You might have noticed that the entire page slides in and out, even though the header is the same on both the old and new page. To make for a smoother transition, we can give the header a unique `view-transition-name` so that it is animated separately from the rest of the page. In `src/routes/Header.svelte`, find the `header` CSS selector in the style block and add a view transition name.

```css
header {
	display: flex;
	justify-content: space-between;
	view-transition-name: header;
}
```

Now, the header will not transition in and out on navigation, but the rest of the page will.

<video src="https://sveltejs.github.io/assets/video/vt-demo-2.mp4" controls muted playsinline></video>

<details>
<summary>Fixing the types</summary>

Since `startViewTransition` is not supported by all browsers, your IDE may not know that it exists. To make the errors go away and get the correct typings, add the following to your `app.d.ts`:

```ts
declare global {
	// preserve any customizations you have here
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	// add these lines
	interface ViewTransition {
		updateCallbackDone: Promise<void>;
		ready: Promise<void>;
		finished: Promise<void>;
		skipTransition: () => void;
	}

	interface Document {
		startViewTransition(updateCallback: () => Promise<void>): ViewTransition;
	}
}

export {};
```

</details>

## Transitioning individual elements

We just saw how giving an element a `view-transition-name` separates it out from the rest of the page's animation. Setting a `view-transition-name` also instructs the browser to smoothly animate it to its new position after the transition completes. The `view-transition-name` acts as a unique identifier so the browser can identify matching elements from the old and new states.

Let’s see what that looks like – our demo app’s navigation has a small triangle indicating the active page. Right now, it abruptly appears in the new position after we navigate. Let’s give it a `view-transition-name` so the browser animates it to its new position instead.

Inside `src/routes/Header.svelte`, find the CSS rule creating the active page indicator and give it a `view-transition-name`:

```css
li[aria-current='page']::before {
	/* other existing rules */
	view-transition-name: active-page;
}
```

By adding that single line, the indicator will now smoothly slide to its new position instead of jumping.

<video src="https://sveltejs.github.io/assets/video/vt-demo-3.mp4" controls muted playsinline></video>

(It might be easy to miss the difference – look at the small moving triangle indicator at the top of the screen!)

## Reduced motion

It’s important to respect our users’ [motion preferences](https://web.dev/prefers-reduced-motion/) while implementing animation on the web. Just because you can implement an extreme page transition doesn’t mean you should. To disable all page transitions for users who prefer reduced motion, you can add the following to the global `styles.css`:

```css
@media (prefers-reduced-motion) {
	::view-transition-group(*),
	::view-transition-old(*),
	::view-transition-new(*) {
		animation: none !important;
	}
}
```

While this may be the safest option, reduced motion does not necessarily mean no animation. Instead, you could consider your view transitions on a case-by-case basis. For instance, maybe we disable the sliding animation, but leave the default crossfade (which doesn’t involve motion). You can do so by wrapping the `::view-transition` rules you want to disable in a `prefers-reduced-motion: no-preference` media-query:

```css
@media (prefers-reduced-motion: no-preference) {
	:root::view-transition-old(root) {
		animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out, 300ms cubic-bezier(0.4, 0, 0.2, 1) both
				slide-to-left;
	}

	:root::view-transition-new(root) {
		animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in, 300ms cubic-bezier(
					0.4,
					0,
					0.2,
					1
				) both slide-from-right;
	}
}
```

## What’s next?

As you can see, SvelteKit doesn’t abstract a whole lot about _how_ view transitions work – you’re interacting directly with the browser’s built-in `document.startViewTransition` and `::view-transition` APIs, rather than framework abstractions like those found in Nuxt and Astro. We’re eager to see how people end up using view transitions in SvelteKit apps, and whether it makes sense to add higher level abstractions of our own in future.

## Resources

You can find the demo code from this post [on GitHub](https://github.com/geoffrich/sveltekit-onnavigate-demo) and the live version [deployed to Vercel](https://sveltekit-onnavigate-demo.vercel.app/). Here are some other view transitions resources you may find helpful:

- [MDN view transitions docs](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [Chrome view transitions API explainer](https://developer.chrome.com/docs/web-platform/view-transitions/)
- [Rich Harris demoing view transitions with onNavigate](https://www.youtube.com/shorts/weOCWOD2UIo)
- [My Svelte Summit video showing how to use view transitions for FLIP animations](https://youtu.be/K95TQ-Yh7Cw)
- [Fruit list demo](https://sveltekit-shared-element-transitions-codelab.vercel.app/fruits) ([source](https://github.com/geoffrich/sveltekit-view-transitions))
- [Svelte Summit video list demo](https://http-203-svelte.vercel.app/) (based on a [Jake Archibald demo](https://http203-playlist.netlify.app/)) ([source](https://github.com/geoffrich/http-203-svelte))
