---
title: <svelte:boundary>
---

```svelte
<svelte:boundary onerror={handler}>...</svelte:boundary>
```

> [!NOTE]
> This feature was added in 5.3.0

Boundaries allow you to guard against errors in part of your app from breaking the app as a whole, and to recover from those errors.

If an error occurs while rendering or updating the children of a `<svelte:boundary>`, or running any [`$effect`]($effect) functions contained therein, the contents will be removed.

Errors occurring outside the rendering process (for example, in event handlers) are _not_ caught by error boundaries.

## Properties

For the boundary to do anything, one or both of `failed` and `onerror` must be provided.

### `failed`

If an `failed` snippet is provided, it will be rendered with the error that was thrown, and a `reset` function that recreates the contents ([demo](/playground/hello-world#H4sIAAAAAAAAE3VRy26DMBD8lS2tFCIh6JkAUlWp39Cq9EBg06CAbdlLArL87zWGKk8ORnhmd3ZnrD1WtOjFXqKO2BDGW96xqpBD5gXerm5QefG39mgQY9EIWHxueRMinLosti0UPsJLzggZKTeilLWgLGc51a3gkuCjKQ7DO7cXZotgJ3kLqzC6hmex1SZnSXTWYHcrj8LJjWTk0PHoZ8VqIdCOKayPykcpuQxAokJaG1dGybYj4gw4K5u6PKTasSbjXKgnIDlA8VvUdo-pzonraBY2bsH7HAl78mKSHZpgIcuHjq9jXSpZSLixRlveKYQUXhQVhL6GPobXAAb7BbNeyvNUs4qfRg3OnELLj5hqH9eQZqCnoBwR9lYcQxuVXeBzc8kMF8yXY4yNJ5oGiUzP_aaf_waTRGJib5_Ad3P_vbCuaYxzeNpbU0eUMPAOKh7Yw1YErgtoXyuYlPLzc10_xo_5A91zkQL_AgAA)):

```svelte
<svelte:boundary>
	<FlakyComponent />

	{#snippet failed(error, reset)}
		<button onclick={reset}>oops! try again</button>
	{/snippet}
</svelte:boundary>
```

> [!NOTE]
> As with [snippets passed to components](snippet#Passing-snippets-to-components), the `failed` snippet can be passed explicitly as a property...
>
> ```svelte
> <svelte:boundary {failed}>...</svelte:boundary>
> ```
>
> ...or implicitly by declaring it directly inside the boundary, as in the example above.

### `onerror`

If an `onerror` function is provided, it will be called with the same two `error` and `reset` arguments. This is useful for tracking the error with an error reporting service...

```svelte
<svelte:boundary onerror={(e) => report(e)}>
	...
</svelte:boundary>
```

...or using `error` and `reset` outside the boundary itself:

```svelte
<script>
	let error = $state(null);
	let reset = $state(() => {});

	function onerror(e, r) {
		error = e;
		reset = r;
	}
</script>

<svelte:boundary {onerror}>
	<FlakyComponent />
</svelte:boundary>

{#if error}
	<button onclick={() => {
		error = null;
		reset();
	}}>
		oops! try again
	</button>
{/if}
```

If an error occurs inside the `onerror` function (or if you rethrow the error), it will be handled by a parent boundary if such exists.
