<script>
	const a = {};
	const b = {};
	$: b.foo = a.foo;
</script>

<button on:click={() => a.foo = 42}>Mutate a</button>
<div>{JSON.stringify(b)}</div>

