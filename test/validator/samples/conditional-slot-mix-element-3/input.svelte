<script>
	import Nested from './Nested.svelte';
	export let condition;
</script>

<Nested>
	{#if condition}
		<span>test</span>
	{/if}
	{#if condition}
		<svelte:fragment slot="bar">
			<div>test</div>
		</svelte:fragment>
		<svelte:fragment slot="foo">
			<div>test</div>
		</svelte:fragment>
	{/if}
</Nested>