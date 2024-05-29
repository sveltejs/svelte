<script>
	const obj = {};
	const a = $state(obj)
	const b= $state(obj)
</script>

<p>{a === obj}</p>
<p>{$state.is(a, obj)}</p>
<p>{a === b}</p>
<p>{$state.is(a, b)}</p>
