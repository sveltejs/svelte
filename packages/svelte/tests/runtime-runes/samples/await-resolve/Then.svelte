<script>
	let { value } = $props();

	$effect(() => {
		console.log('mounting Then.svelte');
	});
</script>

<p>then {value}</p>
