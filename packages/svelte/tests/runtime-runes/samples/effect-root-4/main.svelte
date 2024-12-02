<script>
	$effect.root(() => {
		console.log('effect1');
	});
	const cleanup = $effect.root(() => {
		console.log('effect2');
	});
</script>

<button onclick={cleanup}>cleanup</button>
