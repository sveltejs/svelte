<script>
	import Nested from "./Nested.svelte";
	export let condition;
</script>

<Nested>
	{#if condition}
		<svelte:fragment>
			<div>test</div>
		</svelte:fragment>
		<span>test</span>
	{/if}
</Nested>
