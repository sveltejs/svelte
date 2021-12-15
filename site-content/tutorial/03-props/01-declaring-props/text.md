---
title: Declaring props
---

So far, we've dealt exclusively with internal state — that is to say, the values are only accessible within a given component.

In any real application, you'll need to pass data from one component down to its children. To do that, we need to declare *properties*, generally shortened to 'props'. In Svelte, we do that with the `export` keyword. Edit the `Nested.svelte` component:

```html
<script>
	export let answer;
</script>
```

> Just like `$:`, this may feel a little weird at first. That's not how `export` normally works in JavaScript modules! Just roll with it for now — it'll soon become second nature.