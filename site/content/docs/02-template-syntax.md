---
title: Template syntax
---


### Tags

---

A lowercase tag, like `<div>`, denotes a regular HTML element. A capitalised tag, such as `<Widget>` or `<Namespace.Widget>`, indicates a *component*.

```html
<script>
	import Widget from './Widget.svelte';
</script>

<div>
	<Widget/>
</div>
```


### Attributes

---

By default, attributes work exactly like their HTML counterparts.

```html
<div class="foo">
	<button disabled>can't touch this</button>
</div>
```

---

As in HTML, values may be unquoted.

```html
<input type=checkbox>
```

---

Attribute values can contain JavaScript expressions.

```html
<a href="page/{p}">page {p}</a>
```

---

Or they can *be* JavaScript expressions.

```html
<button disabled={!clickable}>...</button>
```

---

An expression might include characters that would cause syntax highlighting to fail in regular HTML, so quoting the value is permitted. The quotes do not affect how the value is parsed:

```html
<button disabled="{number !== 42}">...</button>
```

---

When the attribute name and value match (`name={name}`), they can be replaced with `{name}`.

```html
<!-- These are equivalent -->
<button disabled={disabled}>...</button>
<button {disabled}>...</button>
```

---

*Spread attributes* allow many attributes or properties to be passed to an element or component at once.

An element or component can have multiple spread attributes, interspersed with regular ones.

```html
<Widget {...things}/>
```


### Text expressions

```sv
{expression}
```

---

Text can also contain JavaScript expressions:

```html
<h1>Hello {name}!</h1>
<p>{a} + {b} = {a + b}.</p>
```


### {#if ...}

```sv
{#if expression}...{/if}
```
```sv
{#if expression}...{:else if expression}...{/if}
```
```sv
{#if expression}...{:else}...{/if}
```

---

Content that is conditionally rendered can be wrapped in an if block.

```html
{#if answer === 42}
	<p>what was the question?</p>
{/if}
```

---

Additional conditions can be added with `{:else if expression}`, optionally ending in an `{:else}` clause.

```html
{#if porridge.temperature > 100}
	<p>too hot!</p>
{:else if 80 > porridge.temperature}
	<p>too cold!</p>
{:else}
	<p>just right!</p>
{/if}
```


### {#each ...}

```sv
{#each expression as name}...{/each}
```
```sv
{#each expression as name, index}...{/each}
```
```sv
{#each expression as name, index (key)}...{/each}
```
```sv
{#each expression as name}...{:else}...{/each}
```

---

Iterating over lists of values can be done with an each block.

```html
<h1>Shopping list</h1>
<ul>
	{#each items as item}
		<li>{item.name} x {item.qty}</li>
	{/each}
</ul>
```

---

An each block can also specify an *index*, equivalent to the second argument in an `array.map(...)` callback:

