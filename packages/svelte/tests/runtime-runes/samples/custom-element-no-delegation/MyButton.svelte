<svelte:options customElement={{ tag: 'my-button' }} />

<script>
	let count = $state(0);
</script>

<button onclick={() => count++}>clicks: {count}</button>
