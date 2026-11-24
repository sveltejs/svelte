<script>
	let { x, push } = $props();

	let first = $derived(await push('first', x));
	let second = $derived(await push('second', x));

	console.log(`continued with ${first} ${second}`);
</script>

<p>{first} {second}</p>
