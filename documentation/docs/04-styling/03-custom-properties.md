---
title: Custom properties
tags: styles-custom-properties
---

You can pass CSS custom properties — both static and dynamic — to components:

```svelte
<Slider
	bind:value
	min={0}
	max={100}
	--track-color="black"
	--thumb-color="rgb({r} {g} {b})"
/>
```

The above code essentially desugars to this:

```svelte
<svelte-css-wrapper style="display: contents; --track-color: black; --thumb-color: rgb({r} {g} {b})">
	<Slider
		bind:value
		min={0}
		max={100}
	/>
</svelte-css-wrapper>
```

For an SVG element, it would use `<g>` instead:

```svelte
<g style="--track-color: black; --thumb-color: rgb({r} {g} {b})">
	<Slider
		bind:value
		min={0}
		max={100}
	/>
</g>
```

Inside the component, we can read these custom properties (and provide fallback values) using [`var(...)`](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties):

```svelte
<style>
	.track {
		background: var(--track-color, #aaa);
	}

	.thumb {
		background: var(--thumb-color, blue);
	}
</style>
```

You don't _have_ to specify the values directly on the component; as long as the custom properties are defined on a parent element, the component can use them. It's common to define custom properties on the `:root` element in a global stylesheet so that they apply to your entire application.

> [!NOTE] While the extra element will not affect layout, it _will_ affect any CSS selectors that (for example) use the `>` combinator to target an element directly inside the component's container.

## Limitations

CSS custom properties must be passed as explicit named attributes — they cannot be included in a spread object. Svelte uses static analysis at compile time to identify `--`-prefixed attributes; spread objects are opaque to this analysis.

```svelte
<script>
	let theme = { '--track-color': 'black', '--thumb-color': 'blue' };
</script>

<!-- ❌ does not work — custom properties inside spreads are not detected -->
<Slider {...theme} />

<!-- ✅ pass each custom property explicitly -->
<Slider --track-color="black" --thumb-color="blue" />
```

If you need to forward a dynamic set of custom properties (for example, from a theme object whose keys are not known at compile time), apply them as a `style` string on a wrapper element instead:

```svelte
<script>
	let theme = { '--track-color': 'black', '--thumb-color': 'blue' };
	let themeStyle = Object.entries(theme).map(([k, v]) => `${k}: ${v}`).join('; ');
</script>

<div style={themeStyle}>
	<Slider bind:value min={0} max={100} />
</div>
```
