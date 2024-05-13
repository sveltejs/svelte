<script>
	export let primitive;
	export let object;
	$: primitive && console.log('primitive');
	$: object && console.log('object');
</script>
