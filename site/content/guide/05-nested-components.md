---
title: Nested components
---

As well as containing elements (and `if` blocks and `each` blocks), Svelte components can contain *other* Svelte components.

```html
<!-- { title: 'Nested components' } -->
<div class='widget-container'>
	<Widget/>
</div>

<script>
	import Widget from './Widget.html';

	export default {
		components: {
			Widget
		}
	};
</script>
```

```html
<!--{ filename: 'Widget.html' }-->
<p>I am a nested component</p>
```

That's similar to doing this...

```js
import Widget from './Widget.html';

const widget = new Widget({
	target: document.querySelector('.widget-container')
});
```

...except that Svelte takes care of destroying the child component when the parent is destroyed, and keeps the two components in sync with *props*.

> Component names must be capitalised, following the widely-used JavaScript convention of capitalising constructor names. It's also an easy way to distinguish components from elements in your template.


### Props

Props, short for 'properties', are the means by which you pass data down from a parent to a child component — in other words, they're just like attributes on an element:

```html
<!--{ title: 'Props' }-->
<div class='widget-container'>
	<Widget foo bar="static" baz={dynamic}/>
</div>

<script>
	import Widget from './Widget.html';

	export default {
		components: {
			Widget
		}
	};
</script>
```

```html
<!--{ filename: 'Widget.html' }-->
<p>foo: {foo}</p>
<p>bar: {bar}</p>
<p>baz: {baz}</p>
```

```json
/* { hidden: true } */
{
	dynamic: 'try changing this text'
}
```

As with element attributes, prop values can contain any valid JavaScript expression.

Often, the name of the property will be the same as the value, in which case we can use a shorthand:

```html
<!-- { repl: false } -->
<!-- these are equivalent -->
<Widget foo={foo}/>
<Widget {foo}/>
```

> Note that props are *one-way* — to get data from a child component into a parent component, use [bindings](guide#bindings).


### Composing with `<slot>`

A component can contain a `<slot></slot>` element, which allows the parent component to inject content:

```html
<!-- { title: 'Using <slot>' } -->
<Box>
	<h2>Hello!</h2>
	<p>This is a box. It can contain anything.</p>
</Box>

<script>
	import Box from './Box.html';

	export default {
		components: { Box }
	};
</script>
```

```html
<!--{ filename: 'Box.html' }-->
<div class="box">
	<slot><!-- content is injected here --></slot>
</div>

<style>
	.box {
		border: 2px solid black;
		padding: 0.5em;
	}
</style>
```

The `<slot>` element can contain 'fallback content', which will be used if no children are provided for the component:

```html
<!-- { title: 'Default slot content' } -->
<Box></Box>

<script>
	import Box from './Box.html';

	export default {
		components: { Box }
	};
</script>
```

```html
<!--{ filename: 'Box.html' }-->
<div class="box">
	<slot>
		<p class="fallback">the box is empty!</p>
	</slot>
</div>

<style>
	.box {
		border: 2px solid black;
		padding: 0.5em;
	}

	.fallback {
		color: #999;
	}
</style>
```

You can also have *named* slots. Any elements with a corresponding `slot` attribute will fill these slots:

```html
<!-- { title: 'Named slots' } -->
<ContactCard>
	<span slot="name">P. Sherman</span>
	<span slot="address">42 Wallaby Way, Sydney</span>
</ContactCard>

<script>
	import ContactCard from './ContactCard.html';

	export default {
		components: { ContactCard }
	};
</script>
```

```html
<!--{ filename: 'ContactCard.html' }-->
<div class="contact-card">
	<h2><slot name="name"></slot></h2>
	<slot name="address">Unknown address</slot>
	<br>
	<slot name="email">Unknown email</slot>
</div>

<style>
	.contact-card {
		border: 2px solid black;
		padding: 0.5em;
	}
</style>
```


### Shorthand imports

As an alternative to using an `import` declaration...

```html
<!-- { repl: false } -->
<script>
	import Widget from './Widget.html';

	export default {
		components: { Widget }
	};
</script>
```

...you can write this:

```html
<!-- { repl: false } -->
<script>
	export default {
		components: {
			Widget: './Widget.html'
		}
	};
</script>
```