---
title: {#portal ...} / {@portal ...}
tags: template-portal
---

```svelte
<!--- copy: false  --->
{#portal key}...{/portal}
```

```svelte
<!--- copy: false  --->
{@portal key}
```

Portals allow you to render markup and components into a different location in the DOM, rather than where they are defined in the template. Use cases include:

- Declaring UI placeholders in a common parent layout and filling them declaratively inside page components
- Portaling content to a DOM element that is outside your app and therefore outside Svelte's control
- Creating UI elements like modals, tooltips, notifications, and dropdowns that need to break out of their parent container's styles (though in many such cases you should prefer HTML-native solutions such as the `<dialog>` element or the `popover` attribute)

A portal is declared using the `{#portal ...}` block:

```svelte
{#portal portalKeyOrDomElement}
	contents that go elsewhere
{/portal}
```

Svelte supports portaling to either a declared `{@portal ...}` outlet using a key, or directly to a DOM element.

If the target DOM element doesn't exist or no `{@portal ...}` tag renders its key, the `{#portal ...}` block will not render its contents.

## Portals with keys

To link a `{#portal}` block to a destination elsewhere in your markup, use any non-nullish value as a portal key. This is the recommended approach as it supports Server-Side Rendering (SSR).

<!-- codeblock:start {"title":"Portals"} -->
```svelte
<!--- file: App.svelte --->
<main>
	<h1>Home Page</h1>

	{#portal 'footer'}
		<p>This content is portaled to the footer</p>
	{/portal}
</main>

<footer>
	{@portal 'footer'}
</footer>
```
<!-- codeblock:end -->

The content inside the `{#portal 'footer'}` block is moved and rendered at the exact position of the `{@portal 'footer'}` tag.

### Ordering and scope

The `{#portal ...}` block and its corresponding `{@portal ...}` outlet do not need to be declared in any specific order in the template, and they can be inside different components. 

If you need a key that cannot collide with another string, use a regular JavaScript object or symbol and pass it to child components as a prop, retrieve it from [context](context), or export it to share it across your application.

Here's an example where two pages portal content to a common layout:

<!-- codeblock:start {"title":"Layout with portaled content from page"} -->
```svelte
<!--- file: App.svelte --->
<script module>
	import { createContext } from 'svelte';

	const [getPortalKey, setPortalKey] = createContext();
	export { getPortalKey };
</script>

<script>
	import PageA from './PageA.svelte';
	import PageB from './PageB.svelte';

	const portalKey = Symbol('portal');
	setPortalKey(portalKey);

	let Page = $state(PageA);
</script>

<div>
	{@portal portalKey}
</div>

<button onclick={() => Page = Page === PageA ? PageB : PageA}>switch page</button>

<Page />
```

```svelte
<!--- file: PageA.svelte --->
<script>
	import { getPortalKey } from './App.svelte';
</script>

{#portal getPortalKey()}
	on page A
{/portal}

<p>Contents of page A</p>
```

```svelte
<!--- file: PageB.svelte --->
<script>
	import { getPortalKey } from './App.svelte';
</script>

{#portal getPortalKey()}
	on page B
{/portal}

<p>Contents of page B</p>
```
<!-- codeblock:end -->

## Portals with DOM elements

Alternatively, you can portal content directly into a DOM element by passing the element reference as the target of the `{#portal ...}` block:

<!-- codeblock:start {"title":"Portals"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let target = $state(null);
</script>

<div class="container" bind:this={target}>
	<p>Existing static content</p>
</div>

{#portal target}
	<p>This content is appended inside the container div.</p>
{/portal}
```
<!-- codeblock:end -->

When targeting a DOM element, Svelte will insert the portaled contents directly inside that element.

> [!NOTE] Portals targeting DOM elements are client-only. Because DOM elements are not available during server-side rendering, these portal blocks are skipped on the server and will only render once the component mounts in the browser.

## Portal behavior

If multiple `{#portal ...}` blocks target the same `{@portal ...}` outlet, they will appear in the order they are created within the outlet.

<!-- codeblock:start {"title":"Multiple portals targeting one outlet"} -->
```svelte
<!--- file: App.svelte --->
{#portal 'target'}
	a
{/portal}

{#portal 'target'}
	b
{/portal}

<!-- shows "ab" -->
{@portal 'target'}
```
<!-- codeblock:end -->

DOM events fired within a `{#portal ...}` block bubble up the DOM tree, not the Svelte component tree.

<!-- codeblock:start {"title":"Portal event bubbling"} -->
```svelte
<!--- file: App.svelte --->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onclick={() => console.log('i will not be reached')}>
	{#portal 'target'}
		<button>click me</button>
	{/portal}
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onclick={() => console.log('i will fire')}>
	{@portal 'target'}
</div>
```
<!-- codeblock:end -->

When retrieving something from Svelte's context, the context is relative to the `{#portal ...}` location, _not_ the `{@portal ...}` location:

<!-- codeblock:start {"title":"Portal context"} -->
```svelte
<!--- file: App.svelte --->
<script module>
	import { createContext } from 'svelte';

	const [get, set] = createContext();
	export { get, set };
</script>

<script>
	import Child from './Child.svelte';

	set('value', 'foo');
</script>

{@portal 'portal'}
```

```svelte
<!--- file: Child.svelte --->
<script>
	import { set } from './App.svelte';
	import PortalContent from './PortalContent.svelte';

	set('value', 'bar');
</script>

{#portal 'portal'}
	<PortalContent />
{/portal}	
```

```svelte
<!--- file: PortalContent.svelte --->
<script>
	import { get } from './App.svelte';

	const value = get();
</script>

<!-- this will show 'bar', not 'foo' -->
{value}	
```
<!-- codeblock:end -->