```html
{#each items as item, i}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

---

If a *key* expression is provided — which must uniquely identify each list item — Svelte will use it to diff the list when data changes, rather than adding or removing items at the end. The key can be any object, but strings and numbers are recommended since they allow identity to persist when the objects themselves change.

```html
{#each items as item, i (item.id)}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

---

You can freely use destructuring patterns in each blocks.

```html
{#each items as { id, name, qty }, i (id)}
	<li>{i + 1}: {name} x {qty}</li>
{/each}
```

---

An each block can also have an `{:else}` clause, which is rendered if the list is empty.

```html
{#each todos as todo}
	<p>{todo.text}</p>
{:else}
	<p>No tasks today!</p>
{/each}
```


### {#await ...}

```sv
{#await expression}...{:then name}...{:catch name}...{/await}
```
```sv
{#await expression}...{:then name}...{/await}
```
```sv
{#await expression then name}...{/await}
```

---

Await blocks allow you to branch on the three possible states of a Promise — pending, fulfilled or rejected.

```html
{#await promise}
	<!-- promise is pending -->
	<p>waiting for the promise to resolve...</p>
{:then value}
	<!-- promise was fulfilled -->
	<p>The value is {value}</p>
{:catch error}
	<!-- promise was rejected -->
	<p>Something went wrong: {error.message}</p>
{/await}
```

---

The `catch` block can be omitted if you don't need to render anything when the promise rejects (or no error is possible).

```html
{#await promise}
	<!-- promise is pending -->
	<p>waiting for the promise to resolve...</p>
{:then value}
	<!-- promise was fulfilled -->
	<p>The value is {value}</p>
{/await}
```

---

If you don't care about the pending state, you can also omit the initial block.

```html
{#await promise then value}
	<p>The value is {value}</p>
{/await}
```


### {@html ...}

```sv
{@html expression}
```

---

In a text expression, characters like `<` and `>` are escaped. With HTML expressions, they're not.

> Svelte does not sanitize expressions before injecting HTML. If the data comes from an untrusted source, you must sanitize it, or you are exposing your users to an XSS vulnerability.

```html
<div class="blog-post">
	<h1>{post.title}</h1>
	{@html post.content}
</div>
```


### {@debug ...}

```sv
{@debug}
```
```sv
{@debug var1, var2, ..., varN}
```

---

The `{@debug ...}` tag offers an alternative to `console.log(...)`. It logs the values of specific variables whenever they change, and pauses code execution if you have devtools open.

It accepts a comma-separated list of variable names (not arbitrary expressions).

```html
<script>
	let user = {
		firstname: 'Ada',
		lastname: 'Lovelace'
	};
</script>

{@debug user}

<h1>Hello {user.firstname}!</h1>
```

---

`{@debug ...}` accepts a comma-separated list of variable names (not arbitrary expressions).

```html
<!-- Compiles -->
{@debug user}
{@debug user1, user2, user3}

<!-- WON'T compile -->
{@debug user.firstname}
{@debug myArray[0]}
{@debug !isReady}
{@debug typeof user === 'object'}
```

The `{@debug}` tag without any arguments will insert a `debugger` statement that gets triggered when *any* state changes, as opposed to the specified variables.



### Element directives

As well as attributes, elements can have *directives*, which control the element's behaviour in some way.


#### [on:*eventname*](on_component_event)

```sv
on:eventname={handler}
```
```sv
on:eventname|modifiers={handler}
```

---

Use the `on:` directive to listen to DOM events.

```html
<script>
	let count = 0;

	function handleClick(event) {
		count += 1;
	}
</script>

<button on:click={handleClick}>
	count: {count}
</button>
```

---

Handlers can be declared inline with no performance penalty. As with attributes, directive values may be quoted for the sake of syntax highlighters.

```html
<button on:click="{() => count += 1}">
	count: {count}
</button>
```

---

Add *modifiers* to DOM events with the `|` character.

```html
<form on:submit|preventDefault={handleSubmit}>
	<!-- the `submit` event's default is prevented,
	     so the page won't reload -->
</form>
```

The following modifiers are available:

* `preventDefault` — calls `event.preventDefault()` before running the handler
* `stopPropagation` — calls `event.stopPropagation()`, preventing the event reaching the next element
* `passive` — improves scrolling performance on touch/wheel events (Svelte will add it automatically where it's safe to do so)
* `capture` — fires the handler during the *capture* phase instead of the *bubbling* phase
* `once` — remove the handler after the first time it runs

Modifiers can be chained together, e.g. `on:click|once|capture={...}`.

---

If the `on:` directive is used without a value, the component will *forward* the event, meaning that a consumer of the component can listen for it.

```html
<button on:click>
	The component itself will emit the click event
</button>
```

---

It's possible to have multiple event listeners for the same event:

```html
<script>
	let counter = 0;
	function increment() {
		counter = counter + 1;
	}

	function track(event) {
		trackEvent(event)
	}
</script>

<button on:click={increment} on:click={track}>Click me!</button>
```

#### [bind:*property*](bind_element_property)

```sv
bind:property={variable}
```

---

Data ordinarily flows down, from parent to child. The `bind:` directive allows data to flow the other way, from child to parent. Most bindings are specific to particular elements.

The simplest bindings reflect the value of a property, such as `input.value`.

```html
<input bind:value={name}>
<textarea bind:value={text}></textarea>

<input type="checkbox" bind:checked={yes}>
```

---

If the name matches the value, you can use a shorthand.

```html
<!-- These are equivalent -->
<input bind:value={value}>
<input bind:value>
```

---

Numeric input values are coerced; even though `input.value` is a string as far as the DOM is concerned, Svelte will treat it as a number. If the input is empty or invalid (in the case of `type="number"`), the value is `undefined`.

```html
<input type="number" bind:value={num}>
<input type="range" bind:value={num}>
```


##### Binding `<select>` value

---

A `<select>` value binding corresponds to the `value` property on the selected `<option>`, which can be any value (not just strings, as is normally the case in the DOM).

```html
<select bind:value={selected}>
	<option value={a}>a</option>
	<option value={b}>b</option>
	<option value={c}>c</option>
</select>
```

---

A `<select multiple>` element behaves similarly to a checkbox group.

```html
<select multiple bind:value={fillings}>
	<option value="Rice">Rice</option>
	<option value="Beans">Beans</option>
	<option value="Cheese">Cheese</option>
	<option value="Guac (extra)">Guac (extra)</option>
</select>
```

---

When the value of an `<option>` matches its text content, the attribute can be omitted.

```html
<select multiple bind:value={fillings}>
	<option>Rice</option>
	<option>Beans</option>
	<option>Cheese</option>
	<option>Guac (extra)</option>
</select>
```

##### Media element bindings

---

Media elements (`<audio>` and `<video>`) have their own set of bindings — four *readonly* ones...

* `duration` (readonly) — the total duration of the video, in seconds
* `buffered` (readonly) — an array of `{start, end}` objects
* `seekable` (readonly) — ditto
* `played` (readonly) — ditto

...and three *two-way* bindings:

* `currentTime` — the current point in the video, in seconds
* `paused` — this one should be self-explanatory
* `volume` — a value between 0 and 1

```html
<video
	src={clip}
	bind:duration
	bind:buffered
	bind:seekable
	bind:played
	bind:currentTime
	bind:paused
	bind:volume
></video>
```

##### Block-level element bindings

---

Block-level elements have 4 readonly bindings, measured using a technique similar to [this one](http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/):

* `clientWidth`
* `clientHeight`
* `offsetWidth`
* `offsetHeight`

```html
<div
	bind:offsetWidth={width}
	bind:offsetHeight={height}
>
	<Chart {width} {height}/>
</div>
```

#### bind:group

```sv
bind:group={variable}
```

---

Inputs that work together can use `bind:group`.

```html
<script>
	let tortilla = 'Plain';
	let fillings = [];
</script>

<!-- grouped radio inputs are mutually exclusive -->
<input type="radio" bind:group={tortilla} value="Plain">
<input type="radio" bind:group={tortilla} value="Whole wheat">
<input type="radio" bind:group={tortilla} value="Spinach">

<!-- grouped checkbox inputs populate an array -->
<input type="checkbox" bind:group={fillings} value="Rice">
<input type="checkbox" bind:group={fillings} value="Beans">
<input type="checkbox" bind:group={fillings} value="Cheese">
<input type="checkbox" bind:group={fillings} value="Guac (extra)">
```

#### [bind:this](bind_element)

```sv
bind:this={dom_node}
```

---

To get a reference to a DOM node, use `bind:this`.

```html
<script>
	import { onMount } from 'svelte';

	let canvasElement;

	onMount(() => {
		const ctx = canvasElement.getContext('2d');
		drawStuff(ctx);
	});
</script>

<canvas bind:this={canvasElement}></canvas>
```


#### class:*name*

```sv
class:name={value}
```
```sv
class:name
```

---

A `class:` directive provides a shorter way of toggling a class on an element.

```html
<!-- These are equivalent -->
<div class="{active ? 'active' : ''}">...</div>
<div class:active={active}>...</div>

<!-- Shorthand, for when name and value match -->
<div class:active>...</div>

<!-- Multiple class toggles can be included -->
<div class:active class:inactive={!active} class:isAdmin>...</div>
```


#### use:*action*

```sv
use:action
```
```sv
use:action={parameters}
```

```js
action = (node: HTMLElement, parameters: any) => {
	update?: (parameters: any) => void,
	destroy?: () => void
}
```

---

Actions are functions that are called when an element is created. They can return an object with a `destroy` method that is called after the element is unmounted:

```html
<script>
	function foo(node) {
		// the node has been mounted in the DOM

		return {
			destroy() {
				// the node has been removed from the DOM
			}
		};
	}
</script>

<div use:foo></div>
```

---

An action can have parameters. If the returned value has an `update` method, it will be called whenever those parameters change, immediately after Svelte has applied updates to the markup.

> Don't worry about the fact that we're redeclaring the `foo` function for every component instance — Svelte will hoist any functions that don't depend on local state out of the component definition.

```html
<script>
	export let bar;

	function foo(node, bar) {
		// the node has been mounted in the DOM

		return {
			update(bar) {
				// the value of `bar` has changed
			},

			destroy() {
				// the node has been removed from the DOM
			}
		};
	}
</script>

<div use:foo={bar}></div>
```


#### transition:*fn*

```sv
transition:fn
```
```sv
transition:fn={params}
```
```sv
transition:fn|local
```
```sv
transition:fn|local={params}
```


```js
transition = (node: HTMLElement, params: any) => {
	delay?: number,
	duration?: number,
	easing?: (t: number) => number,
	css?: (t: number, u: number) => string,
	tick?: (t: number, u: number) => void
}
```

---

A transition is triggered by an element entering or leaving the DOM as a result of a state change.

Elements inside an *outroing* block are kept in the DOM until all current transitions have completed.

The `transition:` directive indicates a *bidirectional* transition, which means it can be smoothly reversed while the transition is in progress.

```html
{#if visible}
	<div transition:fade>
		fades in and out
	</div>
{/if}
```

> By default intro transitions will not play on first render. You can modify this behaviour by setting `intro: true` when you [create a component](docs#Client-side_component_API).

##### Transition parameters

---

Like actions, transitions can have parameters.

(The double `{{curlies}}` aren't a special syntax; this is an object literal inside an expression tag.)

```html
{#if visible}
	<div transition:fade="{{ duration: 2000 }}">
		flies in, fades out over two seconds
	</div>
{/if}
```

##### Custom transition functions

---

Transitions can use custom functions. If the returned object has a `css` function, Svelte will create a CSS animation that plays on the element.

The `t` argument passed to `css` is a value between `0` and `1` after the `easing` function has been applied. *In* transitions run from `0` to `1`, *out* transitions run from `1` to `0` — in other words `1` is the element's natural state, as though no transition had been applied. The `u` argument is equal to `1 - t`.

The function is called repeatedly *before* the transition begins, with different `t` and `u` arguments.

```html
<script>
	import { elasticOut } from 'svelte/easing';

	export let visible;

	function whoosh(node, params) {
		const existingTransform = getComputedStyle(node).transform.replace('none', '');

		return {
			delay: params.delay || 0,
			duration: params.duration || 400,
			easing: params.easing || elasticOut,
			css: (t, u) => `transform: ${existingTransform} scale(${t})`
		};
	}
</script>

{#if visible}
	<div in:whoosh>
		whooshes in
	</div>
{/if}
```

---

A custom transition function can also return a `tick` function, which is called *during* the transition with the same `t` and `u` arguments.

> If it's possible to use `css` instead of `tick`, do so — CSS animations can run off the main thread, preventing jank on slower devices.

```html
<script>
	export let visible = false;

	function typewriter(node, { speed = 50 }) {
		const valid = (
			node.childNodes.length === 1 &&
			node.childNodes[0].nodeType === 3
		);

		if (!valid) return {};

		const text = node.textContent;
		const duration = text.length * speed;

		return {
			duration,
			tick: (t, u) => {
				const i = ~~(text.length * t);
				node.textContent = text.slice(0, i);
			}
		};
	}
</script>

{#if visible}
	<p in:typewriter="{{ speed: 20 }}">
		The quick brown fox jumps over the lazy dog
	</p>
{/if}
```

If a transition returns a function instead of a transition object, the function will be called in the next microtask. This allows multiple transitions to coordinate, making [crossfade effects](tutorial/deferred-transitions) possible.


##### Transition events

---

An element with transitions will dispatch the following events in addition to any standard DOM events:

* `introstart`
* `introend`
* `outrostart`
* `outroend`

```html
{#if visible}
	<p
		transition:fly="{{ y: 200, duration: 2000 }}"
		on:introstart="{() => status = 'intro started'}"
		on:outrostart="{() => status = 'outro started'}"
		on:introend="{() => status = 'intro ended'}"
		on:outroend="{() => status = 'outro ended'}"
	>
		Flies in and out
	</p>
{/if}
```

---

Local transitions only play when the block they belong to is created or destroyed, *not* when parent blocks are created or destroyed.

```html
{#if x}
	{#if y}
		<p transition:fade>
			fades in and out when x or y change
		</p>

		<p transition:fade|local>
			fades in and out only when y changes
		</p>
	{/if}
{/if}
```


#### in:*fn*/out:*fn*

```sv
in:fn
```
```sv
in:fn={params}
```
```sv
in:fn|local
```
```sv
in:fn|local={params}
```

```sv
out:fn
```
```sv
out:fn={params}
```
```sv
out:fn|local
```
```sv
out:fn|local={params}
```

---

Similar to `transition:`, but only applies to elements entering (`in:`) or leaving (`out:`) the DOM.

Unlike with `transition:`, transitions applied with `in:` and `out:` are not bidirectional — an in transition will continue to 'play' alongside the out transition, rather than reversing, if the block is outroed while the transition is in progress. If an out transition is aborted, transitions will restart from scratch.

```html
{#if visible}
	<div in:fly out:fade>
		flies in, fades out
	</div>
{/if}
```



#### animate:

```sv
animate:name
```

```sv
animate:name={params}
```

```js
animation = (node: HTMLElement, { from: DOMRect, to: DOMRect } , params: any) => {
	delay?: number,
	duration?: number,
	easing?: (t: number) => number,
	css?: (t: number, u: number) => string,
	tick?: (t: number, u: number) => void
}
```

```js
DOMRect {
	bottom: number,
	height: number,
	​​left: number,
	right: number,
	​top: number,
	width: number,
	x: number,
	y:number
}
```

---

An animation is triggered when the contents of a [keyed each block](docs#Each_blocks) are re-ordered. Animations do not run when an element is removed, only when the each block's data is reordered. Animate directives must be on an element that is an *immediate* child of a keyed each block.

Animations can be used with Svelte's [built-in animation functions](docs#svelte_animate) or [custom animation functions](docs#Custom_animation_functions).

```html
<!-- When `list` is reordered the animation will run-->
{#each list as item, index (item)}
	<li animate:flip>{item}</li>
{/each}
```

##### Animation Parameters

---

As with actions and transitions, animations can have parameters.

(The double `{{curlies}}` aren't a special syntax; this is an object literal inside an expression tag.)

```html
{#each list as item, index (item)}
	<li animate:flip="{{ delay: 500 }}">{item}</li>
{/each}
```

##### Custom animation functions

---

Animations can use custom functions that provide the `node`, an `animation` object and any `paramaters` as arguments. The `animation` parameter is an object containing `from` and `to` properties each containing a [DOMRect](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect#Properties) describing the geometry of the element in its `start` and `end` positions. The `from` property is the DOMRect of the element in its starting position, the `to` property is the DOMRect of the element in its final position after the list has been reordered and the DOM updated.

If the returned object has a `css` method, Svelte will create a CSS animation that plays on the element.

The `t` argument passed to `css` is a value that goes from `0` and `1` after the `easing` function has been applied. The `u` argument is equal to `1 - t`.

The function is called repeatedly *before* the animation begins, with different `t` and `u` arguments.


```html
<script>
	import { cubicOut } from 'svelte/easing';

	function whizz(node, { from, to }, params) {

		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const d = Math.sqrt(dx * dx + dy * dy);

		return {
			delay: 0,
			duration: Math.sqrt(d) * 120,
			easing: cubicOut,
			css: (t, u) =>
				`transform: translate(${u * dx}px, ${u * dy}px) rotate(${t*360}deg);`
		};
	}
</script>

{#each list as item, index (item)}
	<div animate:whizz>{item}</div>
{/each}
```

---


A custom animation function can also return a `tick` function, which is called *during* the animation with the same `t` and `u` arguments.

> If it's possible to use `css` instead of `tick`, do so — CSS animations can run off the main thread, preventing jank on slower devices.

```html
<script>
	import { cubicOut } from 'svelte/easing';

	function whizz(node, { from, to }, params) {

		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const d = Math.sqrt(dx * dx + dy * dy);

		return {
		delay: 0,
		duration: Math.sqrt(d) * 120,
		easing: cubicOut,
		tick: (t, u) =>
			Object.assign(node.style, {
				color: t > 0.5 ? 'Pink' : 'Blue'
			});
	};
	}
</script>

{#each list as item, index (item)}
	<div animate:whizz>{item}</div>
{/each}
```

### Component directives

#### [on:*eventname*](on_component_event)

```sv
on:eventname={handler}
```

---

Components can emit events using [createEventDispatcher](docs#createEventDispatcher), or by forwarding DOM events. Listening for component events looks the same as listening for DOM events:

```html
<SomeComponent on:whatever={handler}/>
```

---

As with DOM events, if the `on:` directive is used without a value, the component will *forward* the event, meaning that a consumer of the component can listen for it.

```html
<SomeComponent on:whatever/>
```


#### [bind:*property*](bind_component_property)

```sv
bind:property={variable}
```

---

You can bind to component props using the same mechanism.

```html
<Keypad bind:value={pin}/>
```

#### [bind:this](bind_component)

```sv
bind:this={component_instance}
```

---

Components also support `bind:this`, allowing you to interact with component instances programmatically.

> Note that we can't do `{cart.empty}` since `cart` is `undefined` when the button is first rendered and throws an error.

```html
<ShoppingCart bind:this={cart}/>

<button on:click={() => cart.empty()}>
	Empty shopping cart
</button>
```



### `<slot>`

```sv
<slot><!-- optional fallback --></slot>
```
```sv
<slot name="x"><!-- optional fallback --></slot>
```
```sv
<slot prop={value}></slot>
```

---

Components can have child content, in the same way that elements can.

The content is exposed in the child component using the `<slot>` element, which can contain fallback content that is rendered if no children are provided.

```html
<!-- App.svelte -->
<Widget>
	<p>this is some child content</p>
</Widget>

<!-- Widget.svelte -->
<div>
	<slot>
		this will be rendered if someone does <Widget/>
	</slot>
</div>
```

#### [`<slot name="`*name*`">`](slot_name)

---

Named slots allow consumers to target specific areas. They can also have fallback content.

```html
<!-- App.svelte -->
<Widget>
	<h1 slot="header">Hello</h1>
	<p slot="footer">Copyright (c) 2019 Svelte Industries</p>
</Widget>

<!-- Widget.svelte -->
<div>
	<slot name="header">No header was provided</slot>
	<p>Some content between header and footer</p>
	<slot name="footer"></slot>
</div>
```

#### [`<slot let:`*name*`={`*value*`}>`](slot_let)

---

Slots can be rendered zero or more times, and can pass values *back* to the parent using props. The parent exposes the values to the slot template using the `let:` directive.

The usual shorthand rules apply — `let:item` is equivalent to `let:item={item}`, and `<slot {item}>` is equivalent to `<slot item={item}>`.

```html
<!-- App.svelte -->
<FancyList {items} let:item={item}>
	<div>{item.text}</div>
</FancyList>

<!-- FancyList.svelte -->
<ul>
	{#each items as item}
		<li class="fancy">
			<slot item={item}></slot>
		</li>
	{/each}
</ul>
```

---

Named slots can also expose values. The `let:` directive goes on the element with the `slot` attribute.

```html
<!-- App.svelte -->
<FancyList {items}>
	<div slot="item" let:item={item}>{item.text}</div>
	<p slot="footer">Copyright (c) 2019 Svelte Industries</p>
</FancyList>

<!-- FancyList.svelte -->
<ul>
	{#each items as item}
		<li class="fancy">
			<slot name="item" item={item}></slot>
		</li>
	{/each}
</ul>

<slot name="footer"></slot>
```


### `<svelte:self>`

---

The `<svelte:self>` element allows a component to include itself, recursively.

It cannot appear at the top level of your markup; it must be inside an if or each block to prevent an infinite loop.

```html
<script>
	export let count;
</script>

{#if count > 0}
	<p>counting down... {count}</p>
	<svelte:self count="{count - 1}"/>
{:else}
	<p>lift-off!</p>
{/if}
```

### `<svelte:component>`

```sv
<svelte:component this={expression}>
```

---

The `<svelte:component>` element renders a component dynamically, using the component constructor specified as the `this` property. When the property changes, the component is destroyed and recreated.

If `this` is falsy, no component is rendered.

```html
<svelte:component this={currentSelection.component} foo={bar}/>
```


### `<svelte:window>`

```sv
<svelte:window on:event={handler}/>
```
```sv
<svelte:window bind:prop={value}/>
```

---

The `<svelte:window>` element allows you to add event listeners to the `window` object without worrying about removing them when the component is destroyed, or checking for the existence of `window` when server-side rendering.

```html
<script>
	function handleKeydown(event) {
		alert(`pressed the ${event.key} key`);
	}
</script>

<svelte:window on:keydown={handleKeydown}/>
```

---

You can also bind to the following properties:

* `innerWidth`
* `innerHeight`
* `outerWidth`
* `outerHeight`
* `scrollX`
* `scrollY`
* `online` — an alias for window.navigator.onLine

All except `scrollX` and `scrollY` are readonly.

```html
<svelte:window bind:scrollY={y}/>
```


### `<svelte:body>`

```sv
<svelte:body on:event={handler}/>
```

---

As with `<svelte:window>`, this element allows you to add listeners to events on `document.body`, such as `mouseenter` and `mouseleave` which don't fire on `window`.

```html
<svelte:body
	on:mouseenter={handleMouseenter}
	on:mouseleave={handleMouseleave}
/>
```


### `<svelte:head>`

```sv
<svelte:head>
```

---

This element makes it possible to insert elements into `document.head`. During server-side rendering, `head` content exposed separately to the main `html` content.

```html
<svelte:head>
	<link rel="stylesheet" href="tutorial/dark-theme.css">
</svelte:head>
```


### `<svelte:options>`

```sv
<svelte:options option={value}>
```

---

The `<svelte:options>` element provides a place to specify per-component compiler options, which are detailed in the [compiler section](docs#svelte_compile). The possible options are:

* `immutable={true}` — you never use mutable data, so the compiler can do simple referential equality checks to determine if values have changed
* `immutable={false}` — the default. Svelte will be more conservative about whether or not mutable objects have changed
* `accessors={true}` — adds getters and setters for the component's props
* `accessors={false}` — the default
* `namespace="..."` — the namespace where this component will be used, most commonly "svg"
* `tag="..."` — the name to use when compiling this component as a custom element

```html
<svelte:options tag="my-custom-element"/>
```