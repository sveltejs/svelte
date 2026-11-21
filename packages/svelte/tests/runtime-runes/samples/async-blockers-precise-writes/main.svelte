<script lang="ts">
	import Child from './Child.svelte';

	const { promise, resolve } = Promise.withResolvers<number>();
</script>

<button onclick={() => resolve(42)}>resolve</button>

<svelte:boundary>
	<Child {promise} />

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
