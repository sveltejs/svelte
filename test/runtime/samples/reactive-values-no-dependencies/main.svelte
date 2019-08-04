<script>
	export let width = 100;

	const padding = 10;

	$: x1 = padding;
	$: x2 = width - padding;
</script>

<p>{x1} - {x2}</p>