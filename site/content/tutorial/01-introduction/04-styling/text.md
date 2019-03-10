---
title: Styling
---

Just like in HTML, you can add a `<style>` tag to your component. Let's add some styles to the `<p>` element:

```html
<style>
	p {
		color: purple;
		font-family: 'Comic Sans MS';
		font-size: 2em;
	}
</style>

<p>This is a paragraph.</p>
```

Importantly, these rules are *scoped to the component*. You won't accidentally change the style of `<p>` elements elsewhere in your app, as we'll see in the next step.