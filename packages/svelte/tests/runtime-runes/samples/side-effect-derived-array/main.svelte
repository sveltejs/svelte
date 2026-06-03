<script>
	let visibleExternal = $state(false);
	let external = $state([]);
	const throws = $derived.by(() => {
		external.push(1);
		return external;
	});

	let visibleInternal = $state(false)
	const works = $derived.by(() => {
		let internal = $state([]);
		internal.push(1);
		return internal;
	});
</script>

<button onclick={() => (visibleExternal = true)}>external</button>
{#if visibleExternal}
	{throws}
{/if}
<button onclick={() => (visibleInternal = true)}>internal</button>
{#if visibleInternal}
	{works}
{/if}

