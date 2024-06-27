<script>
	let muted = $state(false);
</script>

<audio bind:muted></audio>
<button onclick={() => (muted = !muted)}>toggle</button>
