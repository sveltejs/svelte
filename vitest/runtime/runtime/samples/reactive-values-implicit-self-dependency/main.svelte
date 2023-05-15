<script>
	export let num = 1;

	$: max = Math.max(num, max || 0);
</script>

<p>{num} / {max}</p>