<script lang="ts">
	import Component from './Component.svelte';

	let condition = $state(false);
</script>

<button onclick={() => (condition = !condition)}>toggle</button>

<svelte:boundary>
	<Component whatever={await 1} />

	{#snippet pending()}
		<Component />
	{/snippet}
</svelte:boundary>

{#if condition}
	<p>hello</p>
{/if}
