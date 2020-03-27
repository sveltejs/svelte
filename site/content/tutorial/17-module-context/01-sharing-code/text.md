---
title: Sharing code
---

In all the examples we've seen so far, the `<script>` block contains code that runs when each component instance is initialised. For the vast majority of components, that's all you'll ever need.

Very occasionally, you'll need to run some code outside of an individual component instance. For example, you can play all five of these audio players simultaneously; it would be better if playing one stopped all the others.

We can do that by declaring a `<script context="module">` block. Code contained inside it will run once, when the module first evaluates, rather than when a component is instantiated. Place this at the top of `AudioPlayer.svelte`:

```html
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
``I was bit confused about this lesson - have to console.log(current - audio) to see difference.`` I press Play for 1st time (current is set to corresponding audio tag, e.g current = "Danube waltz").
Then I cick play on other track (audio = Mars) which, triggers "stopOthers" function. That checks if there's some track playing (current is "set" - not null) ``and now the part that was bit magic at 1st`` and whether the 'active' audio tag (Mars) I just clicked !== current (currently playing Waltz). 
The statement is true => currently playing Waltz is paused, "active" Mars starts playing and current = "Mars".
