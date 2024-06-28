<script>
	let playbackRate = $state(0.5);
</script>

<audio bind:playbackRate></audio>
<button onclick={() => (playbackRate += 1)}>increment</button>
