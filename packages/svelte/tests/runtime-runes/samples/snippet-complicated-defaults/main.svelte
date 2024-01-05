<script>
	function box(value) {
		let state = $state(value);
		return {
			get value() {
				return state
			},
			set value(v) {
				state = v
			}
		}
	}

  let count = box(0);
	let fallback_count = box(0);
	let toggle_state = $state(false);
</script>

{#snippet counter(c = count)}
	<p id="count">Count: {count.value}</p>
	<p id="fallback-count">Fallback count: {fallback_count.value}</p>
  <button id="increment" on:click={() => (c.value += 1)}>Click to change referenced state value</button>
	<button id="change-ref" on:click={() => toggle_state = !toggle_state}>Click to change state reference</button>
{/snippet}

{@render counter(toggle_state ? fallback_count : undefined)}
