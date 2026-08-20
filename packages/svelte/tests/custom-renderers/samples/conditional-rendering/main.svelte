<script>
	let visible = $state(true);
</script>

{#if visible}
	<p>visible</p>
{:else}
	<p>hidden</p>
{/if}

<button onclick={() => visible = !visible}>toggle</button>
