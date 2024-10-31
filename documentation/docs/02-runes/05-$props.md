---
title: $props
---

The inputs to a component are referred to as _props_, which is short for _properties_. You pass props to components just like you pass attributes to elements:

```svelte
<script>
	import MyComponent from './MyComponent.svelte';
</script>

/// file: App.svelte
<MyComponent adjective="cool" />
```

On the other side, inside `MyComponent.svelte`, we can receive props with the `$props` rune...

```svelte
<script>
	let props = $props();
</script>

/// file: MyComponent.svelte
<p>this component is {props.adjective}</p>
```

...though more commonly, you'll [_destructure_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) your props:

```svelte
/// file: MyComponent.svelte
<script>
	let +++{ adjective }+++ = $props();
</script>

<p>this component is {+++adjective+++}</p>
```

## Fallback values

Destructuring allows us to declare fallback values, which are used if the parent component does not set a given prop:

```js
/// file: MyComponent.svelte
let { adjective = 'happy' } = $props();
```

> [!NOTE] Fallback values are not turned into reactive state proxies (see [Updating props](#Updating-props) for more info)

## Renaming props

We can also use the destructuring assignment to rename props, which is necessary if they're invalid identifiers, or a JavaScript keyword like `super`:

```js
let { super: trouper = 'lights are gonna find me' } = $props();
```

## Rest props

Finally, we can use a _rest property_ to get, well, the rest of the props:

```js
let { a, b, c, ...others } = $props();
```

## Updating props

References to a prop inside a component update when the prop itself updates — when `count` changes in `App.svelte`, it will also change inside `Child.svelte`. But the child component is able to temporarily override the prop value, which can be useful for unsaved ephemeral state ([demo](/playground/untitled#H4sIAAAAAAAAE6WQ0WrDMAxFf0WIQR0Wmu3VTQJln7HsIfVcZubIxlbGRvC_DzuBraN92qPula50tODZWB1RPi_IX16jLALWSOOUq6P3-_ihLWftNEZ9TVeOWBNHlNhGFYznfqCBzeRdYHh6M_YVzsFNsNs3pdpGd4eBcqPVDMrNxNDBXeSRtXioDgO1zU8ataeZ2RE4Utao924RFXQ9iHXwvoPHKpW1xY4g_Bg0cSVhKS0p560Za95612ZC02ONrD8ZJYdZp_rGQ37ff_mSP86Np2TWZaNNmdcH56P4P67K66_SXoK9pG-5dF5Z9QEAAA==)):

<!-- prettier-ignore -->
```svelte
/// file: App.svelte
<script>
	import Child from './Child.svelte';

	let count = $state(0);
</script>

<button onclick={() => (count += 1)}>
	clicks (parent): {count}
</button>

<Child {count} />
```

<!-- prettier-ignore -->
```svelte
/// file: Child.svelte
<script>
	let { count } = $props();
</script>

<button onclick={() => (count += 1)}>
	clicks (child): {count}
</button>
```

Prop variables are not automatically deeply reactive. What happens when mutating one of their properties depends on what the parent passed in. For example if the parent passed a non-reactive POJO as a prop, setting a property of that object in the child will not cause the component to update ([demo](/playground/untitled#H4sIAAAAAAAAE3VPS07DMBC9yshCaiuqBLYhjoQ4Q1eEReJOVIMztuJJBbJ8d-IkEqXQ5bx53yCo6VEU4kCs2eBR7EWnDXpRvAbBXy79EjDhK_PZucyf0XDC2sbjf7iyxEg82YjSq0E7rmqqWffODgwvJ22O0A22h02Wz9cq3TzVVOY_CioXrm3fUbEMQdmRuICHGCGvpiDGTxYFDyPG_Y3Cl_6_K199bpQ2yBDWBhBBwp0brPPb3Z-u7chsCSwpo9WHDNsdyApCMslzODUeyAJ23WSUsMUymyfBvYTHmmKcI2e9LyBcUmKKWyKulr_Fb2Z_SHPIAQAA)):

```svelte
<--- file: App.svelte --->
<script>
	import Child from './Child.svelte';

	let object = $state({count: 0});
</script>

<Child {object} />
```

```svelte
<--- file: Child.svelte --->
<script>
	let { object } = $props();
</script>

<button onclick={() => {
	// has no effect
	object.count += 1
}}>
	clicks: {object.count}
</button>
```

However if the value passed in by the parent component is itself a deeply reactive state object, then it will be deeply reactive in the child, too ([demo](/playground/untitled#H4sIAAAAAAAAE3WQwU7DMBBEf2VlITUVVQLXkERC_YaeCIfE2aoujm3FGwqy_O_YcSug0KNnx7Nv1jHVjchKtlMkSOLANmwvJFpWvjhGnybOohD0s_PZmNy-o6So9Z3F_3SuFaGiEMMqyydhqGlVS2I0eiLYHoQcYD_pEVZ5sbzOX1dPwRaMEgl0f0ROUMOdpY4wc1zPikp48OvgqorvXFWlRJe-eCiawED4QaykaUa_udHl5-rfba4mN_pETHcB9RHVTNrY7C9gPxNpBVpxKfhb7bI11A24GFIUcBJSAu9mi0AHhKUo9Cj1CUjDbIbQP1rTpjzN72t4bJX3C8kSa8vLCZLFR4q0-eogr_4LN7sC9foBAAA=)):

```svelte
<--- file: App.svelte --->
<script>
	import Child from './Child.svelte';

	let object = $state({count: 0});
</script>

<Child {object} />
```

```svelte
<--- file: Child.svelte --->
<script>
	let { object } = $props();
</script>

<button onclick={() => {
	// will cause the count below to update
	object.count += 1
}}>
	clicks: {object.count}
</button>
```

The fallback value of a prop not declared with `$bindable` is treated like a non-reactive POJO, and therefore also doesn't update the component when mutating its properties.

```svelte
<--- file: Child.svelte --->
<script>
	let { object = { count = 0 } } = $props();
</script>
<button onclick={() => {
	// has no effect if the fallback value is used
	object.count += 1
}}>
	clicks: {object.count}
</button>
```

In general, mutating props is discouraged, instead use callback props to make it easier to reason about state and changes to that state. If parent and child should share (and be allowed to mutate) the same object, then use the [$bindable]($bindable) rune.

## Type safety

You can add type safety to your components by annotating your props, as you would with any other variable declaration. In TypeScript that might look like this...

```svelte
<script lang="ts">
	let { adjective }: { adjective: string } = $props();
</script>
```

...while in JSDoc you can do this:

```svelte
<script>
	/** @type {{ adjective: string }} */
	let { adjective } = $props();
</script>
```

You can, of course, separate the type declaration from the annotation:

```svelte
<script lang="ts">
	interface Props {
		adjective: string;
	}

	let { adjective }: Props = $props();
</script>
```

Adding types is recommended, as it ensures that people using your component can easily discover which props they should provide.
