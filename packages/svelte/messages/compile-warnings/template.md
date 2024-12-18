## attribute_avoid_is

> The "is" attribute is not supported cross-browser and should be avoided

## attribute_global_event_reference

> You are referencing `globalThis.%name%`. Did you forget to declare a variable with that name?

## attribute_illegal_colon

> Attributes should not contain ':' characters to prevent ambiguity with Svelte directives

## attribute_invalid_property_name

> '%wrong%' is not a valid HTML attribute. Did you mean '%right%'?

## attribute_quoted

> Quoted attributes on components and custom elements will be stringified in a future version of Svelte. If this isn't what you want, remove the quotes

## bind_invalid_each_rest

> The rest operator (...) will create a new object and binding '%name%' with the original object will not work

## block_empty

> Empty block

## component_name_lowercase

> `<%name%>` will be treated as an HTML element unless it begins with a capital letter

## element_invalid_self_closing_tag

> Self-closing HTML tags for non-void elements are ambiguous — use `<%name% ...></%name%>` rather than `<%name% ... />`

In HTML, there's [no such thing as a self-closing tag](https://jakearchibald.com/2023/against-self-closing-tags-in-html/). While this _looks_ like a self-contained element with some text next to it...

```html
<div>
	<span class="icon" /> some text!
</div>
```

...a spec-compliant HTML parser (such as a browser) will in fact parse it like this, with the text _inside_ the icon:

```html
<div>
	<span class="icon"> some text! </span>
</div>
```

Some templating languages (including Svelte) will 'fix' HTML by turning `<span />` into `<span></span>`. Others adhere to the spec. Both result in ambiguity and confusion when copy-pasting code between different contexts, and as such Svelte prompts you to resolve the ambiguity directly by having an explicit closing tag.

To automate this, run the dedicated migration:

```bash
npx sv migrate self-closing-tags
```

In a future version of Svelte, self-closing tags may be upgraded from a warning to an error.

## event_directive_deprecated

> Using `on:%name%` to listen to the %name% event is deprecated. Use the event attribute `on%name%` instead

See [the migration guide](v5-migration-guide#Event-changes) for more info.

## node_invalid_placement_ssr

> %message%. When rendering this component on the server, the resulting HTML will be modified by the browser (by moving, removing, or inserting elements), likely resulting in a `hydration_mismatch` warning

HTML restricts where certain elements can appear. In case of a violation the browser will 'repair' the HTML in a way that breaks Svelte's assumptions about the structure of your components. Some examples:

- `<p>hello <div>world</div></p>` will result in `<p>hello </p><div>world</div><p></p>` (the `<div>` autoclosed the `<p>` because `<p>` cannot contain block-level elements)
- `<option><div>option a</div></option>` will result in `<option>option a</option>` (the `<div>` is removed)
- `<table><tr><td>cell</td></tr></table>` will result in `<table><tbody><tr><td>cell</td></tr></tbody></table>` (a `<tbody>` is auto-inserted)

This code will work when the component is rendered on the client (which is why this is a warning rather than an error), but if you use server rendering it will cause hydration to fail.

## script_context_deprecated

> `context="module"` is deprecated, use the `module` attribute instead

```svelte
<script ---context="module"--- +++module+++>
	let foo = 'bar';
</script>
```

## script_unknown_attribute

> Unrecognized attribute — should be one of `generics`, `lang` or `module`. If this exists for a preprocessor, ensure that the preprocessor removes it

## slot_element_deprecated

> Using `<slot>` to render parent content is deprecated. Use `{@render ...}` tags instead

See [the migration guide](v5-migration-guide#Snippets-instead-of-slots) for more info.

## svelte_component_deprecated

> `<svelte:component>` is deprecated in runes mode — components are dynamic by default

In previous versions of Svelte, the component constructor was fixed when the component was rendered. In other words, if you wanted `<X>` to re-render when `X` changed, you would either have to use `<svelte:component this={X}>` or put the component inside a `{#key X}...{/key}` block.

In Svelte 5 this is no longer true — if `X` changes, `<X>` re-renders.

In some cases `<object.property>` syntax can be used as a replacement; a lowercased variable with property access is recognized as a component in Svelte 5.

For complex component resolution logic, an intermediary, capitalized variable may be necessary. E.g. in places where `@const` can be used:

<!-- prettier-ignore -->
```svelte
{#each items as item}
	---<svelte:component this={item.condition ? Y : Z} />---
	+++{@const Component = item.condition ? Y : Z}+++
	+++<Component />+++
{/each}
```

A derived value may be used in other contexts:

<!-- prettier-ignore -->
```svelte
<script>
	// ...
	let condition = $state(false);
	+++const Component = $derived(condition ? Y : Z);+++
</script>

---<svelte:component this={condition ? Y : Z} />---
+++<Component />+++
```

## svelte_element_invalid_this

> `this` should be an `{expression}`. Using a string attribute value will cause an error in future versions of Svelte

## svelte_self_deprecated

> `<svelte:self>` is deprecated — use self-imports (e.g. `import %name% from './%basename%'`) instead

See [the note in the docs](legacy-svelte-self) for more info.
