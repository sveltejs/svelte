---
title: Bindings
---


### Bindings

As we've seen, data can be passed down to elements and components with attributes and [props](docs#props). Occasionally, you need to get data back *up*; for that we use bindings.


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
<input bind:value={name}>
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
| `checked` `indeterminate`                                       | `<input type=checkbox>`                      | <span>Two-way</span> |
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

> 'two way' bindings allow you to update a value in a nested property as seen in [this checkbox input example](repl?demo=binding-input-checkbox).


### bind:this

There's a special binding that exists on all elements and components — `this`. It allows you to store a reference to a DOM node or component instance so that you can interact with it programmatically:

```html
<!-- { title: 'Refs' } -->
<canvas bind:this={canvas} width={200} height={200}></canvas>

<script>
	import { onMount } from 'svelte';
	import createRenderer from './createRenderer.js';

	let canvas;

	onMount(() => {
		const ctx = canvas.getContext('2d');
		const renderer = createRenderer(canvas, ctx);

		// stop updating the canvas when
		// the component is destroyed
		return renderer.stop;
	});
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
