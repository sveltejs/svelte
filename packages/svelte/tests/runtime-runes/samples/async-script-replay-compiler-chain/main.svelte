<script lang="ts">
	let input = $state(1);
	let edits = $state(0);

	function load(site: string, value: number) {
		console.log(['load', site, value]);
		return Promise.resolve(value + 1);
	}

	function snapshot_of(value: number) {
		console.log(['snapshot', value]);
		return value;
	}

	function installed() {
		console.log(['installed']);
		return 'stable';
	}

	let a = $derived(await load('a', input));
	let doubled = $derived(a * 2);
	const snapshot = snapshot_of(a);
	let b = $derived(await load('b', doubled + snapshot));
</script>

<button onclick={() => input++}>update</button>
<button onclick={() => edits++}>edit local state</button>
<output>
	{#if b}
		<p data-instance={installed()}>{a} {doubled} {snapshot} {b} {edits}</p>
	{/if}
</output>
