---
title: <svelte:window>
---

```svelte
<svelte:window onevent={handler} />
```

```svelte
<svelte:window bind:prop={value} />
```

The `<svelte:window>` element allows you to add event listeners to the `window` object without worrying about removing them when the component is destroyed, or checking for the existence of `window` when server-side rendering.

This element may only appear at the top level of your component — it cannot be inside a block or element.

```svelte
<script>
	function handleKeydown(event) {
		alert(`pressed the ${event.key} key`);
	}
</script>

<svelte:window onkeydown={handleKeydown} />
```

You can also bind to the following properties:

- `innerWidth`
- `innerHeight`
- `outerWidth`
- `outerHeight`
- `scrollX`
- `scrollY`
- `online` — an alias for `window.navigator.onLine`
- `devicePixelRatio`

All except `scrollX` and `scrollY` are readonly.

```svelte
<svelte:window bind:scrollY={y} />
```

> [!NOTE] Note that the page will not be scrolled to the initial value to avoid accessibility issues. Only subsequent changes to the bound variable of `scrollX` and `scrollY` will cause scrolling. If you have a legitimate reason to scroll when the component is rendered, call `scrollTo()` in an `$effect`.
