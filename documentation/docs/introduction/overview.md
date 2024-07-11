---
title: Overview
---

- Short intro to what Svelte is and why it's the best ever
- A few code examples to have a very rough understanding of how Svelte code looks like
- Jump off points to tutorial, SvelteKit etc

Svelte is a web UI framework that uses a compiler to turn declarative component code like this...

```svelte
<!--- file: App.svelte --->
<script lang="ts">
	let count = $state(0);

	function increment() {
		count += 1;
	}
</script>

<button onclick={increment}>
	clicks: {count}
</button>
```

...into tightly optimized JavaScript that updates the document when state like count changes. Because the compiler can 'see' where count is referenced, the generated code is highly efficient, and because we're hijacking syntax like `$state(...)` and `=` instead of using cumbersome APIs, you can write less code.

Besides being fun to work with, Svelte offers a lot of features built-in, such as animations and transitions. Once you've written your first components you can reach for our batteries included metaframework [SvelteKit](/docs/kit) which provides you with an opinionated router, data loading and more.

If you're new to Svelte, visit the [interactive tutorial](/tutorial) before consulting this documentation. You can try Svelte online using the [REPL](/repl). Alternatively, if you'd like a more fully-featured environment, you can try Svelte on [StackBlitz](https://sveltekit.new).
