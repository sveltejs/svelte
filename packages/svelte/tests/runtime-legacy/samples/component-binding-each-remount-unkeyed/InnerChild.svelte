<script>
	export let val = 1;
	export let increment;

	$: {
		increment();
	}
</script>

<inner>
	{val}
</inner>