---
title: style
tags: template-style
---

There are two ways to set inline styles on elements: the `style` attribute, and the `style:` directive.

## Attributes

Primitive values are treated like any other attribute:

```svelte
<div style="color: red; padding: 4px;">...</div>
<div style={`color: ${color};`}>...</div>
```

### Objects and arrays

Since Svelte 5.56, `style` can be an object or array, and is converted to a CSS declaration string using the same rules as the [`class` attribute](class).

If the value is an object, each entry becomes a declaration:

```svelte
<!-- results in `style="color: red; background-color: blue;"` -->
<div style={{ color: 'red', 'background-color': 'blue' }}>...</div>
```

> [!NOTE]
> Object keys are written as the literal CSS property name — `'background-color'`, not `backgroundColor`. Svelte does not convert between `camelCase` and `kebab-case`.

Entries whose value is `false`, `null`, `undefined` or the empty string are skipped, which is useful for conditional styles:

```svelte
<!-- results in `style="color: red;"` if `active` is falsy,
     `style="color: red; background-color: yellow;"` otherwise -->
<div style={{ color: 'red', 'background-color': active && 'yellow' }}>...</div>
```

If the value is an array, the truthy entries are combined:

```svelte
<!-- if `faded` and `large` are both truthy, results in
     `style="opacity: 0.5; padding: 16px;"` -->
<div style={[faded && 'opacity: 0.5', large && 'padding: 16px']}>...</div>
```

Arrays can contain arrays, objects and strings, which Svelte flattens. This is useful for combining local styles with props, for example:

```svelte
<!--- file: Button.svelte --->
<script>
	let { style, children, ...rest } = $props();
</script>

<button {...rest} style={['padding: 4px 8px', style]}>
	{@render children?.()}
</button>
```

The user of this component has the same flexibility to use a mixture of objects, arrays and strings:

```svelte
<!--- file: App.svelte --->
<script>
	import Button from './Button.svelte';
	let highlighted = $state(false);
</script>

<Button
	onclick={() => highlighted = true}
	style={{ 'background-color': highlighted && 'yellow' }}
>
	Highlight me
</Button>
```

CSS custom properties work the same way:

```svelte
<div style={{ '--columns': columns }}>...</div>
```

Since Svelte 5.56, Svelte also exposes the `StyleValue` type, which is the type of value that the `style` attribute on elements accepts. This is useful if you want to use a type-safe style value in component props:

```svelte
<script lang="ts">
	import type { StyleValue } from 'svelte/elements';

	const props: { style: StyleValue } = $props();
</script>

<div style={['padding: 2px', props.style]}>...</div>
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

When `style:` directives are combined with the `style` attribute, the directives take precedence,
even over `!important` properties, and regardless of whether the attribute is a string or an object:

```svelte
<div style:color="red" style="color: blue">This will be red</div>
<div style:color="red" style="color: blue !important">This will still be red</div>
<div style:color="red" style={{ color: 'blue' }}>This will be red</div>
```

You can set CSS custom properties:

```svelte
<div style:--columns={columns}>...</div>
```
