<script>
	export let coords;
	export let numbers;

	$: [x, y] = coords;
	$: ({ answer } = numbers);
</script>

<p>{x},{y}</p>
<p>{answer}</p>