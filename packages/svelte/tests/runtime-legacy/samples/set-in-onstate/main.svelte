<script>
	export let foo = 1;
	export let bar;

	$: {
		bar = foo * 2;
	}
</script>

<p>{foo}</p>
<p>{bar}</p>
