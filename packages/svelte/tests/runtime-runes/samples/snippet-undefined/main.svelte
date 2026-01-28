<script>
  let state = $state({
		value: counter
	});
</script>

{#snippet counter()}
  Test
{/snippet}

{@render state.value()}

<button onclick={() => state.value = undefined}>change</button>
