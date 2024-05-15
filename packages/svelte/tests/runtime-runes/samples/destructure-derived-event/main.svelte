<script>
	let structured = $state({
		handler() {
			console.log('works!')
		}
	});
</script>

{#if structured}
  {@const { handler } = structured}

  <button onclick={() => handler()}>click me</button>
{/if}
