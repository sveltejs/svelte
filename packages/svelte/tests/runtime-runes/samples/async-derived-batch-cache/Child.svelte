<script>
	let { revision, delay } = $props();
	const assessment = $derived(await delay('assessment', revision));
	// Keep the batch pending while the if blocks read parity.
	const schedule = $derived(await delay('schedule', assessment));
	const parity = $derived.by(() => {
		console.log(['parity', assessment]);
		return assessment % 2;
	});
	const matched = $derived.by(() => {
		console.log(['matched', assessment, schedule]);
		return assessment === schedule;
	});
</script>

<p>{assessment}/{parity}</p>
{#if parity}<p>odd</p>{/if}
{#if schedule >= 0 && parity}<p>also odd</p>{/if}
{#if matched}<p>matched</p>{/if}
<button onclick={() => console.log(['read', parity])}>read parity</button>
