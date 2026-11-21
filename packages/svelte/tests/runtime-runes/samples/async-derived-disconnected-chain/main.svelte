<script lang="ts">
	import Row from './Row.svelte';

	const { promise, resolve } = Promise.withResolvers<string>();
	let show = $state(false);
</script>

<button onclick={() => (show = !show)}>toggle</button>
<button onclick={() => resolve('resolved')}>resolve</button>

<svelte:boundary>
	<p>{await promise}</p>
	{#snippet pending()}<p>loading</p>{/snippet}
</svelte:boundary>

{#if show}
	<Row />
{/if}
