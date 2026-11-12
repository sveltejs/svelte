<script>
	import Thrower from './Thrower.svelte';
	let { browser } = $props();
	let Comp = $derived(browser ? Thrower : null);
</script>

<svelte:boundary>
	<Comp />

	{#snippet failed(error)}
		<p>failed: {error.message}</p>
	{/snippet}
</svelte:boundary>

<section><span>after</span></section>
