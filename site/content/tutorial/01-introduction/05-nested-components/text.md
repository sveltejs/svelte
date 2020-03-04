---
title: Nested components
---

It would be impractical to put your entire app in a single component. Instead, we can import components from other files and include them as though we were including elements.

Add a `<script>` tag that imports `Nested.svelte`...

```html
<script>
	import Nested from './Nested.svelte';
</script>
```

...then add it to the markup:

```html
<p>This is a paragraph.</p>
<Nested/>
```

Notice that even though `Nested.svelte` has a `<p>` element, the styles from `App.svelte` don't leak in.

**NOTE**: The component variable names (such as `Nested`) should be Capitalized

- `when?`: When used as tags in markup.

- `Why?`: To avoid conflicts between html tags and user defined component tags, this convention has been adapted.
