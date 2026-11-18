<script>
	let { slow, ask } = $props();

	let items = $state([1]);
	let project = $state({ name: 'Garden' });
	let shared = $state(0);
	let other = $state(0);
	let independent = $state(0);
</script>

<button onclick={() => { items = []; project = undefined; shared++; other++; }}>leave</button>
<button onclick={() => { shared++; other++; }}>refresh both</button>
<button onclick={() => shared++}>refresh</button>
<button onclick={() => independent++}>independent</button>

{#each items as item (item)}
	<span>{await ask(project?.name, shared, independent)}</span>
{/each}
<p>{await slow(other)}</p>
