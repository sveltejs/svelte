<script>
	let x = $state(0);

	const cleanup = $effect.root(() => {
		console.log(x);
		return () => console.log('cleanup');
	});
</script>

<button onclick={() => x++}>{x}</button>
<button onclick={cleanup}>cleanup</button>
