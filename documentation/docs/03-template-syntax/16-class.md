---
title: class
---

Svelte provides ergonomic helpers to conditionally set classes on elements.

## class

Since Svelte 5.15, you can pass an object or array to the `class` attribute to conditionally set classes on elements. The logic is as follows:

- Primitive: All truthy values are added, all falsy not
- `Object`: All truthy keys are added to the element class
- `Array`: Objects and primitives are handled according to the two previous descriptions, nested arrays are flattened

```svelte
<!-- These are equivalent -->
<div class={isCool ? 'cool' : ''}>...</div>
<div class={{ cool: isCool }}>...</div>
<div class={[ isCool && 'cool' ]}>...</div>
```

You can use this to conditionally set many classes at once, including those that have special characters.

```svelte
<!-- These are equivalent -->
<div class={{ 'bg-blue-700 sm:w-1/2': useTailwind }}>...</div>
<div class={[ useTailwind && 'bg-blue-700 sm:w-1/2' ]}>...</div>
```

Since `class` itself takes these values, you can use the same syntax on component properties when forwarding those to the `class` attribute.

```svelte
<!--- file: App.svelte --->
<script>
    import Button from './Button.svelte';
    let useTailwind = $state(false);
</script>

<Button
    onclick={() => useTailwind = true}
    class={{ 'bg-blue-700 sm:w-1/2': useTailwind }}
>
    Give in
</Button>
```

```svelte
<!--- file: Button.svelte --->
<script>
    let { children, ...rest } = $props();
</script>

<!-- rest contains class, and the value is appropriately stringified -->
<button {...rest}>
    {@render children()}
</button>
```

Under the hood this is using [`clsx`](https://github.com/lukeed/clsx), so if you need more details on the syntax, you can visit its documentation.

## class:

The `class:` directive is a convenient way to conditionally set classes on elements, as an alternative to using conditional expressions inside `class` attributes:

```svelte
<!-- These are equivalent -->
<div class={isCool ? 'cool' : ''}>...</div>
<div class:cool={isCool}>...</div>
```

As with other directives, we can use a shorthand when the name of the class coincides with the value:

```svelte
<div class:cool>...</div>
```

Multiple `class:` directives can be added to a single element:

```svelte
<div class:cool class:lame={!cool} class:potato>...</div>
```

> [!NOTE] Since Svelte 5.15, you have the same expressive power with extra features on the `class` attribute itself, so use that instead if possible
