<script>
	let obj = $state({ a: 0 });
	let count = $state(0);
	let doubled = $derived(count * 2);

	console.log(obj);
	console.log(count);
	console.log(doubled);
</script>

<button on:click={() => count += 1}>
	clicks: {count}
</button>
