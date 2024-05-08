<script>
	let value = $state(false);
	const fn = () => {
		if ($effect.active()) {
			$effect(() => {
				value = true;
			});
		}
		return value;
	};

	let outer = $state(false);
	let inner = $state(false);
	let v = $derived(inner ? fn() : false);
</script>

<button onclick={() => outer = !outer}>
	toggle outer
</button>

<button onclick={() => inner = !inner}>
	toggle inner
</button>

<button onclick={() => outer = inner = value = false}>
	reset
</button>

{#if outer && v}
	<p>v is true</p>
{/if}
