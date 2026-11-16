<script lang="ts">
	let { input, load }: { input: number; load: (value: number) => Promise<number> } = $props();
	let local = $state(0);
	function created() {
		console.log('created');
		return 'stable';
	}

	const value = $derived(await load(input));
	const initial = value;
	const double = $derived(value * 2);
</script>

<button onclick={() => local++}>edit local state</button>
<p>{value}/{double}/{initial}/{local}</p>
{#if value >= 0}<i>{created()}</i>{/if}
