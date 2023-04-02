---
title: Sharing code
---

In all the examples we've seen so far, the `<script>` block contains code that runs when each component instance is initialised. For the vast majority of components, that's all you'll ever need.

Very occasionally, you'll need to run some code outside of an individual component instance. For example, you can play all five of these audio players simultaneously; it would be better if playing one stopped all the others.

We can do that by declaring a `<script context="module">` block. Code contained inside it will run once, when the module first evaluates, rather than when a component is instantiated. Place this at the top of `AudioPlayer.svelte`:

```svelte
<script context="module">
	let current;
</script>
```

It's now possible for the components to 'talk' to each other without any state management:

```js
function stopOthers() {
	if (current && current !== audio) current.pause();
	current = audio;
}
```
