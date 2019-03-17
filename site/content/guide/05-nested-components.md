---
title: Nested components
---

As well as containing elements (and `if` blocks and `each` blocks), Svelte components can contain *other* Svelte components.

```html
<!-- { title: 'Nested components' } -->
<script>
	import Widget from './Widget.html';
</script>

<div class='widget-container'>
	<Widget answer={42}/>
</div>
```

```html
<!--{ filename: 'Widget.html' }-->
<p>I am a nested component. The answer is {answer}</p>
```

That's similar to doing this...

```js
import Widget from './Widget.html';

const widget = new Widget({
	target: document.querySelector('.widget-container'),
	props: {
		answer: 42
	}
});
```

...except that Svelte takes care of destroying the child component when the parent is destroyed, and keeps props in sync if they change.

> Component names must be capitalised, following the widely-used JavaScript convention of capitalising constructor names. It's also an easy way to distinguish components from elements in your template.


### Props

Props, short for 'properties', are the means by which you pass data down from a parent to a child component — in other words, they're just like attributes on an element. As with element attributes, prop values can contain any valid JavaScript expression.

Often, the name of the property will be the same as the value, in which case we can use a shorthand:

```html
<!-- { repl: false } -->
<!-- these are equivalent -->
<Widget foo={foo}/>
<Widget {foo}/>
```

> Note that props are *one-way* — to get data from a child component into a parent component, use [bindings](docs#bindings).


### Composing with `<slot>`

A component can contain a `<slot></slot>` element, which allows the parent component to inject content:

```html
<!-- { title: 'Using <slot>' } -->
<script>
	import Box from './Box.html';
</script>

<Box>
	<h2>Hello!</h2>
	<p>This is a box. It can contain anything.</p>
</Box>
```

```html
<!--{ filename: 'Box.html' }-->
<style>
	.box {
		border: 2px solid black;
		padding: 0.5em;
	}
</style>

<div class="box">
	<slot><!-- content is injected here --></slot>
</div>
```

The `<slot>` element can contain 'fallback content', which will be used if no children are provided for the component:

```html
<!-- { title: 'Default slot content' } -->
<script>
	import Box from './Box.html';
</script>

<Box></Box>
```

```html
<!--{ filename: 'Box.html' }-->
<style>
	.box {
		border: 2px solid black;
		padding: 0.5em;
	}

	.fallback {
		color: #999;
	}
</style>

<div class="box">
	<slot>
		<p class="fallback">the box is empty!</p>
	</slot>
</div>
```

You can also have *named* slots. Any elements with a corresponding `slot` attribute will fill these slots:

```html
<!-- { title: 'Named slots' } -->
<script>
	import ContactCard from './ContactCard.html';
</script>

<ContactCard>
	<span slot="name">P. Sherman</span>
	<span slot="address">42 Wallaby Way, Sydney</span>
</ContactCard>
```

```html
<!--{ filename: 'ContactCard.html' }-->
<style>
	.contact-card {
		border: 2px solid black;
		padding: 0.5em;
	}
</style>

<div class="contact-card">
	<h2><slot name="name"></slot></h2>
	<slot name="address">Unknown address</slot>
	<br>
	<slot name="email">Unknown email</slot>
</div>
```