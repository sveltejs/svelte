---
title: Basic markup
---

## Tags

A lowercase tag, like `<div>`, denotes a regular HTML element. A capitalised tag, such as `<Widget>` or `<Namespace.Widget>`, indicates a _component_.

```svelte
<script>
	import Widget from './Widget.svelte';
</script>

<div>
	<Widget />
</div>
```

## Attributes and props

By default, attributes work exactly like their HTML counterparts.

```svelte
<div class="foo">
	<button disabled>can't touch this</button>
</div>
```

As in HTML, values may be unquoted.

<!-- prettier-ignore -->
```svelte
<input type=checkbox />
```

Attribute values can contain JavaScript expressions.

```svelte
<a href="page/{p}">page {p}</a>
```

Or they can _be_ JavaScript expressions.

```svelte
<button disabled={!clickable}>...</button>
```

Boolean attributes are included on the element if their value is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) and excluded if it's [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy).

All other attributes are included unless their value is [nullish](https://developer.mozilla.org/en-US/docs/Glossary/Nullish) (`null` or `undefined`).

```svelte
<input required={false} placeholder="This input field is not required" />
<div title={null}>This div has no title attribute</div>
```

An expression might include characters that would cause syntax highlighting to fail in regular HTML, so quoting the value is permitted. The quotes do not affect how the value is parsed:

<!-- prettier-ignore -->
```svelte
<button disabled="{number !== 42}">...</button>
```

When the attribute name and value match (`name={name}`), they can be replaced with `{name}`.

```svelte
<button {disabled}>...</button>
<!-- equivalent to
<button disabled={disabled}>...</button>
-->
```

By convention, values passed to components are referred to as _properties_ or _props_ rather than _attributes_, which are a feature of the DOM.

As with elements, `name={name}` can be replaced with the `{name}` shorthand.

```svelte
<Widget foo={bar} answer={42} text="hello" />
```

_Spread attributes_ allow many attributes or properties to be passed to an element or component at once.

An element or component can have multiple spread attributes, interspersed with regular ones.

```svelte
<Widget {...things} />
```

`$$props` references all props that are passed to a component, including ones that are not declared with `export`. Using `$$props` will not perform as well as references to a specific prop because changes to any prop will cause Svelte to recheck all usages of `$$props`. But it can be useful in some cases – for example, when you don't know at compile time what props might be passed to a component.

```svelte
<Widget {...$$props} />
```

`$$restProps` contains only the props which are _not_ declared with `export`. It can be used to pass down other unknown attributes to an element in a component. It shares the same performance characteristics compared to specific property access as `$$props`.

```svelte
<input {...$$restProps} />
```

> The `value` attribute of an `input` element or its children `option` elements must not be set with spread attributes when using `bind:group` or `bind:checked`. Svelte needs to be able to see the element's `value` directly in the markup in these cases so that it can link it to the bound variable.

> Sometimes, the attribute order matters as Svelte sets attributes sequentially in JavaScript. For example, `<input type="range" min="0" max="1" value={0.5} step="0.1"/>`, Svelte will attempt to set the value to `1` (rounding up from 0.5 as the step by default is 1), and then set the step to `0.1`. To fix this, change it to `<input type="range" min="0" max="1" step="0.1" value={0.5}/>`.

> Another example is `<img src="..." loading="lazy" />`. Svelte will set the img `src` before making the img element `loading="lazy"`, which is probably too late. Change this to `<img loading="lazy" src="...">` to make the image lazily loaded.

## Text expressions

```svelte
{expression}
```

Text can also contain JavaScript expressions:

> If you're using a regular expression (`RegExp`) [literal notation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#literal_notation_and_constructor), you'll need to wrap it in parentheses.

<!-- prettier-ignore -->
```svelte
<h1>Hello {name}!</h1>
<p>{a} + {b} = {a + b}.</p>

<div>{(/^[A-Za-z ]+$/).test(value) ? x : y}</div>
```

## Comments

You can use HTML comments inside components.

```svelte
<!-- this is a comment! --><h1>Hello world</h1>
```

Comments beginning with `svelte-ignore` disable warnings for the next block of markup. Usually, these are accessibility warnings; make sure that you're disabling them for a good reason.

```svelte
<!-- svelte-ignore a11y-autofocus -->
<input bind:value={name} autofocus />
```
