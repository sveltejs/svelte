<script>
	import Nested from './Nested.svelte';
	export let condition;
</script>

<Nested>
	{#if condition}
		<svelte:fragment slot="a">
			<div>test</div>
		</svelte:fragment>
		<svelte:fragment slot="a">
			<div>test</div>
		</svelte:fragment>
	{/if}
</Nested>