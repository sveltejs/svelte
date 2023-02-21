<script>
	import Nested from './Nested.svelte';
	export let condition;
</script>

<Nested>
	{#if condition}
		<span>test</span>
	{:else}
		<svelte:fragment>
			<div>test</div>
		</svelte:fragment>
	{/if}
</Nested>