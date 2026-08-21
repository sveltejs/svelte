<script>
	let visibleExternal = $state(false);
	let external = $state(1);
	const throws = $derived.by(() => {
		external = 2;
		return external;
	});

	let visibleInternal = $state(false);
	const works = $derived.by(() => {
		let internal = $state(1);
		internal = 2;
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

