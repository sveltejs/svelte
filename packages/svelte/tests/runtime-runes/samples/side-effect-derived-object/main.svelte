<script>
	let visibleExternal = $state(false);
	let external = $state({ v: 1 });
	const throws = $derived.by(() => {
		external.v = 2;
		return external;
	});

	let visibleInternal = $state(false)
	const works = $derived.by(() => {
		let internal = $state({ v: 1 });
		internal.v = 2;
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

