<script>
	import Child from './Child.svelte';

	let object = { x: 42 };
</script>

<button on:click={() => object = { x: 42 }}>update</button>

<Child x={object.x} />
