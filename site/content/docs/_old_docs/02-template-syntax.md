---
title: Template syntax
---

Rather than reinventing the wheel, Svelte templates are built on foundations that have stood the test of time: HTML, CSS and JavaScript. There's very little extra stuff to learn.


### Tags

Tags allow you to bind data to your template. Whenever your data changes (for example after `component.a = 3`), the DOM updates automatically. You can use any JavaScript expression in templates, and it will also automatically update:

```html
<!-- { title: 'Template tags' } -->
<p>{a} + {b} = {a + b}</p>
```

```json
/* { hidden: true } */
{
	"a": 1,
	"b": 2
}
```

You can also use tags in attributes:

```html
<!-- { title: 'Tags in attributes' } -->
<h1 style="color: {color};">{color}</h1>
<p hidden={hideParagraph}>You can hide this paragraph.</p>
```

```json
/* { hidden: true } */
{
	color: "steelblue",
	hideParagraph: false
}
```
[Boolean attributes](https://www.w3.org/TR/html5/infrastructure.html#sec-boolean-attributes) like `hidden` will be omitted if the tag expression evaluates to false. Attributes will be removed from the element if their value is `undefined` or `null`.

### HTML

Ordinary tags render expressions as plain text. If you need your expression interpreted as HTML, wrap it in a special `@html` tag:

```html
<!-- { title: 'Triple tags' } -->
<p>This HTML: {content}</p>
<p>Renders as: {@html content}</p>
```

```json
/* { hidden: true } */
{
	content: "Some <b>bold</b> text."
}
```

As with regular tags, you can use any JavaScript expression in HTML tags, and it will automatically update the document when your data changes.

> HTML is **not** sanitized before it is rendered! If you are displaying user input, you are responsible for first sanitizing it. Not doing so potentially opens you up to XSS attacks.


### If blocks

Control whether or not part of your template is rendered by wrapping it in an if block.

```html
<!-- { repl: false } -->
{#if user.loggedIn}
	<a href="/logout">log out</a>
{/if}

{#if !user.loggedIn}
	<a href="/login">log in</a>
{/if}
```

You can combine the two blocks above with `{:else}`:

```html
<!-- { repl: false } -->
{#if user.loggedIn}
	<a href="/logout">log out</a>
{:else}
	<a href="/login">log in</a>
{/if}
```

You can also use `{:else if ...}`:

```html
<!--{ title: 'If, else and else if' }-->
{#if x > 10}
	<p>{x} is greater than 10</p>
{:else if 5 > x}
	<p>{x} is less than 5</p>
{:else}
	<p>{x} is between 5 and 10</p>
{/if}
```

```json
/* { hidden: true } */
{
	x: 7
}
```

### Each blocks

Iterate over lists of data:

```html
<!--{ title: 'Each blocks' }-->
<h1>Cats of YouTube</h1>

<ul>
	{#each cats as cat}
		<li><a target="_blank" href={cat.video}>{cat.name}</a></li>
	{:else}
		<li>No cats :(</li>
	{/each}
</ul>
```

```json
/* { hidden: true } */
{
	cats: [
		{
			name: "Keyboard Cat",
			video: "https://www.youtube.com/watch?v=J---aiyznGQ"
		},
		{
			name: "Maru",
			video: "https://www.youtube.com/watch?v=z_AbfPXTKms"
		},
		{
			name: "Henri The Existential Cat",
			video: "https://www.youtube.com/watch?v=OUtn3pvWmpg"
		}
	]
}
```

Else is triggered when the list is empty.

You can access the index of the current element with *expression* as *name*, *index*:

```html
<!--{ title: 'Each block indexes' }-->
<div class="grid">
	{#each rows as row, y}
		<div class="row">
			{#each columns as column, x}
				<code class="cell">
					{x + 1},{y + 1}:
					<strong>{row[column]}</strong>
				</code>
			{/each}
		</div>
	{/each}
</div>
```

```json
/* { hidden: true } */
{
	columns: ["foo", "bar", "baz"],
	rows: [
		{ foo: "a", bar: "b", baz: "c" },
		{ foo: "d", bar: "e", baz: "f" },
		{ foo: "g", bar: "h", baz: "i" }
	]
}
```

> By default, if the list `a, b, c` becomes `a, c`, Svelte will *remove* the third block and *change* the second from `b` to `c`, rather than removing `b`. If that's not what you want, use a [keyed each block](docs#keyed-each-blocks).

You can use destructuring patterns on the elements of the array:

```html
<!--{ title: 'Each block destructuring' }-->
<h1>It's the cats of YouTube again</h1>

<ul>
	{#each cats as {name, video} }
		<li><a target="_blank" href={video}>{name}</a></li>
	{/each}
</ul>
```

```json
/* { hidden: true } */
{
	cats: [
		{
			name: "Keyboard Cat",
			video: "https://www.youtube.com/watch?v=J---aiyznGQ"
		},
		{
			name: "Maru",
			video: "https://www.youtube.com/watch?v=z_AbfPXTKms"
		},
		{
			name: "Henri The Existential Cat",
			video: "https://www.youtube.com/watch?v=OUtn3pvWmpg"
		}
	]
}
```

### Await blocks

You can represent the three states of a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) — pending, fulfilled and rejected — with an `await` block:

```html
<!--{ title: 'Await blocks' }-->
<script>
	const promise = new Promise(fulfil => {
		setTimeout(() => fulfil(42), 3000);
	});
</script>

{#await promise}
	<p>wait for it...</p>
{:then answer}
	<p>the answer is {answer}!</p>
{:catch error}
	<p>well that's odd</p>
{/await}
```

If the expression in `{#await expression}` *isn't* a promise, Svelte skips ahead to the `then` section.


### Directives

Directives allow you to add special instructions for adding [event handlers](docs#event-handlers), [bindings](docs#bindings), [transitions](docs#transitions) and so on. We'll cover each of those in later stages of this guide – for now, all you need to know is that directives can be identified by the `:` character:

```html
<!--{ title: 'Element directives' }-->
<p>Count: {count}</p>
<button on:click="{() => count += 1}">+1</button>
```

```json
/* { hidden: true } */
{
	count: 0
}
```

> Technically, the `:` character is used to denote namespaced attributes in HTML. These will *not* be treated as directives, if encountered.


### Debug tags

To inspect data as it changes and flows through your app, use a `{@debug ...}` tag:

```html
<!--{ title: 'Debug tags' }-->
<input bind:value={name}>

{@debug name}
<h1>Hello {name}!</h1>
```

```json
/* { hidden: true } */
{
	name: 'world'
}
```

This will log the value of `name` whenever it changes. If your devtools are open, changing `name` will pause execution and open the debugger.

You can debug multiple values simultaneously (`{@debug foo, bar, baz}`), or use `{@debug}` to pause execution whenever the surrounding markup is updated.

> Debug tags only have an effect when compiling with the `dev: true` compiler option.
