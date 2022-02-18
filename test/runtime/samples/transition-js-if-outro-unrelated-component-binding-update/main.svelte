<script>
	import Component from "./Component.svelte";
	let condition = true;
</script>

{#if condition}
	<Component bind:condition />
{/if}
