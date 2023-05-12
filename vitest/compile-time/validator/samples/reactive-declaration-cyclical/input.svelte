<script>
	let a = 1;
	let b = 2;

	$: a = b + 1;
	$: b = a + 1;
</script>