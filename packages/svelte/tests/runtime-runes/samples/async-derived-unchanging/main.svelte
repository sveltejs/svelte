<script>
	import Component from './Component.svelte';
</script>

<svelte:boundary>
	<Component />

	{#snippet pending()}
		<p>pending...</p>
	{/snippet}
</svelte:boundary>
