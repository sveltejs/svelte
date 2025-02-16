---
title: style and style:
---

There are two ways to set styles on elements: the `style` attribute, and the `style:` directive.

## Attributes

Primitive values are treated like any other attribute:

```svelte
<div style={big ? 'font-size:2em' : 'font-size:1.2em'}>...</div>
```

### Objects and arrays

Since Svelte 5.XX, `style` can be an object or array, and is converted to a string according to the following rules :

If the value is an 

If the value is an object, the key/value are converted to CSS properties if the value is not-null and not-empty.

```svelte
<!-- equivalent to <div style="color:red;display:inline"> -->
<div style={{ color: 'red', display: 'inline', background: null }}>...</div>
```

> [!NOTE]
> The CSS properties are case-insensitive and use `kebab-case`, which requires quoting key's name in JavaScript.
> In order to avoid this, object keys will be 'converted' according to the following rules :
> * Uppercase keys like `COLOR` will be converted to the lowercase format `color`.
> * `camelCase` keys like `fontSize` will be converted to the kebab-case format `font-size`.
> * `snake_case` keys like `border_color` will be converted to the kebab-case format `border-color`.
> Note that this will not apply to key that starts with a double hyphens, because CSS variable don't have naming rules and are case-sensitive (`--myvar` is different from `--myVar`).
> But we can use a double underscores to enable the same rules. Ex: `__myVar` or `__my_var` will be converted to `--my-var`.

If the value is an array, the truthy values are combined, string are passed without change, and array/objects are flatten :

```svelte
<!-- equivalent to <div style="color:red;display:inline;--my-var:0;font-size:2em;background: black"> -->
<div style={['color:red', {display:'inline'}, [{__my_var: 0, fontSize: '2em'}, 'background: black']]}>...</div>
```

This is useful for combining local styles with props, for example:

```svelte
<!--- file: Button.svelte --->
<script>
	let props = $props();
</script>

<button {...props} style={[props.style, {color:'red', background:'black'}]}>
	{@render props.children?.()}
</button>
```


Svelte also exposes the `StyleValue` type, which is the type of value that the `style` attribute on elements accept. This is useful if you want to use a type-safe class name in component props:

```svelte
<script lang="ts">
	import type { StyleValue } from 'svelte/elements';

	const props: { style: StyleValue } = $props();
</script>

<div style={[props.style, {color: 'red'}]}>...</div>
```


## The `style:` directive

The `style:` directive provides a shorthand for setting multiple styles on an element.

```svelte
<!-- These are equivalent -->
<div style:color="red">...</div>
<div style="color: red;">...</div>
```

The value can contain arbitrary expressions:

```svelte
<div style:color={myColor}>...</div>
```

The shorthand form is allowed:

```svelte
<div style:color>...</div>
```

Multiple styles can be set on a single element:

```svelte
<div style:color style:width="12rem" style:background-color={darkMode ? 'black' : 'white'}>...</div>
```

To mark a style as important, use the `|important` modifier:

```svelte
<div style:color|important="red">...</div>
```

When `style:` directives are combined with `style` attributes, the directives will take precedence:

```svelte
<div style="color: blue;" style:color="red">This will be red</div>
```
