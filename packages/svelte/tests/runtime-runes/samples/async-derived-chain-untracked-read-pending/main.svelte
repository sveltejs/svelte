<script lang="ts">
	import Row from './Row.svelte';
	import { stats } from './stats.js';

	let show = $state(false);
	let runs = $state('');

	// keeps another batch pending while the row mounts
	const { promise } = Promise.withResolvers<void>();

	function mount() {
		stats.runs = 0;
		show = true;
	}
</script>

<button onclick={mount}>show</button>
<button onclick={() => (runs = String(stats.runs))}>runs</button>

<svelte:boundary>
	{await promise}
	{#snippet pending()}{/snippet}
</svelte:boundary>

{#if show}
	<Row />
{/if}

<output>{runs}</output>
