<script lang="ts">
	import Child from './Child.svelte';

	const { environment }: { environment: 'server' | 'browser' } = $props();
</script>

<svelte:boundary>
	<Child {environment} />

	{#snippet pending()}
		<p>loading</p>
	{/snippet}
</svelte:boundary>
