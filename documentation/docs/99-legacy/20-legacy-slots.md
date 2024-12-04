---
title: <slot>
---

In Svelte 5, content can be passed to components in the form of [snippets](snippet) and rendered using [render tags](@render).

In legacy mode, content inside component tags is considered _slotted content_, which can be rendered by the component using a `<slot>` element:

```svelte
<!--- file: App.svelte --->
<script>
	import Modal from './Modal.svelte';
</script>

<Modal>This is some slotted content</Modal>
```

```svelte
<!--- file: Modal.svelte --->
<div class="modal">
	<slot></slot>
</div>
```

> [!NOTE] If you want to render a regular `<slot>` element, you can use `<svelte:element this={'slot'} />`.

## Named slots

A component can have _named_ slots in addition to the default slot. On the parent side, add a `slot="..."` attribute to an element, component or [`<svelte:fragment>`](legacy-svelte-fragment) directly inside the component tags.

```svelte
<!--- file: App.svelte --->
<script>
	import Modal from './Modal.svelte';

	let open = true;
</script>

{#if open}
	<Modal>
		This is some slotted content

		+++<div slot="buttons">+++
			<button on:click={() => open = false}>
				close
			</button>
		+++</div>+++
	</Modal>
{/if}
```

On the child side, add a corresponding `<slot name="...">` element:

```svelte
<!--- file: Modal.svelte --->
<div class="modal">
	<slot></slot>
	<hr>
	+++<slot name="buttons"></slot>+++
</div>
```

## Fallback content

If no slotted content is provided, a component can define fallback content by putting it inside the `<slot>` element:

```svelte
<slot>
	This will be rendered if no slotted content is provided
</slot>
```

## Passing data to slotted content

Slots can be rendered zero or more times and can pass values _back_ to the parent using props. The parent exposes the values to the slot template using the `let:` directive.

```svelte
<!--- file: FancyList.svelte --->
<ul>
	{#each items as data}
		<li class="fancy">
			<!-- 'item' here... -->
			<slot item={process(data)} />
		</li>
	{/each}
</ul>
```

```svelte
<!--- file: App.svelte --->
<!-- ...corresponds to 'item' here: -->
<FancyList {items} let:item={processed}>
	<div>{processed.text}</div>
</FancyList>
```

The usual shorthand rules apply — `let:item` is equivalent to `let:item={item}`, and `<slot {item}>` is equivalent to `<slot item={item}>`.

Named slots can also expose values. The `let:` directive goes on the element with the `slot` attribute.

```svelte
<!--- file: FancyList.svelte --->
<ul>
	{#each items as item}
		<li class="fancy">
			<slot name="item" item={process(data)} />
		</li>
	{/each}
</ul>

<slot name="footer" />
```

```svelte
<!--- file: App.svelte --->
<FancyList {items}>
	<div slot="item" let:item>{item.text}</div>
	<p slot="footer">Copyright (c) 2019 Svelte Industries</p>
</FancyList>
```


