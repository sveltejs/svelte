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
</script>

<input type="text" bind:value={foo.bar}>
