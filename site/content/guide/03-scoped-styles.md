---
title: Scoped styles
---

One of Svelte's key tenets is that components should be self-contained and reusable in different contexts. Because of that, it has a mechanism for *scoping* your CSS, so that you don't accidentally clobber other selectors on the page.

### Adding styles

Your component template can have a `<style>` tag, like so:

```html
<!--{ title: 'Scoped styles' }-->
<div class="foo">
	Big red Comic Sans
</div>

<style>
	.foo {
		color: red;
		font-size: 2em;
		font-family: 'Comic Sans MS';
	}
</style>
```


### How it works

Open the example above in the REPL and inspect the element to see what has happened – Svelte has added a `svelte-[uniqueid]` class to the element, and transformed the CSS selector accordingly. Since no other element on the page can share that selector, anything else on the page with `class="foo"` will be unaffected by our styles.

This is vastly simpler than achieving the same effect via [Shadow DOM](http://caniuse.com/#search=shadow%20dom) and works everywhere without polyfills.

> Svelte will add a `<style>` tag to the page containing your scoped styles. Dynamically adding styles may be impossible if your site has a [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP). If that's the case, you can use scoped styles by [server-rendering your CSS](guide#rendering-css) and using the `css: false` compiler option (or `--no-css` with the CLI).


### Cascading rules

Styles will *only* apply to the current component, unless you opt in to cascading with the `:global(...)` modifier:

<!-- TODO `cascade: false` in the REPL -->

```html
<!-- { repl: false } -->
<div>
	<Widget/>
</div>

<style>
	p {
		/* this block will be disregarded, since
		   there are no <p> elements here */
		color: red;
	}

	div :global(p) {
		/* this block will be applied to any <p> elements
		   inside the <div>, i.e. in <Widget> */
		font-weight: bold;
	}
</style>

<script>
	import Widget from './Widget.html';

	export default {
		components: { Widget }
	};
</script>
```

> Scoped styles are *not* dynamic – they are shared between all instances of a component. In other words you can't use `{tags}` inside your CSS.


### Unused style removal

Svelte will identify and remove styles that are not being used in your app. It will also emit a warning so that you can remove them from the source.

For rules *not* to be removed, they must apply to the component's markup. As far as Svelte is concerned `.active` is unused in the following code and should be removed:

```html
<!-- { repl: false } -->
<div>
	<p ref:paragraph>this text is not bold</p>
</div>

<style>
	.active {
		color: bold;
	}
</style>

<script>
	export default {
		oncreate() {
			const { active } = this.get();
			if (active) this.refs.paragraph.classList.add('active');
		}
	};
</script>
```

Instead of manually manipulating the DOM, you should always use the `class` attribute (or the [class directive](https://svelte.technology/guide#classes)):

```html
<!-- { repl: false } -->
<div>
	<p class="{active ? 'active' : ''}">this text is bold</p>
</div>
```

If that's impossible for some reason, you can use `:global(...)`:

```html
<!-- { repl: false } -->
<style>
	div :global(.active) {
		color: bold;
	}
</style>
```

The same applies to the contents of `{@html ...}` tags.


### Special selectors

If you have a [ref](guide#refs) on an element, you can use it as a CSS selector. The `ref:*` selector has the same specificity as a class or attribute selector.


```html
<!--{ title: 'Styling with refs' }-->
<div ref:foo>
	yeah!
</div>

<style>
	ref:foo {
		color: magenta;
		font-size: 5em;
	}
</style>
```
