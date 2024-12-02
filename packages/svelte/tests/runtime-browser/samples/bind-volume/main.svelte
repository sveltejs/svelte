<script>
	let volume = $state(0.1);
</script>

<audio bind:volume></audio>
<button onclick={() => (volume += 0.1)}>increment</button>
