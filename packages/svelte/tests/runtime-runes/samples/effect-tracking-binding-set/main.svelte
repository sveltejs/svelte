<script>
	let bar = $state('');

	const foo = {
		set bar(v) {

			console.log($effect.tracking());

			bar = v;
		},
		get bar() {
			return bar;
		}
	}

	let input;

	$effect(() => {
		input.value = 'everybody';
		input.dispatchEvent(new window.Event('input'));
	})
</script>

<input type="text" bind:value={foo.bar} bind:this={input}>
