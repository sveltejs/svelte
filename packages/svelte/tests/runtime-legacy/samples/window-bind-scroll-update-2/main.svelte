<script>
	import Child from './Child.svelte';

	let show = false;
</script>

<div style='width: 100%; height: 9999px;'></div>

<button on:click={() => show = !show}>toggle</button>

{#if show}
	<Child />
{/if}
