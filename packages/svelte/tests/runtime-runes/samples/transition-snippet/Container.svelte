<script>
	/** @type {{ children: import('svelte').Snippet }} */
	let { children } = $props();

	let visible = $state(false);
</script>

<button onclick={() => visible = !visible}>toggle</button>

{#if visible}
	{@render children()}
{/if}
