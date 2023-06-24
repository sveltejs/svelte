<script>
	import { afterUpdate } from 'svelte';
	import flash from './flash.js';

	export let todo;

	let div;

	afterUpdate(() => {
		flash(div);
	});
</script>

<!-- the text will flash red whenever
		the `todo` object changes -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div bind:this={div} on:click role="button" tabindex='0'>
	{todo.done ? '👍' : ''}
	{todo.text}
</div>

<style>
	div {
		cursor: pointer;
		line-height: 1.5;
	}
</style>
