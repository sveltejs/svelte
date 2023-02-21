<script>
	import Nested from './Nested.svelte';
	export let condition;
</script>

<Nested>
	{#if condition}
		<span>test</span>
	{/if}
	{#if condition}
		<svelte:fragment slot="default">
			<div>test</div>
		</svelte:fragment>
	{/if}
</Nested>