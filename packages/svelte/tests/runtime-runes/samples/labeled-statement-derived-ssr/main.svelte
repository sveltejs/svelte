<script>
	let value = $derived(false);
	let result = 'correct';

	label: if (value) result = 'wrong';
</script>

<p>{result}</p>
