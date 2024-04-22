<script>
	let x = $state(0);
	let y = $state(0);

	const cleanup = $effect.root(() => {
		$effect(() => {
			console.log(x);
		});

		const nested_cleanup = $effect.root(() => {
			return () => {
				console.log('cleanup 2');
			}
		});

		return () => {
			console.log('cleanup 1');
			nested_cleanup();
		}
	});
</script>

<button onclick={() => x++}>{x}</button>
<button onclick={() => y++}>{y}</button>
<button onclick={cleanup}>cleanup</button>
