---
title: Default values
---

We can easily specify default values for props in `Nested.svelte`:

```svelte
<script>
	export let answer = 'a mystery';
</script>
```

If we now add a second component _without_ an `answer` prop, it will fall back to the default:

```svelte
<Nested answer={42} />
<Nested />
```
