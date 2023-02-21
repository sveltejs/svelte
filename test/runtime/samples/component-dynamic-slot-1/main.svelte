<script>
	import Nested from './Nested.svelte';
	export let value;
</script>

<Nested>
	{#if value === 1}
		<svelte:fragment>One</svelte:fragment>
	{:else if value === 2}
		<svelte:fragment>Two</svelte:fragment>
	{/if}
</Nested>
