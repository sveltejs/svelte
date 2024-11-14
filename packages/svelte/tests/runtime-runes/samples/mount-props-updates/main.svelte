<script>
	import { createClassComponent } from 'svelte/legacy';
	import Component from './component.svelte';
	import { mount, onMount } from 'svelte';

	let div1, div2;
	let legacy;
	const props = $state({ foo: 'foo', baz: 'baz' });

	onMount(() => {
		legacy = createClassComponent({
			component: Component,
			target: div1,
			props: { foo: 'foo', baz: 'baz' }
		});
		mount(Component, { target: div2, props });
	});
</script>

<button
	onclick={() => {
		legacy.$set({ foo: 'foo', bar: 'bar', baz: 'baz', buz: 'buz' });
		props.foo = 'foo';
		props.bar = 'bar';
		props.baz = 'baz';
		props.buz = 'buz';
	}}>reset</button
> {props.foo} {props.bar} {props.baz} {props.buz}
<div bind:this={div1}></div>
<div bind:this={div2}></div>
