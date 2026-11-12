<script>
	import View from './View.svelte';

	let selected = $state('a');
	let version = $state(0);
	const summary = $derived(await Promise.resolve(`${selected} v${version}`));
	const pending = [];

	function load(id, version) {
		if (id === 'a' && version === 0) return 'a data v0';
		return new Promise(resolve => pending.push(() => resolve(`${id} data v${version}`)));
	}
</script>

<p>summary: {summary} (version is {version})</p>
<button onclick={() => version++}>refresh</button>
<button onclick={() => selected = 'b'}>open b</button>
<button onclick={() => pending.shift()?.()}>resolve first</button>
<button onclick={() => pending.pop()?.()}>resolve last</button>
<button onclick={() => { selected = 'a'; version = 0; pending.length = 0; }}>reset</button>
{#each [selected] as id (id)}
	<svelte:boundary>
		<View {id} {version} {load} />
		{#snippet pending()}<p>loading {id}</p>{/snippet}
	</svelte:boundary>
{/each}
