<script>
	const obj = {};
	const a = $state(obj)
	const b= $state(obj)

	a === obj;
	$state.is(a, obj);
	a === b;
	$state.is(a, b);
</script>
