<script>
	export let count = 0;

	$: if (count >= 10) {
		count = 9;
	}
</script>

<p>count: {count}</p>