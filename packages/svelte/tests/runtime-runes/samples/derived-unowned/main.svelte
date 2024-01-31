<script>
	import Component from "./Component.svelte";

	let show = $state(true);
</script>

<input type="checkbox" bind:checked={show} />
{#if show}
	<Component/>
{/if}
