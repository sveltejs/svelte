<svelte:options immutable />

<script>
	import { afterUpdate, beforeUpdate } from 'svelte';

	export let todo;

	let btn;

	$: console.log('$:'+ todo.id);

	beforeUpdate(() => {
		console.log('beforeUpdate:'+ todo.id);
	})

	afterUpdate(() => {
		console.log('afterUpdate:'+ todo.id);
	});
</script>

<button bind:this={btn} on:click>
	{todo.done ? 'X' : ''}
	{todo.id}
</button>
