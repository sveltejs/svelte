<script>
	import { afterUpdate } from 'svelte';
	import flash from './flash.js';

	export let todo;

	let btn;

	afterUpdate(() => {
		flash(btn);
	});
</script>

<!-- the text will flash red whenever
		the `todo` object changes -->
<button bind:this={btn} on:click>
	{todo.done ? '👍' : ''}
	{todo.text}
</button>

<style>
	button {
		cursor: pointer;
		border: none;
		background: none;
		font-size: 14px;
	}
</style>
