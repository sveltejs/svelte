<script>
	export let foo;
	export let bar;

	$: {
		if (foo.x !== bar.x) {
			throw new Error('mismatch');
		}
	}
</script>

<div>{foo.x}</div>