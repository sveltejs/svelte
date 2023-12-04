<script>
	export let x = 42

	let a;
	let b;

	$: a = b;
	$: b = (function(a) {
		return a;
	}(x));
</script>

<p>{a} {b}</p>