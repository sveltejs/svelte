## invalid_default_snippet

> Cannot use `{@render children(...)}` if the parent component uses `let:` directives. Consider using a named snippet instead

This error would be thrown in a setup like this:

```svelte
<!--- file: Parent.svelte --->
<List {items} let:entry>
    <span>{entry}</span>
</List>
```

```svelte
<!--- file: List.svelte --->
<script>
    let { items, children } = $props();
</script>

<ul>
    {#each items as item}
        <li>{@render children(item)}</li>
    {/each}
</ul>
```

Here, `List.svelte` is using `{@render children(item)` which means it expects `Parent.svelte` to use snippets. Instead, `Parent.svelte` uses the deprecated `let:` directive. This combination of APIs is incompatible, hence the error.

## lifecycle_outside_component

> `%name%(...)` can only be used during component initialisation

Certain lifecycle methods can only be used during component initialisation. To fix this, make sure you're invoking the method inside the _top level of the instance script_ of your component.

```svelte
<script>
    import { onMount } from 'svelte';

    function handleClick() {
        // This is wrong
        onMount(() => {})
    }

    // This is correct
    onMount(() => {})
</script>

<button onclick={handleClick}>click me</button>
```

## store_invalid_shape

> `%name%` is not a store with a `subscribe` method

## svelte_element_invalid_this_value

> The `this` prop on `<svelte:element>` must be a string, if defined
