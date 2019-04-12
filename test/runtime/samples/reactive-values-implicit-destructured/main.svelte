<script>
	export let coords;

	$: [x, y] = coords;
</script>

<p>{x},{y}</p>