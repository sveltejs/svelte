<script>
	let foo = 0;
	let bar;
	$: {
		bar = foo + 1;
		if (foo) {
			break $;
		}
		bar = foo + 2;
	}
	foo = 1;
</script>

<h1>{foo} {bar}</h1>