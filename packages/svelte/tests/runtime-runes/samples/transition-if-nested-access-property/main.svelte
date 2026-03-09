<script>
	import { fade } from 'svelte/transition';

	let data = $state({ id: 1 });
</script>

<button onclick={() => (data = null)}>clear</button>

{#if data}
	{#key data?.id}
		<p transition:fade|global={{ duration: 100 }}>keyed</p>
	{/key}

	{#if data.id}
		<p>sibling</p>
	{/if}
{/if}