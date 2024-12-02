<script>
	import Await from './await.svelte';

	let promise = $state();
</script>

<button onclick={() => (promise = null)}>Clear</button>
<button onclick={() => (promise = Promise.resolve())}>Immediate</button>
<button onclick={() => (promise = new Promise((r) => setTimeout(r, 100)))}>Takes time</button>

{#if promise}
	<Await {promise} />
{/if}
