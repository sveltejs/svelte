<script>
	let foo = {};
	let bar = 42;
	$: foo.bar = bar;
</script>

{JSON.stringify(foo)}
