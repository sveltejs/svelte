<script>
	import { fade } from 'svelte/transition';

	let fetching = $state(false);
	let shown = $state(true);
</script>

<button onclick={() => (shown = false)}>hide</button>
<button onclick={() => (fetching = !fetching)}>fetch</button>

{#if fetching}
	<p>loading</p>
{:else}
	<div transition:fade={{ duration: 100 }}>
		{#if shown}
			<div class="red" transition:fade|global={{ duration: 100 }}>red</div>
		{/if}
	</div>
{/if}
