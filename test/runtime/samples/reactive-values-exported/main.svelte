<script>
	export let x, y

	$: y = x;

	export let z;
	$: z = x;
</script>

<p>{x} {y} {z}</p>
