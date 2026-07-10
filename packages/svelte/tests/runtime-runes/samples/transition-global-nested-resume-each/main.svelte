<script>
	import { fade } from 'svelte/transition';

	let fetching = $state(false);
	let items = $state(['a', 'b', 'c']);
</script>

<button onclick={() => (items = items.filter((i) => i !== 'b'))}>remove</button>
<button onclick={() => (fetching = !fetching)}>fetch</button>

{#if fetching}
	<p>loading</p>
{:else}
	<div transition:fade={{ duration: 100 }}>
		{#each items as item (item)}
			<div class="item" transition:fade|global={{ duration: 100 }}>{item}</div>
		{/each}
	</div>
{/if}
