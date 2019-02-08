<script>
	export let a = 1;
	export let doubled;

	$: doubled = a * 2;
</script>

<p>doubled: {doubled}</p>