<script>
	export let a = 1;
	export let b = 2;
	let c;

	let count = 0;

	$: {
		c = a + b;
		count = count + 1;
	}
</script>

<p>{a} + {b} = {c}</p>
<p>Times calculated: {count}</p>