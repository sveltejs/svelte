<script>
	import Empty from './Empty.svelte';
	let active = true;
</script>

<button on:click={() => active = false }>destroy component</button>

<svelte:component this={active ? Empty : null} />
