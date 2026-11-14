<script>
	let { slow, ask } = $props();

	let project = $state({ name: 'Garden' });
	let shared = $state(0);
	let asked = $state(0);

	function leave() {
		project = undefined;
		shared++;
		asked++;
	}

	function refresh() {
		shared++;
	}
</script>

<button onclick={leave}>leave</button>
<button onclick={refresh}>refresh</button>
<button onclick={() => project = { name: 'Garden' }}>restore</button>

{#if project}
	<span>{await ask(project?.name, shared)}</span>
{:else}
	<span>{await slow(asked)}</span>
	<p>Inbox {shared}</p>
{/if}
