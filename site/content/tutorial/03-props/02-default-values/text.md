---
title: Default values
---

We can easily specify default values for props in `Nested.svelte`:

```html
<script>
	export let answer = 'a mystery';
</script>
```

If we now add a second component *without* an `answer` prop, it will fall back to the default:

```html
<Nested answer={42}/>
<Nested/>
```
