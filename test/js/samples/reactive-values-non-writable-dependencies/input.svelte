<script>
	export let a = 1;
	export let b = 2;

	$: console.log('max', Math.max(a, b));
</script>