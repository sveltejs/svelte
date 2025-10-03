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

## invalid_snippet_arguments

> A snippet function was passed invalid arguments. Snippets should only be instantiated via `{@render ...}`

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

## snippet_without_render_tag

> Attempted to render a snippet without a `{@render}` block. This would cause the snippet code to be stringified instead of its content being rendered to the DOM. To fix this, change `{snippet}` to `{@render snippet()}`.

A component throwing this error will look something like this (`children` is not being rendered):

```svelte
<script>
    let { children } = $props();
</script>

{children}
```

...or like this (a parent component is passing a snippet where a non-snippet value is expected):

```svelte
<!--- file: Parent.svelte --->
<ChildComponent>
  {#snippet label()}
    <span>Hi!</span>
  {/snippet}
</ChildComponent>
```

```svelte
<!--- file: Child.svelte --->
<script>
  let { label } = $props();
</script>

<!-- This component doesn't expect a snippet, but the parent provided one -->
<p>{label}</p>
```

## store_invalid_shape

> `%name%` is not a store with a `subscribe` method

## svelte_element_invalid_this_value

> The `this` prop on `<svelte:element>` must be a string, if defined
