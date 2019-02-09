<script>
	export let x;

	let a;
	let b;

	$: a = b;
	$: b = x;
</script>