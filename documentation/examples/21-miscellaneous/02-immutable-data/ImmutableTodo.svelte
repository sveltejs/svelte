<svelte:options immutable />

<script>
	import { afterUpdate } from 'svelte';
	import flash from './flash.js';

	export let todo;

	let div;

	afterUpdate(() => {
		flash(div);
	});
</script>

<!-- le texte clignote en rouge quand
     l'objet `todo` change -->
<div bind:this={div} on:click>
	{todo.done ? '👍' : ''}
	{todo.text}
</div>

<style>
	div {
		cursor: pointer;
		border: none;
		background: none;
		font-size: 14px;
	}
</style>
