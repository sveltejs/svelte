<script>
	function box(value) {
		let state = $state(value);

		return {
			get value() {
				return state
			},
			set value(v) {
				state = v;
			}
		}
	}

	let count = box(0);
</script>

{#snippet counter(c)}
	{#if c}
  		<button on:click={() => (c.value += 1)}>{c.value}</button>
	{:else}
		<p>fallback</p>
	{/if}
{/snippet}

{@render counter()}
{@render counter(count)}
