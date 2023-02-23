<script>
	import CustomComponent from './CustomComponent.svelte';
	let show = true;
</script>

<button on:click={() => show = !show}>Show/Hide</button>

{#if show}
	<div id="show">
		<CustomComponent />
	</div>
{/if}
