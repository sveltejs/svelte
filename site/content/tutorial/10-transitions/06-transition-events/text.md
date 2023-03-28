---
title: Transition events
---

It can be useful to know when transitions are beginning and ending. Svelte dispatches events that you can listen to like any other DOM event:

```svelte
<p
	transition:fly={{ y: 200, duration: 2000 }}
	on:introstart={() => (status = 'intro started')}
	on:outrostart={() => (status = 'outro started')}
	on:introend={() => (status = 'intro ended')}
	on:outroend={() => (status = 'outro ended')}
>
	Flies in and out
</p>
```
