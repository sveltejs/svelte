---
title: Directives
---

Directives are element or component-level instructions to Svelte. They look like attributes, except with a `:` character.

### Event handlers

In most applications, you'll need to respond to the user's actions. In Svelte, this is done with the `on:[event]` directive.

```html
<!-- { title: 'Event handlers' } -->
<p>Count: {count}</p>
<button on:click="set({ count: count + 1 })">+1</button>
```

```json
/* { hidden: true } */
{
	count: 0
}
```

When the user clicks the button, Svelte calls `component.set(...)` with the provided arguments. You can call any method belonging to the component (whether [built-in](guide#component-api) or [custom](guide#custom-methods)), and any data property (or computed property) that's in scope:

```html
<!-- { title: 'Calling custom methods' } -->
<p>Select a category:</p>

{#each categories as category}
	<button on:click="select(category)">select {category}</button>
{/each}

<script>
	export default {
		data() {
			return {
				categories: [
					'animal',
					'vegetable',
					'mineral'
				]
			}
		},

		methods: {
			select(name) {
				alert(`selected ${name}`); // seriously, please don't do this
			}
		}
	};
</script>
```

You can also access the `event` object in the method call:

```html
<!-- { title: 'Accessing `event`' } -->
<div on:mousemove="set({ x: event.clientX, y: event.clientY })">
	coords: {x},{y}
</div>

<style>
	div {
		border: 1px solid purple;
		width: 100%;
		height: 100%;
	}
</style>
```

The target node can be referenced as `this`, meaning you can do this sort of thing:

```html
<!-- { title: 'Calling node methods' } -->
<input on:focus="this.select()" value="click to select">
```

### Custom events

You can define your own custom events to handle complex user interactions like dragging and swiping. See the earlier section on [custom event handlers](guide#custom-event-handlers) for more information.

### Component events

Events are an excellent way for [nested components](guide#nested-components) to communicate with their parents. Let's revisit our earlier example, but turn it into a `<CategoryChooser>` component:

```html
<!-- { filename: 'CategoryChooser.html', repl: false } -->
<p>Select a category:</p>

{#each categories as category}
	<button on:click="fire('select', { category })">select {category}</button>
{/each}

<script>
	export default {
		data() {
			return {
				categories: [
					'animal',
					'vegetable',
					'mineral'
				]
			}
		}
	};
</script>
```

When the user clicks a button, the component will fire a `select` event, where the `event` object has a `category` property. Any component that nests `<CategoryChooser>` can listen for events like so:

```html
<!--{ title: 'Component events' }-->
<CategoryChooser on:select="playTwentyQuestions(event.category)"/>

<script>
	import CategoryChooser from './CategoryChooser.html';

	export default {
		components: {
			CategoryChooser
		},

		methods: {
			playTwentyQuestions(category) {
				alert(`ok! you chose ${category}`);
			}
		}
	};
</script>
```

```html
<!--{ filename: 'CategoryChooser.html', hidden: true }-->
<p>Select a category:</p>

{#each categories as category}
	<button on:click="fire('select', { category })">select {category}</button>
{/each}

<script>
	export default {
		data() {
			return {
				categories: [
					'animal',
					'vegetable',
					'mineral'
				]
			}
		}
	};
</script>
```

Just as `this` in an element's event handler refers to the element itself, in a component event handler `this` refers to the component firing the event.

There is also a shorthand for listening for and re-firing an event unchanged.

```html
<!-- { repl: false } -->
<!-- these are equivalent -->
<Widget on:foo="fire('foo', event)"/>
<Widget on:foo/>
```

Since component events do not propagate as DOM events do, this can be used to pass events through intermediate components. This shorthand technique also applies to element events (`on:click` is equivalent to `on:click="fire('click', event)"`).

### Refs

Refs are a convenient way to store a reference to particular DOM nodes or components. Declare a ref with `ref:[name]`, and access it inside your component's methods with `this.refs.[name]`:

```html
<!-- { title: 'Refs' } -->
<canvas ref:canvas width=200 height=200></canvas>

<script>
	import createRenderer from './createRenderer.js';

	export default {
		oncreate() {
			const canvas = this.refs.canvas;
			const ctx = canvas.getContext('2d');

			const renderer = createRenderer(canvas, ctx);
			this.on('destroy', renderer.stop);
		}
	}
</script>
```

```js
/* { filename: 'createRenderer.js', hidden: true } */
export default function createRenderer(canvas, ctx) {
	let running = true;
	loop();

	return {
		stop: () => {
			running = false;
		}
	};

	function loop() {
		if (!running) return;
		requestAnimationFrame(loop);

		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		for (let p = 0; p < imageData.data.length; p += 4) {
			const i = p / 4;
			const x = i % canvas.width;
			const y = i / canvas.height >>> 0;

			const t = window.performance.now();

			const r = 64 + (128 * x / canvas.width) + (64 * Math.sin(t / 1000));
			const g = 64 + (128 * y / canvas.height) + (64 * Math.cos(t / 1000));
			const b = 128;

			imageData.data[p + 0] = r;
			imageData.data[p + 1] = g;
			imageData.data[p + 2] = b;
			imageData.data[p + 3] = 255;
		}

		ctx.putImageData(imageData, 0, 0);
	}
}
```

> Since only one element or component can occupy a given `ref`, don't use them in `{#each ...}` blocks. It's fine to use them in `{#if ...}` blocks however.

Note that you can use refs in your `<style>` blocks — see [Special selectors](guide#special-selectors).


### Transitions

Transitions allow elements to enter and leave the DOM gracefully, rather than suddenly appearing and disappearing.

```html
<!-- { title: 'Transitions' } -->
<input type=checkbox bind:checked=visible> visible

{#if visible}
	<p transition:fade>fades in and out</p>
{/if}

<script>
	import { fade } from 'svelte-transitions';

	export default {
		transitions: { fade }
	};
</script>
```

Transitions can have parameters — typically `delay` and `duration`, but often others, depending on the transition in question. For example, here's the `fly` transition from the [svelte-transitions](https://github.com/sveltejs/svelte-transitions) package:

```html
<!-- { title: 'Transition with parameters' } -->
<input type=checkbox bind:checked=visible> visible

{#if visible}
	<p transition:fly="{y: 200, duration: 1000}">flies 200 pixels up, slowly</p>
{/if}

<script>
	import { fly } from 'svelte-transitions';

	export default {
		transitions: { fly }
	};
</script>
```

An element can have separate `in` and `out` transitions:

```html
<!-- { title: 'Transition in/out' } -->
<input type=checkbox bind:checked=visible> visible

{#if visible}
	<p in:fly="{y: 50}" out:fade>flies up, fades out</p>
{/if}

<script>
	import { fade, fly } from 'svelte-transitions';

	export default {
		transitions: { fade, fly }
	};
</script>
```

Transitions are simple functions that take a `node` and any provided `parameters` and return an object with the following properties:

* `duration` — how long the transition takes in milliseconds
* `delay` — milliseconds before the transition starts
* `easing` — an [easing function](https://github.com/rollup/eases-jsnext)
* `css` — a function that accepts an argument `t` between 0 and 1 and returns the styles that should be applied at that moment
* `tick` — a function that will be called on every frame, with the same `t` argument, while the transition is in progress

Of these, `duration` is required, as is *either* `css` or `tick`. The rest are optional. Here's how the `fade` transition is implemented, for example:

```html
<!-- { title: 'Fade transition' } -->
<input type=checkbox bind:checked=visible> visible

{#if visible}
	<p transition:fade>fades in and out</p>
{/if}

<script>
	export default {
		transitions: {
			fade(node, { delay = 0, duration = 400 }) {
				const o = +getComputedStyle(node).opacity;

				return {
					delay,
					duration,
					css: t => `opacity: ${t * o}`
				};
			}
		}
	};
</script>
```

> If the `css` option is used, Svelte will create a CSS animation that runs efficiently off the main thread. Therefore if you can achieve an effect using `css` rather than `tick`, you should.


### Bindings

As we've seen, data can be passed down to elements and components with attributes and [props](guide#props). Occasionally, you need to get data back up; for that we use bindings.


#### Component bindings

Component bindings keep values in sync between a parent and a child:

```html
<!-- { repl: false } -->
<Widget bind:childValue=parentValue/>
```

Whenever `childValue` changes in the child component, `parentValue` will be updated in the parent component and vice versa.

If the names are the same, you can shorten the declaration:

```html
<!-- { repl: false } -->
<Widget bind:value/>
```

> Use component bindings judiciously. They can save you a lot of boilerplate, but will make it harder to reason about data flow within your application if you overuse them.


#### Element bindings

Element bindings make it easy to respond to user interactions:

```html
<!-- { title: 'Element bindings' } -->
<h1>Hello {name}!</h1>
<input bind:value=name>
```

```json
/* { hidden: true } */
{
	name: 'world'
}
```

Some bindings are *one-way*, meaning that the values are read-only. Most are *two-way* — changing the data programmatically will update the DOM. The following bindings are available:

| Name                                                            | Applies to                                   | Kind                 |
|-----------------------------------------------------------------|----------------------------------------------|----------------------|
| `value`                                                         | `<input>` `<textarea>` `<select>`            | <span>Two-way</span> |
| `checked`                                                       | `<input type=checkbox>`                      | <span>Two-way</span> |
| `group` (see note)                                              | `<input type=checkbox>` `<input type=radio>` | <span>Two-way</span> |
| `currentTime` `paused` `played` `volume`                        | `<audio>` `<video>`                          | <span>Two-way</span> |
| `buffered` `duration` `seekable`                                | `<audio>` `<video>`                          | <span>One-way</span> |
| `offsetWidth` `offsetHeight` `clientWidth` `clientHeight`       | All block-level elements                     | <span>One-way</span> |
| `scrollX` `scrollY`                                             | `<svelte:window>`                            | <span>Two-way</span> |
| `online` `innerWidth` `innerHeight` `outerWidth` `outerHeight`  | `<svelte:window>`                            | <span>One-way</span> |

> 'group' bindings allow you to capture the current value of a [set of radio inputs](repl?demo=binding-input-radio), or all the selected values of a [set of checkbox inputs](repl?demo=binding-input-checkbox-group).

Here is a complete example of using two way bindings with a form:

```html
<!-- { title: 'Form bindings' } -->
<form on:submit="handleSubmit(event)">
	<input bind:value=name type=text>
	<button type=submit>Say hello</button>
</form>

<script>
	export default {
		methods: {
			handleSubmit(event) {
				// prevent the page from reloading
				event.preventDefault();

				const { name } = this.get();
				alert(`Hello ${name}!`);
			}
		}
	};
</script>
```

```json
/* { hidden: true } */
{
	name: "world"
}
```

### Actions

Actions let you decorate elements with additional functionality. Actions are functions which may return an object with lifecycle methods, `update` and `destroy`. The action will be called when its element is added to the DOM.

Use actions for things like:
* tooltips
* lazy loading images as the page is scrolled, e.g. `<img use:lazyload data-src='giant-photo.jpg'/>`
* capturing link clicks for your client router
* adding drag and drop

```html
<!-- { title: 'Actions' } -->
<button on:click="toggleLanguage()" use:tooltip="translations[language].tooltip">
	{language}
</button>

<script>
	export default {
		actions: {
			tooltip(node, text) {
				const tooltip = document.createElement('div');
				tooltip.textContent = text;

				Object.assign(tooltip.style, {
					position: 'absolute',
					background: 'black',
					color: 'white',
					padding: '0.5em 1em',
					fontSize: '12px',
					pointerEvents: 'none',
					transform: 'translate(5px, -50%)',
					borderRadius: '2px',
					transition: 'opacity 0.4s'
				});

				function position() {
					const { top, right, bottom } = node.getBoundingClientRect();
					tooltip.style.top = `${(top + bottom) / 2}px`;
					tooltip.style.left = `${right}px`;
				}

				function append() {
					document.body.appendChild(tooltip);
					tooltip.style.opacity = 0;
					setTimeout(() => tooltip.style.opacity = 1);
					position();
				}

				function remove() {
					tooltip.remove();
				}

				node.addEventListener('mouseenter', append);
				node.addEventListener('mouseleave', remove);

				return {
					update(text) {
						tooltip.textContent = text;
						position();
					},

					destroy() {
						tooltip.remove();
						node.removeEventListener('mouseenter', append);
						node.removeEventListener('mouseleave', remove);
					}
				}
			}
		},

		methods: {
			toggleLanguage() {
				const { language } = this.get();

				this.set({
					language: language === 'english' ? 'latin' : 'english'
				});
			}
		}
	};
</script>
```

```json
/* { hidden: true } */
{
	language: "english",
	translations: {
		english: {
			tooltip: "Switch Languages",
		},
		latin: {
			tooltip: "Itchsway Anguageslay",
		},
	}
}
```

### Classes

Classes let you toggle element classes on and off. To use classes add the directive `class` followed by a colon and the class name you want toggled (`class:the-class-name="anExpression"`). The expression inside the directive's quotes will be evaluated and toggle the class on and off depending on the truthiness of the expression's result. You can only add class directives to elements.

This example adds the class `active` to `<li>` elements when the `url` property matches the path their links target.

```html
<!-- { title: 'Classes' } -->
<ul class="links">
	<li class:active="url === '/'"><a href="/" on:click="goto(event)">Home</a></li>
	<li class:active="url.startsWith('/blog')"><a href="/blog/" on:click="goto(event)">Blog</a></li>
	<li class:active="url.startsWith('/about')"><a href="/about/" on:click="goto(event)">About</a></li>
</ul>

<script>
	export default {
		methods: {
			goto(event) {
				event.preventDefault();
				this.set({ url: event.target.pathname });
			}
		}
	}
</script>

<style>
	.links {
		list-style: none;
	}
	.links li {
		float: left;
		padding: 10px;
	}
	/* classes added this way are processed with encapsulated styles, no need for :global() */
	.active {
		background: #eee;
	}
</style>
```

```json
/* { hidden: true } */
{
	"url": "/"
}
```

Classes will work with an existing class attribute on your element. If you find yourself adding multiple ternary statements inside a class attribute, classes can simplify your component. Classes are recognized by the compiler and <a href="guide#scoped-styles">scoped correctly</a>.

If your class name is the same as a property in your component's state, you can use the shorthand of a class binding which drops the expression (`class:myProp`).

Note that class names with dashes in them do not usually make good shorthand classes since the property will also need a dash in it. The example below uses a computed property to make working with this easier, but it may be easier to not use the shorthand in cases like this.

```html
<!-- { title: 'Classes shorthand' } -->
<div class:active class:is-selected class:isAdmin>
	<p>Active? {active}</p>
	<p>Selected? {isSelected}</p>
</div>
<button on:click="set({ active: !active })">Toggle Active</button>
<button on:click="set({ isSelected: !isSelected })">Toggle Selected</button>
<button on:click="set({ isAdmin: !isAdmin })">Toggle Admin</button>

<script>
export default {
	computed: {
		// Because shorthand relfects the var name, you must use component.set({ "is-selected": true }) or use a computed
		// property like this. It might be better to avoid shorthand for class names which are not valid variable names.
		"is-selected": ({ isSelected }) => isSelected
	}
}
</script>

<style>
	div {
		width: 300px;
		border: 1px solid #ccc;
		background: #eee;
		margin-bottom: 10px;
	}
	.active {
		background: #fff;
	}
	.is-selected {
		border-color: #99bbff;
		box-shadow: 0 0 6px #99bbff;
	}
	.isAdmin {
		outline: 2px solid red;
	}
</style>
```

```json
/* { hidden: true } */
{
	"active": true,
	"isSelected": false,
	"isAdmin": false,
}
```