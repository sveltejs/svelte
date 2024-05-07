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

	let foo = $state(false)
	let bar = $derived(foo ? fn() : false);
</script>

<button onclick={() => foo = !foo}>
	toggle ({foo})
</button>

{#if bar}
	<p>bar is true</p>
{/if}
