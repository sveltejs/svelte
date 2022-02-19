---
title: Reactive ContextAPI
---

Context isn't inherently reactive. If we want reactive values in context then we need to combine it with a store. In this tutorial we are going to create a reactive value with the ContextAPI.

Click on the "Add Count" button. You will see only the child's count will get increased and the parent's count stays the same.

To make it reactive, we need to convert the initial value of the `count` to a readable store.

```HTML
<!-- Parent.svelte -->
<script>
	import { writable } from 'svelte/store'
	let count = writable(0)
</script>
```

Now we have a writable store called `count`, so we need to use it like `$count` as it's explained in the [writable stores tutorial](https://svelte.dev/tutorial/writable-stores).

```HTML
<!-- Parent.svelte -->
<p>Parent's count is: {$count}</p>

<!-- Child.svelte -->
<p>Child's count is: {$count}</p>
<button on:click={_=> $count++}>Add Count</button>
```
