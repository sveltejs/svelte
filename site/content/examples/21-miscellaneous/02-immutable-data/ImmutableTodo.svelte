<svelte:options immutable/>

<script>
	import { afterUpdate } from 'svelte';
	import flash from './flash.js';

	export let todo;
	export let toggle;

	let div;

	afterUpdate(() => {
		flash(div);
	});
</script>

<!-- the text will flash red whenever
		the `todo` object changes -->
<div bind:this={div} on:click>
	{todo.done ? '👍': ''} {todo.text}
</div>

<style>
	div {
		cursor: pointer;
		line-height: 1.5;
	}
</style>
