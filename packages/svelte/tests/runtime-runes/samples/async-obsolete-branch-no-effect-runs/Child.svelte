<script>
	let { count } = $props();
	let double = $derived(count * 2);

	$effect.pre(() => console.log(count, double));
</script>
